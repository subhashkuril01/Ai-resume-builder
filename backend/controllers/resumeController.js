const Resume = require('../models/Resume');
const ResumeTest = require('../models/ResumeTest');
const { asyncHandler } = require('../middleware/errorHandler');
const {
  getOpenAIClient,
  isMockMode,
  getAIProvider,
  getAIModel,
  buildCompletionParams,
  parseAIJSON,
  getMockAI
} = require('../utils/openaiClient');
const { resumeToText, extractResumeProfile } = require('../utils/resumeProfile');

const DEFAULT_DURATION_MINUTES = 60;
const DEFAULT_OPENAI_QUESTION_COUNT = 50;
const DEFAULT_GROQ_QUESTION_COUNT = 20;

const slugifySkill = (skill = '') =>
  skill.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

const getAssessmentQuestionCount = () => {
  const configured = Number.parseInt(process.env.ASSESSMENT_QUESTION_COUNT, 10);
  if (Number.isFinite(configured) && configured >= 10 && configured <= 50) return configured;
  return getAIProvider() === 'groq' ? DEFAULT_GROQ_QUESTION_COUNT : DEFAULT_OPENAI_QUESTION_COUNT;
};

const getDifficultyDistribution = (questionCount) => {
  if (questionCount === 50) return { easy: 15, medium: 20, hard: 15 };
  const easy = Math.max(3, Math.round(questionCount * 0.3));
  const medium = Math.max(4, Math.round(questionCount * 0.4));
  return { easy, medium, hard: Math.max(3, questionCount - easy - medium) };
};

// FIX: use this for actual token budget per provider
const getAssessmentMaxTokens = (questionCount) =>
  getAIProvider() === 'groq'
    ? Math.min(5000, questionCount * 220)
    : 12000;

const inferComparison = (currentBreakdown = [], previousBreakdown = []) => {
  const previousMap = new Map(previousBreakdown.map((item) => [slugifySkill(item.skill), item]));
  const improvedSkills = [];
  const declinedSkills = [];

  currentBreakdown.forEach((item) => {
    const previous = previousMap.get(slugifySkill(item.skill));
    if (!previous) return;
    if ((item.accuracy || 0) > (previous.accuracy || 0)) improvedSkills.push(item.skill);
    if ((item.accuracy || 0) < (previous.accuracy || 0)) declinedSkills.push(item.skill);
  });

  return { improvedSkills, declinedSkills };
};

const sanitizeTest = (testDoc) => {
  const test = testDoc.toObject ? testDoc.toObject() : testDoc;
  const includeCorrectAnswers = test.status === 'submitted' && Boolean(test.report);

  return {
    ...test,
    remainingSeconds:
      test.expiresAt && !test.submittedAt
        ? Math.max(0, Math.floor((new Date(test.expiresAt).getTime() - Date.now()) / 1000))
        : test.durationMinutes * 60,
    questions: (test.questions || []).map((question) => ({
      ...question,
      correctAnswer: includeCorrectAnswers ? question.correctAnswer : undefined
    }))
  };
};

const normalizeQuestions = (questions = []) =>
  questions.map((question, index) => ({
    questionId: question.questionId || `q-${index + 1}`,
    type: 'mcq',
    skill: question.skill || 'General',
    difficulty: question.difficulty || 'medium',
    prompt: question.prompt || `Question ${index + 1}`,
    context: question.context || '',
    options: (question.options || []).map((option, optionIndex) => ({
      key: option.key || String.fromCharCode(65 + optionIndex),
      text: option.text || ''
    })),
    correctAnswer: {
      optionKey: question.correctAnswer?.optionKey || '',
      idealAnswer: question.correctAnswer?.idealAnswer || '',
      expectedConcepts: question.correctAnswer?.expectedConcepts || [],
      explanation: question.correctAnswer?.explanation || ''
    },
    evaluationRubric: question.evaluationRubric || [],
    estimatedMinutes: question.estimatedMinutes || 1,
    maxPoints: question.maxPoints || 10
  }));

const buildPromptForGeneration = (
  resume,
  profile,
  attemptNumber,
  priorPrompts = [],
  generationId = '',
  questionCount = 20
) => {
  const distribution = getDifficultyDistribution(questionCount);
  return `You are creating a strict resume-based MCQ assessment for a candidate.

Rules:
- Generate a resume assessment based ONLY on the resume evidence below.
- ALL ${questionCount} questions MUST be MCQ type with exactly 4 options (A, B, C, D).
- Do not include scenario, practical, or open-ended questions. Only MCQ.
- Do not quote the resume back verbatim.
- Do not ask trivia unrelated to the listed skills, experience, projects, education, or technologies.
- Questions must test understanding, application, debugging, tradeoff analysis, and real-world reasoning.
- Adapt difficulty to the resume strength.
- IMPORTANT: Generate completely NEW and DIFFERENT questions each time. Never repeat prior questions.
- Prior questions to avoid repeating: ${priorPrompts.length ? priorPrompts.slice(0, 150).join(' || ') : 'none'}.
- Uniqueness seed for this request: ${generationId}.
- Make the assessment clearly specific to THIS resume's skills, projects, education, and experience. Two different resumes must produce noticeably different question sets.

DIFFICULTY LEVELS - distribute questions as follows:
- Questions q-1 to q-${distribution.easy}: difficulty "easy" (basic concept recall and definitions)
- Questions q-${distribution.easy + 1} to q-${distribution.easy + distribution.medium}: difficulty "medium" (application and understanding)
- Questions q-${distribution.easy + distribution.medium + 1} to q-${questionCount}: difficulty "hard" (analysis, debugging, tradeoffs)

Resume title: ${resume.title}
Resume text:
${resumeToText(resume.content)}

Structured profile:
${JSON.stringify(profile, null, 2)}

Attempt number: ${attemptNumber}

Respond ONLY with valid JSON:
{
  "title": "string",
  "difficulty": "medium",
  "durationMinutes": 60,
  "questions": [
    {
      "questionId": "q-1",
      "type": "mcq",
      "skill": "SkillFromResume",
      "difficulty": "easy",
      "prompt": "question text",
      "context": "",
      "options": [{"key":"A","text":"..."},{"key":"B","text":"..."},{"key":"C","text":"..."},{"key":"D","text":"..."}],
      "correctAnswer": {
        "optionKey": "A",
        "idealAnswer": "",
        "expectedConcepts": ["concept1"],
        "explanation": "why this is correct"
      },
      "evaluationRubric": ["Choose the correct option."],
      "estimatedMinutes": 1,
      "maxPoints": 10
    }
  ]
}

Constraints:
- Create EXACTLY ${questionCount} MCQ questions total.
- Every single question must be type "mcq" with 4 options.
- Questions q-1 to q-${distribution.easy} must have difficulty "easy".
- Questions q-${distribution.easy + 1} to q-${distribution.easy + distribution.medium} must have difficulty "medium".
- Questions q-${distribution.easy + distribution.medium + 1} to q-${questionCount} must have difficulty "hard".
- Each question must map to a real skill, project, experience, or education from the resume.
- If the resume has limited technical content, create questions about the soft skills, experience, education, projects, or any other content mentioned.
- Avoid direct copy-paste from the resume.`;
};

const buildPromptForEvaluation = (test, resume) =>
  `You are evaluating a resume-based MCQ technical assessment.

All questions are MCQ. Score each answer by checking if the selected option matches the correct answer.

Resume:
${resumeToText(resume.content)}

Test data:
${JSON.stringify(
    {
      title: test.title,
      durationMinutes: test.durationMinutes,
      difficulty: test.difficulty,
      questions: test.questions.map((question) => ({
        questionId: question.questionId,
        type: question.type,
        skill: question.skill,
        difficulty: question.difficulty,
        prompt: question.prompt,
        options: question.options,
        correctAnswer: question.correctAnswer,
        evaluationRubric: question.evaluationRubric,
        maxPoints: question.maxPoints,
        userAnswer: question.userAnswer
      }))
    },
    null,
    2
  )}

Respond ONLY with valid JSON:
{
  "questionEvaluations": [
    {
      "questionId": "q-1",
      "score": 0,
      "isCorrect": false,
      "explanation": "why the submitted answer is correct or incorrect",
      "strengths": ["what was good"],
      "weaknesses": ["what was missing"],
      "correctApproach": "how to approach it correctly",
      "missingConcepts": ["concept1"]
    }
  ],
  "report": {
    "overallScore": 0,
    "accuracyLevel": 0,
    "logicalThinkingScore": 0,
    "problemSolvingAbility": 0,
    "strengths": ["strength 1"],
    "weakAreas": ["weak area 1"],
    "skillBreakdown": [
      {
        "skill": "React",
        "score": 0,
        "maxScore": 0,
        "accuracy": 0,
        "strengths": ["strength"],
        "weaknesses": ["weakness"]
      }
    ],
    "mistakeAnalysis": [
      {
        "questionId": "q-1",
        "skill": "React",
        "prompt": "question text",
        "submittedAnswer": "user answer",
        "explanation": "why it was wrong",
        "correctApproach": "what should have been done"
      }
    ],
    "careerFeedback": {
      "resumeImprovements": ["improvement"],
      "skillsToFocus": ["skill"],
      "learningRoadmap": ["step 1", "step 2"],
      "projectSuggestions": ["suggestion"],
      "interviewReadinessScore": 0,
      "finalSummary": "short summary"
    }
  }
}`;

// FIX: Pass questionCount into prompt builder and use getAssessmentMaxTokens for token budget
const generateWithAI = async (resume, profile, attemptNumber, priorPrompts) => {
  if (isMockMode()) {
    return getMockAI().generateResumeTest(profile, { attemptNumber, priorPrompts });
  }

  const openai = getOpenAIClient();
  const questionCount = getAssessmentQuestionCount(); // FIX: was always defaulting to 50
  const generationId = `${resume._id}-${attemptNumber}-${Date.now()}`;

  const response = await openai.chat.completions.create(
    buildCompletionParams({
      model: getAIModel(),
      messages: [
        {
          role: 'user',
          content: buildPromptForGeneration(
            resume,
            profile,
            attemptNumber,
            priorPrompts,
            generationId,
            questionCount   // FIX: was hardcoded to 50 inside buildPromptForGeneration default
          )
        }
      ],
      temperature: 0.7,
      max_tokens: getAssessmentMaxTokens(questionCount) // FIX: was hardcoded to 12000
    })
  );

  return parseAIJSON(response.choices[0].message.content);
};

const keywordScore = (answerText = '', expectedConcepts = []) => {
  const normalized = answerText.toLowerCase();
  if (!normalized.trim()) return { ratio: 0, matched: [] };

  const matched = expectedConcepts.filter((concept) =>
    normalized.includes(String(concept).toLowerCase())
  );
  return {
    ratio: expectedConcepts.length ? matched.length / expectedConcepts.length : 0,
    matched
  };
};

const buildReportFromEvaluations = (test, questionEvaluations, aiReport = null, previousTest = null) => {
  const evaluationMap = new Map(questionEvaluations.map((item) => [item.questionId, item]));
  const totalScore = questionEvaluations.reduce((sum, item) => sum + (item.score || 0), 0);
  const totalMaxScore =
    test.questions.reduce((sum, question) => sum + (question.maxPoints || 0), 0) || 1;
  const overallScore = Math.round((totalScore / totalMaxScore) * 100);

  const skillMap = new Map();
  test.questions.forEach((question) => {
    const evaluation = evaluationMap.get(question.questionId) || {};
    const key = slugifySkill(question.skill);
    const bucket = skillMap.get(key) || {
      skill: question.skill,
      score: 0,
      maxScore: 0,
      strengths: [],
      weaknesses: []
    };

    bucket.score += evaluation.score || 0;
    bucket.maxScore += question.maxPoints || 0;
    bucket.strengths.push(...(evaluation.strengths || []));
    bucket.weaknesses.push(...(evaluation.weaknesses || []));
    skillMap.set(key, bucket);
  });

  const skillBreakdown = [...skillMap.values()].map((item) => ({
    skill: item.skill,
    score: item.score,
    maxScore: item.maxScore,
    accuracy: item.maxScore ? Math.round((item.score / item.maxScore) * 100) : 0,
    strengths: [...new Set(item.strengths)].slice(0, 3),
    weaknesses: [...new Set(item.weaknesses)].slice(0, 3)
  }));

  const mistakeAnalysis = test.questions
    .map((question) => {
      const evaluation = evaluationMap.get(question.questionId) || {};
      if (evaluation.isCorrect) return null;
      const userOptionKey = question.userAnswer?.selectedOptionKey || 'No answer';
      const userOption = question.options?.find((o) => o.key === userOptionKey);
      return {
        questionId: question.questionId,
        skill: question.skill,
        prompt: question.prompt,
        submittedAnswer: userOption ? `${userOptionKey}: ${userOption.text}` : userOptionKey,
        explanation:
          evaluation.explanation || 'The selected option does not match the correct answer.',
        correctApproach:
          evaluation.correctApproach ||
          question.correctAnswer?.explanation ||
          'Review the underlying concept.'
      };
    })
    .filter(Boolean);

  const weakAreas = aiReport?.weakAreas?.length
    ? aiReport.weakAreas
    : skillBreakdown.filter((item) => item.accuracy < 65).map((item) => item.skill);

  const strengths = aiReport?.strengths?.length
    ? aiReport.strengths
    : skillBreakdown
        .filter((item) => item.accuracy >= 75)
        .map((item) => `${item.skill} fundamentals`);

  const report = {
    overallScore,
    accuracyLevel: aiReport?.accuracyLevel ?? overallScore,
    logicalThinkingScore:
      aiReport?.logicalThinkingScore ?? Math.max(35, Math.min(95, overallScore + 5)),
    problemSolvingAbility:
      aiReport?.problemSolvingAbility ?? Math.max(35, Math.min(95, overallScore + 3)),
    strengths,
    weakAreas,
    skillBreakdown: aiReport?.skillBreakdown?.length ? aiReport.skillBreakdown : skillBreakdown,
    mistakeAnalysis: aiReport?.mistakeAnalysis?.length
      ? aiReport.mistakeAnalysis
      : mistakeAnalysis,
    careerFeedback: aiReport?.careerFeedback || {
      resumeImprovements: [
        'Turn project outcomes into measurable impact statements.',
        'Make the skills section reflect tools you can explain in depth.'
      ],
      skillsToFocus: weakAreas.slice(0, 4),
      learningRoadmap: [
        'Review weak concepts from this test and rewrite them in your own words.',
        'Build one small project feature that uses the weakest skill under time pressure.',
        'Practice explaining design decisions out loud as if in an interview.'
      ],
      projectSuggestions: [
        'Add project notes describing architecture decisions, debugging wins, and tradeoffs.',
        'Show measurable outcomes or realistic constraints in your featured projects.'
      ],
      interviewReadinessScore: Math.max(30, Math.min(95, overallScore)),
      finalSummary:
        overallScore >= 75
          ? 'You show solid applied understanding of the skills listed on your resume, with a few areas to tighten before interviews.'
          : 'Your resume points to relevant experience, but the test shows a gap between listed skills and confident application.'
    }
  };

  if (previousTest?.report) {
    const comparisonSkills = inferComparison(
      report.skillBreakdown,
      previousTest.report.skillBreakdown || []
    );
    report.comparison = {
      previousOverallScore: previousTest.report.overallScore,
      delta: report.overallScore - previousTest.report.overallScore,
      improvedSkills: comparisonSkills.improvedSkills,
      declinedSkills: comparisonSkills.declinedSkills
    };
  }

  return { questionEvaluations, report };
};

const evaluateWithMockRules = (test, previousTest = null) => {
  const questionEvaluations = test.questions.map((question) => {
    const answer = question.userAnswer || {};
    const isCorrect = answer.selectedOptionKey === question.correctAnswer.optionKey;
    return {
      questionId: question.questionId,
      score: isCorrect ? question.maxPoints : 0,
      isCorrect,
      explanation: isCorrect
        ? `Correct. ${question.correctAnswer.explanation || 'The selected option matches the expected concept.'}`
        : `Incorrect. The correct answer is ${question.correctAnswer.optionKey}. ${question.correctAnswer.explanation || 'The selected option does not match the expected concept.'}`,
      strengths: isCorrect ? ['Selected the correct option.'] : [],
      weaknesses: isCorrect ? [] : ['Core concept recall was weak on this topic.'],
      correctApproach:
        question.correctAnswer.explanation ||
        'Review the underlying concept and compare each option carefully.',
      missingConcepts: isCorrect ? [] : question.correctAnswer.expectedConcepts || []
    };
  });

  return buildReportFromEvaluations(test, questionEvaluations, null, previousTest);
};

const getRuleBasedQuestionEvaluations = (test) =>
  test.questions.map((question) => {
    const answer = question.userAnswer || {};
    const isCorrect = answer.selectedOptionKey === question.correctAnswer.optionKey;
    return {
      questionId: question.questionId,
      score: isCorrect ? question.maxPoints : 0,
      isCorrect,
      explanation: isCorrect
        ? `Correct. ${question.correctAnswer.explanation || 'The selected option matches the expected answer.'}`
        : `Incorrect. The correct answer is ${question.correctAnswer.optionKey}. ${question.correctAnswer.explanation || 'The selected option does not match the expected answer.'}`,
      strengths: isCorrect ? ['Selected the correct option.'] : [],
      weaknesses: isCorrect ? [] : ['Did not select the correct option for this topic.'],
      correctApproach:
        question.correctAnswer.explanation ||
        'Review the concept and analyze each option carefully.',
      missingConcepts: isCorrect ? [] : question.correctAnswer.expectedConcepts || []
    };
  });

const evaluateWithAI = async (test, resume, previousTest) => {
  if (isMockMode()) {
    return evaluateWithMockRules(test, previousTest);
  }

  const questionEvaluations = getRuleBasedQuestionEvaluations(test);
  const baseReport = buildReportFromEvaluations(test, questionEvaluations, null, previousTest).report;
  const openai = getOpenAIClient();

  const response = await openai.chat.completions.create(
    buildCompletionParams({
      model: getAIModel(),
      messages: [
        {
          role: 'user',
          content: buildPromptForEvaluation(
            { ...test.toObject(), report: baseReport },
            resume
          )
        }
      ],
      temperature: 0.35,
      max_tokens: 5000
    })
  );

  const aiResult = parseAIJSON(response.choices[0].message.content);

  return buildReportFromEvaluations(
    test,
    aiResult.questionEvaluations?.length ? aiResult.questionEvaluations : questionEvaluations,
    aiResult.report || baseReport,
    previousTest
  );
};

const generateTestDocument = async ({ resume, userId, priorTests }) => {
  const profile = extractResumeProfile(resume.content);

  if (
    !profile.technologiesUsed.length &&
    !profile.technicalSkills.length &&
    !profile.projects.length
  ) {
    if (profile.softSkills.length) {
      profile.technicalSkills.push(...profile.softSkills);
    }
    if (profile.experience.length) {
      profile.experience.forEach((exp) => {
        if (exp.position) profile.technicalSkills.push(exp.position);
      });
    }
    if (profile.education.length) {
      profile.education.forEach((edu) => {
        if (edu.field) profile.technicalSkills.push(edu.field);
        if (edu.degree) profile.technicalSkills.push(edu.degree);
      });
    }
    if (!profile.technicalSkills.length) {
      profile.technicalSkills.push(
        'General Knowledge',
        'Problem Solving',
        'Communication',
        'Critical Thinking'
      );
    }
    profile.technologiesUsed.push(...profile.technicalSkills);
  }

  const attemptNumber = (priorTests[0]?.attemptNumber || 0) + 1;
  const priorPrompts = priorTests
    .flatMap((test) => test.questions.map((question) => question.prompt))
    .slice(0, 150);

  const generated = await generateWithAI(resume, profile, attemptNumber, priorPrompts);

  return ResumeTest.create({
    userId,
    resumeId: resume._id,
    resumeTitle: resume.title,
    title: generated.title || `${resume.title} Skill Validation Test`,
    attemptNumber,
    status: 'draft',
    durationMinutes: generated.durationMinutes || DEFAULT_DURATION_MINUTES,
    difficulty: generated.difficulty || profile.difficulty,
    generatedFrom: {
      skills: profile.technicalSkills,
      projects: profile.projects.map((project) => project.name),
      technologies: profile.technologiesUsed
    },
    questions: normalizeQuestions(generated.questions || [])
  });
};

const listTests = asyncHandler(async (req, res) => {
  const tests = await ResumeTest.find({ userId: req.user.id })
    .select(
      'title resumeTitle resumeId status attemptNumber durationMinutes difficulty report.overallScore createdAt submittedAt'
    )
    .sort({ createdAt: -1 })
    .limit(30);

  res.json({ success: true, tests });
});

const getTest = asyncHandler(async (req, res) => {
  const test = await ResumeTest.findOne({ _id: req.params.id, userId: req.user.id });
  if (!test) {
    return res.status(404).json({ error: 'Test not found.' });
  }

  if (
    test.status === 'in_progress' &&
    test.expiresAt &&
    new Date(test.expiresAt) <= new Date() &&
    !test.submittedAt
  ) {
    test.status = 'expired';
    await test.save();
  }

  res.json({ success: true, test: sanitizeTest(test) });
});

const generateTest = asyncHandler(async (req, res) => {
  const { resumeId } = req.body;
  const resume = await Resume.findOne({ _id: resumeId, userId: req.user.id });

  if (!resume) {
    return res.status(404).json({ error: 'Resume not found.' });
  }

  const priorTests = await ResumeTest.find({ resumeId: resume._id, userId: req.user.id })
    .sort({ createdAt: -1 })
    .limit(5);

  const test = await generateTestDocument({ resume, userId: req.user.id, priorTests });
  res.status(201).json({ success: true, test: sanitizeTest(test) });
});

const startTest = asyncHandler(async (req, res) => {
  const test = await ResumeTest.findOne({ _id: req.params.id, userId: req.user.id });
  if (!test) {
    return res.status(404).json({ error: 'Test not found.' });
  }

  if (test.status === 'submitted') {
    return res.status(400).json({ error: 'This test has already been submitted.' });
  }

  if (!test.startedAt) {
    const startedAt = new Date();
    test.startedAt = startedAt;
    test.expiresAt = new Date(startedAt.getTime() + test.durationMinutes * 60 * 1000);
  }

  test.status = 'in_progress';
  await test.save();

  res.json({ success: true, test: sanitizeTest(test) });
});

const saveAnswer = asyncHandler(async (req, res) => {
  const { questionId, selectedOptionKey, answerText, timeSpentSeconds } = req.body;
  const test = await ResumeTest.findOne({ _id: req.params.id, userId: req.user.id });

  if (!test) {
    return res.status(404).json({ error: 'Test not found.' });
  }

  if (!['draft', 'in_progress'].includes(test.status)) {
    return res.status(400).json({ error: 'This test is no longer editable.' });
  }

  if (test.expiresAt && new Date(test.expiresAt) <= new Date()) {
    test.status = 'expired';
    await test.save();
    return res.status(400).json({ error: 'Time is up. Please submit the test.' });
  }

  const question = test.questions.find((item) => item.questionId === questionId);
  if (!question) {
    return res.status(404).json({ error: 'Question not found.' });
  }

  question.userAnswer = {
    selectedOptionKey: selectedOptionKey || question.userAnswer?.selectedOptionKey || '',
    answerText:
      answerText !== undefined ? answerText : question.userAnswer?.answerText || '',
    timeSpentSeconds: Number.isFinite(timeSpentSeconds)
      ? timeSpentSeconds
      : question.userAnswer?.timeSpentSeconds || 0,
    savedAt: new Date()
  };

  if (!test.startedAt) {
    test.startedAt = new Date();
    test.expiresAt = new Date(test.startedAt.getTime() + test.durationMinutes * 60 * 1000);
  }
  test.status = 'in_progress';

  await test.save();
  res.json({
    success: true,
    saved: true,
    remainingSeconds: sanitizeTest(test).remainingSeconds
  });
});

const submitTest = asyncHandler(async (req, res) => {
  const test = await ResumeTest.findOne({ _id: req.params.id, userId: req.user.id });
  if (!test) {
    return res.status(404).json({ error: 'Test not found.' });
  }

  if (test.status === 'submitted') {
    return res.json({ success: true, test: sanitizeTest(test) });
  }

  const resume = await Resume.findOne({ _id: test.resumeId, userId: req.user.id });
  if (!resume) {
    return res.status(404).json({ error: 'Source resume not found.' });
  }

  if (!test.startedAt) {
    test.startedAt = new Date(test.createdAt);
    test.expiresAt = new Date(
      test.startedAt.getTime() + test.durationMinutes * 60 * 1000
    );
  }

  const isExpired = test.expiresAt && new Date(test.expiresAt) <= new Date();
  const previousTest = await ResumeTest.findOne({
    _id: { $ne: test._id },
    userId: req.user.id,
    resumeId: test.resumeId,
    status: 'submitted'
  }).sort({ submittedAt: -1 });

  const evaluationResult = await evaluateWithAI(test, resume, previousTest);

  test.questions = test.questions.map((question) => ({
    ...question.toObject(),
    evaluation:
      evaluationResult.questionEvaluations.find(
        (item) => item.questionId === question.questionId
      ) || question.evaluation
  }));
  test.report = evaluationResult.report;
  test.status = 'submitted';
  test.autoSubmitted = Boolean(isExpired);
  test.submittedAt = new Date();

  await test.save();
  res.json({ success: true, test: sanitizeTest(test) });
});

const retakeTest = asyncHandler(async (req, res) => {
  const original = await ResumeTest.findOne({ _id: req.params.id, userId: req.user.id });
  if (!original) {
    return res.status(404).json({ error: 'Test not found.' });
  }

  const resume = await Resume.findOne({ _id: original.resumeId, userId: req.user.id });
  if (!resume) {
    return res.status(404).json({ error: 'Source resume not found.' });
  }

  const priorTests = await ResumeTest.find({ resumeId: resume._id, userId: req.user.id })
    .sort({ createdAt: -1 })
    .limit(5);

  const test = await generateTestDocument({ resume, userId: req.user.id, priorTests });
  res.status(201).json({ success: true, test: sanitizeTest(test) });
});

const updateTest = asyncHandler(async (req, res) => {
  const { title } = req.body;
  const test = await ResumeTest.findOneAndUpdate(
    { _id: req.params.id, userId: req.user.id },
    { title },
    { new: true, runValidators: true }
  );

  if (!test) {
    return res.status(404).json({ error: 'Test not found.' });
  }

  res.json({ success: true, test: sanitizeTest(test) });
});

const deleteTest = asyncHandler(async (req, res) => {
  const test = await ResumeTest.findOneAndDelete({ _id: req.params.id, userId: req.user.id });

  if (!test) {
    return res.status(404).json({ error: 'Test not found.' });
  }

  res.json({ success: true, message: 'Test deleted successfully.' });
});

module.exports = {
  listTests,
  getTest,
  generateTest,
  startTest,
  saveAnswer,
  submitTest,
  retakeTest,
  updateTest,
  deleteTest
};