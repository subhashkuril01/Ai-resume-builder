// Mock AI service for development/demo without real OpenAI key
// Returns realistic responses for testing without API costs

const simpleExtractKeywords = (text = '') => {
  if (!text) return [];
  // Extract capitalized words or common tech keywords
  const techKeywords = [
    'javascript', 'react', 'node', 'python', 'java', 'aws', 'docker', 'kubernetes', 'sql', 'mongodb',
    'typescript', 'angular', 'vue', 'express', 'postgresql', 'cloud', 'devops', 'agile', 'scrum',
    'project management', 'leadership', 'communication', 'problem solving', 'api', 'rest', 'graphql',
    'machine learning', 'data science', 'frontend', 'backend', 'fullstack', 'mobile', 'ios', 'android'
  ];
  
  const textLower = text.toLowerCase();
  const found = techKeywords.filter(kw => textLower.includes(kw));
  
  // Also get some capitalized nouns as potential skills
  const nouns = text.match(/\b[A-Z][a-z]{2,}\b/g) || [];
  const uniqueNouns = [...new Set(nouns)].filter(n => n.length > 3).map(n => n.toLowerCase());
  
  return [...new Set([...found, ...uniqueNouns])].slice(0, 10);
};

const generateATSAnalysis = (resumeText) => {
  const hasSummary = resumeText.toLowerCase().includes('summary');
  const hasAchievements = resumeText.toLowerCase().includes('achievement') || resumeText.toLowerCase().includes('led') || resumeText.toLowerCase().includes('improved');
  const hasMetrics = /\d+%|\d+x|increased|\$\d+/i.test(resumeText);
  
  const extracted = simpleExtractKeywords(resumeText);
  const foundKeywords = extracted.length > 0 ? extracted : ["leadership", "collaboration"];
  
  const baseScore = 65;
  const summaryBonus = hasSummary ? 10 : 0;
  const achievementsBonus = hasAchievements ? 12 : 0;
  const metricsBonus = hasMetrics ? 13 : 0;
  const atsScore = Math.min(95, baseScore + summaryBonus + achievementsBonus + metricsBonus);

  // Missing keywords are some common ones NOT in foundKeywords
  const commonTech = ['agile', 'scrum', 'unit testing', 'ci/cd', 'cloud', 'metrics', 'optimization'];
  const missingKeywords = commonTech.filter(kw => !foundKeywords.includes(kw)).slice(0, 4);

  return {
    atsScore: Math.round(atsScore),
    keywords: {
      found: foundKeywords.map(k => k.charAt(0).toUpperCase() + k.slice(1)),
      missing: missingKeywords.length > 0 ? missingKeywords : ["quantified results", "specific tools"],
      recommended: ["data-driven outcomes", "system optimization", "cross-functional impact"]
    },
    sections: {
      strong: hasAchievements ? ["experience", "contact_info"] : ["contact_info"],
      weak: hasSummary ? ["skills"] : ["summary", "skills"],
      missing: hasMetrics ? ["certifications"] : ["metrics", "certifications"]
    },
    suggestions: [
      {
        category: "summary",
        priority: hasSummary ? "low" : "high",
        issue: hasSummary ? "Summary is present but could be more punchy" : "Missing professional summary",
        suggestion: hasSummary ? "Refine your summary to include your top 3 unique selling points." : "Add a compelling 2-3 line professional summary highlighting key achievements."
      },
      {
        category: "experience",
        priority: hasMetrics ? "medium" : "high",
        issue: hasMetrics ? "Experience section is good" : "Achievements lack quantifiable metrics",
        suggestion: "Ensure every bullet point includes a result (e.g., 'Reduced costs by 15%')."
      },
      {
        category: "keywords",
        priority: "medium",
        issue: `Only ${foundKeywords.length} key skills detected`,
        suggestion: "Incorporate more industry-specific terminology relevant to your target roles."
      }
    ],
    overallFeedback: `Your resume shows a ${atsScore > 80 ? 'strong' : 'solid'} foundation. ${hasMetrics ? 'Great job including metrics.' : 'Try to add more percentages and numbers to show your impact.'} Focusing on ${missingKeywords[0] || 'industry keywords'} will further improve your ATS ranking.`
  };
};

const generateJobMatch = (resumeText, jobDescription) => {
  const resumeLower = resumeText.toLowerCase();
  const jobLower = jobDescription.toLowerCase();
  
  const resumeKeywords = simpleExtractKeywords(resumeText);
  const jobKeywords = simpleExtractKeywords(jobDescription);
  
  const matchedSkills = jobKeywords.filter(kw => resumeLower.includes(kw));
  const missingSkills = jobKeywords.filter(kw => !resumeLower.includes(kw));
  
  const matchPercentage = jobKeywords.length > 0 
    ? Math.min(95, 30 + (matchedSkills.length / jobKeywords.length) * 65)
    : 50;

  const jobTitleMatch = jobDescription.match(/^(.*?(?:Manager|Engineer|Developer|Analyst|Director|Specialist|Coordinator))/i);
  const jobTitle = jobTitleMatch ? jobTitleMatch[1].trim().substring(0, 50) : "Target Role";

  return {
    matchPercentage: Math.round(Math.min(95, Math.max(30, matchPercentage))),
    jobTitle,
    matchedSkills: matchedSkills.map(k => k.charAt(0).toUpperCase() + k.slice(1)),
    missingSkills: missingSkills.length > 0 ? missingSkills.map(k => k.charAt(0).toUpperCase() + k.slice(1)) : ["Advanced Niche Skills"],
    missingExperience: ["Specific domain experience mentioned in job post"],
    keywordAnalysis: {
      present: matchedSkills.slice(0, 5),
      missing: missingSkills.slice(0, 5)
    },
    recommendations: [
      `Add more emphasis on ${missingSkills[0] || 'relevant skills'} in your experience section`,
      "Tailor your professional summary to mention the specific job title",
      "Include a project that demonstrates your capability with the required tech stack"
    ],
    strengthsForRole: [
      `Solid background in ${matchedSkills[0] || 'core areas'}`,
      "Relevant professional experience shown",
      "Education background aligns with requirements"
    ],
    overallAssessment: `You have a ${matchPercentage > 70 ? 'strong' : 'moderate'} alignment for this role. Focus on bridging the gap in ${missingSkills.slice(0, 2).join(', ') || 'specialized areas'}.`,
    interviewTips: [
      `Be ready to discuss your experience with ${matchedSkills[0] || 'key technologies'}`,
      "Prepare a story about a challenge you solved using your core skills",
      "Research the company's recent projects and mention how you can contribute"
    ]
  };
};

const generateEnhancedContent = (text, type) => {
  const words = text.split(' ').slice(0, 5).join(' ');
  const keywords = simpleExtractKeywords(text);
  
  const templates = {
    summary: `Dynamic professional with expertise in ${keywords.slice(0, 3).join(', ') || 'industry standards'}. Proven track record of delivering high-quality results and driving team success.`,
    experience_description: `Successfully spearheaded projects involving ${keywords[0] || 'core technologies'}, resulting in a 20% increase in operational efficiency and improved team productivity.`,
    achievement: `Achieved a significant milestone in ${keywords[0] || 'the project'} by implementing innovative solutions that reduced processing time by 30%.`,
    project_description: `Developed and deployed a robust system using ${keywords.join(', ') || 'modern frameworks'}, focusing on scalability, security, and user-centric design.`,
    skills: `Proficient in: ${keywords.map(k => k.charAt(0).toUpperCase() + k.slice(1)).join(', ')}`
  };
  
  const enhanced = templates[type] || `Enhanced: ${text} (Optimized for impact and ATS compatibility)`;
  return { 
    enhanced, 
    improvements: ["Added action verbs", "Incorporated keywords", "Quantified impact"], 
    keywords_added: ["achieved", "delivered", "implemented", ...keywords.slice(0, 2)] 
  };
};

const generateKeywordExtraction = (jobDescription) => {
  const extracted = simpleExtractKeywords(jobDescription);
  return {
    technicalSkills: extracted.slice(0, 6).map(k => k.charAt(0).toUpperCase() + k.slice(1)),
    softSkills: ["Leadership", "Communication", "Problem Solving"],
    tools: ["Git", "Jira", "Project Management Tools"],
    certifications: ["Relevant Industry Certification"],
    experience: ["3+ years of relevant experience"],
    education: ["Bachelor's degree in related field"],
    keyPhrases: ["results-oriented", "team collaboration", "strategic planning"],
    jobLevel: jobDescription.toLowerCase().includes('senior') ? "senior" : "mid",
    industry: "Information Technology"
  };
};

// MCQ Question Bank remains the same as it is already quite large
const MCQ_BANK = [
  // ... (keeping existing MCQ_BANK from mockAI.js)
];

// ... (keeping other helper functions from mockAI.js)

// Note: I will only replace the top functions and keep the rest of the file intact.
// Since the file is large, I will use replace_file_content for the whole file or 
// chunks if I can.
