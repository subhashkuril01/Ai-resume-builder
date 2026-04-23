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
  
  // Simulate keyword matching
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
    overallAssessment: "You're a good match for this role with approximately 70% alignment. Your project management and leadership experience are strong fits. Consider gaining more experience with the specific technologies mentioned and highlighting relevant certifications to strengthen your candidacy.",
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
    summary: "Results-driven professional with 8+ years of experience leading cross-functional teams and delivering strategic initiatives that drive business growth. Proven expertise in project management, stakeholder engagement, and process optimization, with a track record of increasing efficiency by 30% and exceeding revenue targets.",
    experience_description: "• Led cross-functional team of 12+ engineers to deliver enterprise software solution, resulting in 40% improvement in system performance and saving $500K annually\n• Implemented agile methodology that reduced project delivery time by 35% and improved team productivity\n• Mentored 5 junior team members, resulting in 3 promotions within 2 years",
    achievement: "Spearheaded digital transformation initiative that improved operational efficiency by 45% and reduced costs by $1.2M, delivering exceptional ROI within 18 months",
    project_description: "Designed and built a scalable microservices architecture using modern tech stack, enabling the platform to handle 10x user growth while maintaining 99.9% uptime and improving system performance by 50%",
    skills: "Technical: Python, JavaScript, React, Node.js, PostgreSQL, AWS, Docker | Soft: Leadership, Strategic Planning, Team Management, Communication | Languages: English (Native), Spanish (Fluent)"
  };

  const enhanced = typeExamples[type] || text;
  const improvements = [
    "Added specific metrics and quantifiable results",
    "Incorporated action verbs and professional language",
    "Optimized for ATS with relevant keywords"
  ];
  const keywords_added = ["achieved", "implemented", "delivered", "driven", "optimized"];

  return {
    enhanced,
    improvements,
    keywords_added
  };
};

const generateKeywordExtraction = (jobDescription) => {
  return {
    technicalSkills: ["JavaScript", "React", "Node.js", "PostgreSQL", "AWS", "Docker", "REST APIs"],
    softSkills: ["Leadership", "Communication", "Problem Solving", "Team Collaboration", "Strategic Planning"],
    tools: ["Git", "Jira", "Docker", "Jenkins", "AWS Console", "Slack"],
    certifications: ["AWS Solutions Architect", "Scrum Master Certification", "Project Management Professional"],
    experience: [
      "5+ years of software development experience",
      "2+ years of team leadership experience",
      "Experience with microservices architecture"
    ],
    education: ["Bachelor's degree in Computer Science or related field", "Equivalent professional experience"],
    keyPhrases: ["full-stack development", "system design", "performance optimization", "cross-functional collaboration"],
    jobLevel: "mid",
    industry: "Technology/Software Development"
  };
};

module.exports = {
  generateATSAnalysis,
  generateJobMatch,
  generateEnhancedContent,
  generateKeywordExtraction
};
