// Mock AI service for development/demo without real OpenAI key
// Returns realistic responses for testing without API costs

const generateATSAnalysis = (resumeText) => {
  const hasSummary = resumeText.toLowerCase().includes('summary');
  const hasAchievements = resumeText.toLowerCase().includes('achievement') || resumeText.toLowerCase().includes('led') || resumeText.toLowerCase().includes('improved');
  const hasMetrics = /\d+%|\d+x|increased|\$\d+/i.test(resumeText);
  
  const baseScore = 65;
  const summaryBonus = hasSummary ? 10 : 0;
  const achievementsBonus = hasAchievements ? 12 : 0;
  const metricsBonus = hasMetrics ? 13 : 0;
  const atsScore = Math.min(95, baseScore + summaryBonus + achievementsBonus + metricsBonus);

  return {
    atsScore: Math.round(atsScore),
    keywords: {
      found: ["leadership", "project management", "team collaboration", "problem solving"],
      missing: ["metrics", "specific achievements", "quantified results", "industry certifications"],
      recommended: ["increased efficiency", "revenue growth", "system optimization", "cross-functional leadership"]
    },
    sections: {
      strong: ["contact_info", "experience"],
      weak: ["skills", "summary"],
      missing: ["certifications", "metrics"]
    },
    suggestions: [
      {
        category: "summary",
        priority: "high",
        issue: "Missing or weak professional summary",
        suggestion: "Add a compelling 2-3 line professional summary highlighting key achievements and career goals"
      },
      {
        category: "experience",
        priority: "high",
        issue: "Achievements lack quantifiable metrics",
        suggestion: "Add percentages, dollar amounts, or time saved to each achievement (e.g., 'Increased sales by 25%')"
      },
      {
        category: "keywords",
        priority: "medium",
        issue: "Limited industry-specific keywords",
        suggestion: "Include more technical terms and industry buzzwords relevant to your target role"
      },
      {
        category: "skills",
        priority: "medium",
        issue: "Skills section could be more detailed",
        suggestion: "Organize skills by category (Technical, Languages, Tools) and add proficiency levels"
      }
    ],
    overallFeedback: "Your resume has a solid foundation with good work history. Focus on quantifying achievements with metrics and strengthening your professional summary. Adding more industry keywords will improve ATS compatibility and increase your chances of passing automated screening."
  };
};

const generateJobMatch = (resumeText, jobDescription) => {
  const resumeLower = resumeText.toLowerCase();
  const jobLower = jobDescription.toLowerCase();
  
  const jobKeywords = jobLower.match(/\b[a-z]+\b/g) || [];
  const resumeKeywords = resumeLower.match(/\b[a-z]+\b/g) || [];
  const commonKeywords = [...new Set(jobKeywords.filter(k => resumeKeywords.includes(k)))];
  const matchPercentage = Math.min(95, 45 + (commonKeywords.length * 5));

  const jobTitleMatch = jobDescription.match(/^(.*?(?:Manager|Engineer|Developer|Analyst|Director|Specialist|Coordinator))/i);
  const jobTitle = jobTitleMatch ? jobTitleMatch[1].trim().substring(0, 50) : "Job Position";

  return {
    matchPercentage: Math.round(Math.min(95, Math.max(30, matchPercentage))),
    jobTitle,
    matchedSkills: ["Project Management", "Leadership", "Team Collaboration", "Problem Solving", "Communication"],
    missingSkills: ["Advanced Analytics", "Python Programming", "Cloud Architecture", "Data Science"],
    missingExperience: ["5+ years in similar role", "Enterprise-scale project experience", "Team leadership experience"],
    keywordAnalysis: {
      present: ["leadership", "team", "project", "strategy", "innovation"],
      missing: ["agile", "scrum", "api", "microservices", "kubernetes"]
    },
    recommendations: [
      "Add specific projects demonstrating the key requirements mentioned in the job description",
      "Highlight any experience with the tools or technologies mentioned in the job posting",
      "Emphasize leadership and team management experience to match senior-level requirements"
    ],
    strengthsForRole: [
      "Strong project management background",
      "Proven team leadership and mentoring capabilities",
      "Solid experience with core technologies mentioned"
    ],
    overallAssessment: "You're a good match for this role with approximately 70% alignment.",
    interviewTips: [
      "Prepare specific examples of projects you led that align with their requirements",
      "Research the company's tech stack and be ready to discuss how your experience applies",
      "Highlight metrics and measurable outcomes from your previous roles",
      "Ask about team structure and growth opportunities to gauge company fit"
    ]
  };
};

const generateEnhancedContent = (text, type) => {
  const typeExamples = {
    summary: "Results-driven professional with 8+ years of experience leading cross-functional teams.",
    experience_description: "Led cross-functional team of 12+ engineers to deliver enterprise software solution.",
    achievement: "Spearheaded digital transformation initiative that improved operational efficiency by 45%.",
    project_description: "Designed and built a scalable microservices architecture using modern tech stack.",
    skills: "Technical: Python, JavaScript, React, Node.js, PostgreSQL, AWS, Docker"
  };
  const enhanced = typeExamples[type] || text;
  return { enhanced, improvements: ["Added metrics", "Incorporated action verbs", "Optimized for ATS"], keywords_added: ["achieved", "implemented", "delivered"] };
};

const generateKeywordExtraction = (jobDescription) => {
  return {
    technicalSkills: ["JavaScript", "React", "Node.js", "PostgreSQL", "AWS", "Docker", "REST APIs"],
    softSkills: ["Leadership", "Communication", "Problem Solving", "Team Collaboration"],
    tools: ["Git", "Jira", "Docker", "Jenkins", "AWS Console"],
    certifications: ["AWS Solutions Architect", "Scrum Master Certification"],
    experience: ["5+ years of software development experience", "2+ years of team leadership"],
    education: ["Bachelor's degree in Computer Science or related field"],
    keyPhrases: ["full-stack development", "system design", "performance optimization"],
    jobLevel: "mid",
    industry: "Technology/Software Development"
  };
};

// -------------------------------------------------------------------
// MCQ Question Bank — 55 questions across easy / medium / hard
// -------------------------------------------------------------------
const MCQ_BANK = [
  // ── EASY (20) ─────────────────────────────────────────────────────
  { skill: 'JavaScript', d: 'easy', prompt: 'Which keyword declares a block-scoped variable in JavaScript?', opts: ['var', 'let', 'define', 'dim'], key: 'B', exp: '"let" declares a block-scoped variable in ES6+.' },
  { skill: 'JavaScript', d: 'easy', prompt: 'What does typeof null return in JavaScript?', opts: ['"null"', '"undefined"', '"object"', '"boolean"'], key: 'C', exp: 'typeof null is "object" due to a legacy bug.' },
  { skill: 'JavaScript', d: 'easy', prompt: 'Which array method adds an element to the end?', opts: ['shift()', 'unshift()', 'push()', 'pop()'], key: 'C', exp: 'push() appends to the end.' },
  { skill: 'HTML', d: 'easy', prompt: 'Which HTML tag creates an unordered list?', opts: ['<ol>', '<ul>', '<li>', '<dl>'], key: 'B', exp: '<ul> creates an unordered list.' },
  { skill: 'CSS', d: 'easy', prompt: 'Which CSS property changes text color?', opts: ['background-color', 'font-color', 'color', 'text-style'], key: 'C', exp: '"color" sets text color.' },
  { skill: 'React', d: 'easy', prompt: 'Which hook manages state in a React functional component?', opts: ['useEffect', 'useState', 'useContext', 'useRef'], key: 'B', exp: 'useState manages local state.' },
  { skill: 'React', d: 'easy', prompt: 'What is JSX in React?', opts: ['A database language', 'A CSS preprocessor', 'A syntax extension for JS', 'A testing framework'], key: 'C', exp: 'JSX lets you write HTML-like syntax in JS.' },
  { skill: 'Node.js', d: 'easy', prompt: 'Which module system does Node.js use by default?', opts: ['AMD', 'UMD', 'CommonJS', 'ES Modules'], key: 'C', exp: 'Node.js uses CommonJS by default.' },
  { skill: 'Node.js', d: 'easy', prompt: 'Which built-in module creates an HTTP server?', opts: ['fs', 'path', 'http', 'url'], key: 'C', exp: 'The http module creates HTTP servers.' },
  { skill: 'MongoDB', d: 'easy', prompt: 'In MongoDB, data is stored in what format?', opts: ['Tables', 'BSON documents', 'XML files', 'CSV rows'], key: 'B', exp: 'MongoDB stores BSON documents.' },
  { skill: 'Git', d: 'easy', prompt: 'Which command initializes a new Git repository?', opts: ['git start', 'git init', 'git create', 'git new'], key: 'B', exp: '"git init" creates a new repo.' },
  { skill: 'Git', d: 'easy', prompt: 'Which command stages all modified files?', opts: ['git commit -a', 'git add .', 'git push', 'git status'], key: 'B', exp: '"git add ." stages all changes.' },
  { skill: 'Python', d: 'easy', prompt: 'Which keyword defines a function in Python?', opts: ['function', 'func', 'def', 'lambda'], key: 'C', exp: '"def" defines a function.' },
  { skill: 'Python', d: 'easy', prompt: 'What is print(type([])) in Python?', opts: ["<class 'dict'>", "<class 'tuple'>", "<class 'list'>", "<class 'set'>"], key: 'C', exp: '[] is a list.' },
  { skill: 'SQL', d: 'easy', prompt: 'Which SQL keyword retrieves data?', opts: ['GET', 'FETCH', 'SELECT', 'RETRIEVE'], key: 'C', exp: 'SELECT retrieves data.' },
  { skill: 'SQL', d: 'easy', prompt: 'Which SQL clause filters rows?', opts: ['ORDER BY', 'GROUP BY', 'WHERE', 'HAVING'], key: 'C', exp: 'WHERE filters rows.' },
  { skill: 'Communication', d: 'easy', prompt: 'What is the most important aspect of active listening?', opts: ['Interrupting', 'Focusing on the speaker', 'Preparing your response', 'Taking notes'], key: 'B', exp: 'Active listening requires full attention.' },
  { skill: 'Problem Solving', d: 'easy', prompt: 'First step in structured problem-solving?', opts: ['Implement a solution', 'Identify the problem', 'Test solutions', 'Gather a team'], key: 'B', exp: 'Defining the problem is the first step.' },
  { skill: 'General', d: 'easy', prompt: 'What does API stand for?', opts: ['Application Programming Interface', 'Advanced Program Integration', 'Automated Process Instruction', 'Application Process Input'], key: 'A', exp: 'API = Application Programming Interface.' },
  { skill: 'General', d: 'easy', prompt: 'What does HTTP stand for?', opts: ['HyperText Transfer Protocol', 'High Tech Transfer Process', 'HyperText Transmission Protocol', 'Home Tool Transfer Protocol'], key: 'A', exp: 'HTTP = HyperText Transfer Protocol.' },

  // ── MEDIUM (20) ───────────────────────────────────────────────────
  { skill: 'JavaScript', d: 'medium', prompt: 'What is console.log(0.1 + 0.2 === 0.3)?', opts: ['true', 'false', 'undefined', 'NaN'], key: 'B', exp: 'Floating-point precision makes 0.1+0.2 ≠ 0.3.' },
  { skill: 'JavaScript', d: 'medium', prompt: 'Which method creates a shallow copy of an array?', opts: ['Array.from()', 'slice()', 'Both A and B', 'splice()'], key: 'C', exp: 'Both Array.from() and slice() create shallow copies.' },
  { skill: 'JavaScript', d: 'medium', prompt: '"this" in an arrow function refers to?', opts: ['The function itself', 'The global object', 'The enclosing lexical scope', 'undefined'], key: 'C', exp: 'Arrow functions inherit "this" from their enclosing scope.' },
  { skill: 'JavaScript', d: 'medium', prompt: 'What is a closure?', opts: ['A way to close tabs', 'A function retaining access to outer scope', 'A loop terminator', 'Error handling'], key: 'B', exp: 'A closure retains access to its outer scope variables.' },
  { skill: 'React', d: 'medium', prompt: 'What is the purpose of useEffect?', opts: ['Define styles', 'Handle side effects', 'Create components', 'Define prop types'], key: 'B', exp: 'useEffect handles side effects like data fetching.' },
  { skill: 'React', d: 'medium', prompt: 'What is the Virtual DOM?', opts: ['A browser DOM copy', 'A lightweight JS representation of the DOM', 'A testing tool', 'A database'], key: 'B', exp: 'Virtual DOM is a lightweight JS representation for efficient diffing.' },
  { skill: 'React', d: 'medium', prompt: 'How do you pass data parent → child in React?', opts: ['State only', 'Props', 'localStorage', 'Event listeners'], key: 'B', exp: 'Props pass data from parent to child.' },
  { skill: 'Node.js', d: 'medium', prompt: 'What is middleware in Express.js?', opts: ['DB connector', 'Function processing requests before route handler', 'Frontend library', 'Testing framework'], key: 'B', exp: 'Middleware processes requests with req, res, next.' },
  { skill: 'Node.js', d: 'medium', prompt: 'What is the event loop in Node.js?', opts: ['UI engine', 'Mechanism for async operations', 'Connection pool', 'Logging framework'], key: 'B', exp: 'The event loop handles async callbacks for non-blocking I/O.' },
  { skill: 'MongoDB', d: 'medium', prompt: 'Purpose of indexing in MongoDB?', opts: ['Encrypt data', 'Improve query performance', 'Validate schemas', 'Compress documents'], key: 'B', exp: 'Indexes improve query performance.' },
  { skill: 'MongoDB', d: 'medium', prompt: 'What is an aggregation pipeline?', opts: ['Delete collections', 'Framework for data transformation', 'Backup mechanism', 'Replication strategy'], key: 'B', exp: 'Aggregation pipelines transform documents through stages.' },
  { skill: 'CSS', d: 'medium', prompt: 'What is the CSS box model?', opts: ['margin, border, padding, content', 'header, body, footer, sidebar', 'flex, grid, block, inline', 'color, font, size, weight'], key: 'A', exp: 'Box model = margin + border + padding + content.' },
  { skill: 'CSS', d: 'medium', prompt: 'display:none vs visibility:hidden?', opts: ['No difference', 'none removes from layout; hidden keeps space', 'hidden removes from layout', 'Both remove from DOM'], key: 'B', exp: 'display:none removes from flow; visibility:hidden hides but keeps space.' },
  { skill: 'Python', d: 'medium', prompt: 'What is a list comprehension?', opts: ['Sort lists', 'Concise syntax for creating lists', 'Delete items', 'Debugging technique'], key: 'B', exp: 'List comprehensions: [x for x in iterable].' },
  { skill: 'Python', d: 'medium', prompt: 'What does "with" do in Python?', opts: ['Creates a loop', 'Manages resources with cleanup', 'Defines a class', 'Imports modules'], key: 'B', exp: '"with" manages context managers for automatic cleanup.' },
  { skill: 'SQL', d: 'medium', prompt: 'INNER JOIN vs LEFT JOIN?', opts: ['No difference', 'INNER = matching only; LEFT = all left rows', 'LEFT = matching only', 'INNER = all rows'], key: 'B', exp: 'INNER returns matching rows; LEFT includes all left table rows.' },
  { skill: 'Git', d: 'medium', prompt: 'What does "git rebase" do?', opts: ['Delete branch', 'Move/combine commits onto new base', 'Create repo', 'Push to remote'], key: 'B', exp: 'Rebase replays commits onto another base.' },
  { skill: 'Problem Solving', d: 'medium', prompt: 'Time complexity of binary search?', opts: ['O(n)', 'O(n²)', 'O(log n)', 'O(1)'], key: 'C', exp: 'Binary search halves the space: O(log n).' },
  { skill: 'Problem Solving', d: 'medium', prompt: 'Which data structure uses FIFO?', opts: ['Stack', 'Queue', 'Tree', 'Hash Map'], key: 'B', exp: 'Queue = First In, First Out.' },
  { skill: 'General', d: 'medium', prompt: 'Purpose of a load balancer?', opts: ['Write code faster', 'Distribute traffic across servers', 'Compress files', 'Manage databases'], key: 'B', exp: 'Load balancers distribute traffic for availability.' },

  // ── HARD (15) ─────────────────────────────────────────────────────
  { skill: 'JavaScript', d: 'hard', prompt: 'What is console.log([] == ![])?', opts: ['true', 'false', 'undefined', 'TypeError'], key: 'A', exp: '![] is false→0; [] coerces to 0; 0==0 is true.' },
  { skill: 'JavaScript', d: 'hard', prompt: 'What problem does the Temporal Dead Zone address?', opts: ['Memory leaks', 'Accessing let/const before declaration', 'Circular imports', 'Callback hell'], key: 'B', exp: 'TDZ prevents accessing let/const before their declaration.' },
  { skill: 'JavaScript', d: 'hard', prompt: 'Best pattern to prevent memory leaks with event listeners in SPAs?', opts: ['Add more listeners', 'Remove listeners in cleanup/unmount', 'Use global variables', 'Ignore the issue'], key: 'B', exp: 'Removing listeners during cleanup prevents leaks.' },
  { skill: 'React', d: 'hard', prompt: 'What is React.memo used for?', opts: ['Managing state', 'Memoizing output to prevent re-renders', 'Routing', 'Error handling'], key: 'B', exp: 'React.memo skips re-render if props haven\'t changed.' },
  { skill: 'React', d: 'hard', prompt: 'useCallback vs useMemo?', opts: ['Memoize a value', 'Memoize a function reference', 'Fetch data', 'Style components'], key: 'B', exp: 'useCallback memoizes functions; useMemo memoizes values.' },
  { skill: 'React', d: 'hard', prompt: 'What causes infinite loops with useEffect?', opts: ['Using useState', 'Setting state without proper deps', 'Using props', 'Rendering JSX'], key: 'B', exp: 'Updating state in useEffect without correct deps causes infinite loops.' },
  { skill: 'Node.js', d: 'hard', prompt: 'How does Node.js handle CPU-intensive tasks?', opts: ['It cannot', 'Worker threads or child processes', 'More RAM', 'Using the DOM'], key: 'B', exp: 'Worker threads offload CPU work from the event loop.' },
  { skill: 'Node.js', d: 'hard', prompt: 'Purpose of the cluster module?', opts: ['Manage packages', 'Fork workers sharing the same port', 'Create databases', 'Minify code'], key: 'B', exp: 'Cluster forks workers to handle requests across CPU cores.' },
  { skill: 'MongoDB', d: 'hard', prompt: 'What is sharding in MongoDB?', opts: ['Encrypting docs', 'Distributing data across servers', 'Compressing collections', 'Creating backups'], key: 'B', exp: 'Sharding distributes data for horizontal scaling.' },
  { skill: 'MongoDB', d: 'hard', prompt: 'When should you denormalize in MongoDB?', opts: ['Always', 'Never', 'When reads matter more than write consistency', 'Only in testing'], key: 'C', exp: 'Denormalization improves reads at the cost of duplication.' },
  { skill: 'CSS', d: 'hard', prompt: 'How does z-index relate to stacking context?', opts: ['z-index is always global', 'z-index only works within its stacking context', 'z-index is deprecated', 'Not related'], key: 'B', exp: 'z-index values compare only within the same stacking context.' },
  { skill: 'Python', d: 'hard', prompt: 'What are Python decorators?', opts: ['CSS for Python', 'Functions that modify other functions', 'A data type', 'A testing tool'], key: 'B', exp: 'Decorators wrap functions to add behavior like logging or caching.' },
  { skill: 'SQL', d: 'hard', prompt: 'Clustered vs non-clustered index?', opts: ['No difference', 'Clustered = physical order; non-clustered = separate structure', 'Non-clustered is faster', 'Clustered only on primary keys'], key: 'B', exp: 'Clustered defines physical row order; non-clustered is a separate lookup.' },
  { skill: 'Problem Solving', d: 'hard', prompt: 'Time complexity of merging k sorted arrays of size n?', opts: ['O(nk)', 'O(nk log k)', 'O(n²)', 'O(k log n)'], key: 'B', exp: 'Min-heap merge gives O(nk log k).' },
  { skill: 'General', d: 'hard', prompt: 'What is the CAP theorem?', opts: ['C, A, P all at once', 'At most two of C, A, P', 'CPU, API, Performance', 'A testing methodology'], key: 'B', exp: 'CAP: you can guarantee at most two of Consistency, Availability, Partition tolerance.' },
];

const shuffle = (arr) => {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
};

const makeResumeSpecificPrompt = (basePrompt, skill, profile, index) => {
  const project = profile.projects?.[index % Math.max(profile.projects.length, 1)];
  const experience = profile.experience?.[index % Math.max(profile.experience.length, 1)];
  const context = project?.name
    ? ` in the context of the "${project.name}" project`
    : experience?.position
      ? ` for a ${experience.position} role`
      : '';
  return `${basePrompt} Apply it to ${skill}${context}.`;
};

const generateResumeTest = (profile, { attemptNumber = 1 } = {}) => {
  const skills = profile.technicalSkills.length
    ? profile.technicalSkills
    : profile.technologiesUsed.length
      ? profile.technologiesUsed
      : ['JavaScript', 'Problem Solving', 'General'];

  const easyPool = shuffle(MCQ_BANK.filter(q => q.d === 'easy'));
  const mediumPool = shuffle(MCQ_BANK.filter(q => q.d === 'medium'));
  const hardPool = shuffle(MCQ_BANK.filter(q => q.d === 'hard'));

  const pick = (pool, count, diff) => {
    const picked = [];
    for (let i = 0; i < count; i++) {
      const base = pool[i % pool.length];
      picked.push({ ...base, d: diff, skill: skills[i % skills.length] || base.skill });
    }
    return picked;
  };

  const all = [...pick(easyPool, 15, 'easy'), ...pick(mediumPool, 20, 'medium'), ...pick(hardPool, 15, 'hard')];

  const questions = all.map((q, i) => ({
    questionId: `q-${i + 1}`,
    type: 'mcq',
    skill: q.skill,
    difficulty: q.d,
    prompt: makeResumeSpecificPrompt(q.prompt, q.skill, profile, i),
    context: '',
    options: q.opts.map((text, oi) => ({ key: String.fromCharCode(65 + oi), text })),
    correctAnswer: { optionKey: q.key, idealAnswer: '', expectedConcepts: [q.skill], explanation: q.exp },
    evaluationRubric: ['Choose the correct option.'],
    estimatedMinutes: 1,
    maxPoints: 10
  }));

  return {
    title: `${profile.projects[0]?.name || skills[0] || 'Resume'} MCQ Assessment ${attemptNumber > 1 ? `#${attemptNumber}` : ''}`.trim(),
    difficulty: profile.difficulty || 'medium',
    durationMinutes: 60,
    questions
  };
};

module.exports = { generateATSAnalysis, generateJobMatch, generateEnhancedContent, generateKeywordExtraction, generateResumeTest };
