const unique = (items = []) => [...new Set(items.filter(Boolean).map((item) => String(item).trim()).filter(Boolean))];

const extractKeywordsFromText = (text = '') => {
  const matches = String(text).match(/\b[A-Z][A-Za-z0-9.+#-]{1,}\b/g) || [];
  return unique(matches);
};

const resumeToText = (content) => {
  if (!content) return '';

  const parts = [];
  const { personalInfo, education, experience, skills, projects, customSections } = content;

  if (personalInfo) {
    parts.push(`NAME: ${personalInfo.firstName || ''} ${personalInfo.lastName || ''}`.trim());
    parts.push(`CONTACT: ${personalInfo.email || ''} | ${personalInfo.phone || ''} | ${personalInfo.location || ''}`.trim());
    if (personalInfo.summary) parts.push(`SUMMARY: ${personalInfo.summary}`);
  }

  if (experience?.length) {
    parts.push('\nEXPERIENCE:');
    experience.forEach((exp) => {
      parts.push(`- ${exp.position || 'Role'} at ${exp.company || 'Company'} (${exp.startDate || ''} - ${exp.current ? 'Present' : exp.endDate || ''})`);
      if (exp.description) parts.push(`  ${exp.description}`);
      if (exp.achievements?.length) parts.push(`  Achievements: ${exp.achievements.join(', ')}`);
    });
  }

  if (education?.length) {
    parts.push('\nEDUCATION:');
    education.forEach((edu) => {
      parts.push(`- ${edu.degree || ''} in ${edu.field || ''} from ${edu.institution || ''} (${edu.startDate || ''} - ${edu.endDate || ''})`);
      if (edu.achievements?.length) parts.push(`  Highlights: ${edu.achievements.join(', ')}`);
    });
  }

  if (skills) {
    const allSkills = [
      ...(skills.technical || []),
      ...(skills.soft || []),
      ...(skills.languages || []),
      ...(skills.certifications || [])
    ];
    if (allSkills.length) parts.push(`\nSKILLS: ${allSkills.join(', ')}`);
  }

  if (projects?.length) {
    parts.push('\nPROJECTS:');
    projects.forEach((project) => {
      parts.push(`- ${project.name || 'Project'}: ${project.description || ''}`);
      if (project.technologies?.length) parts.push(`  Tech: ${project.technologies.join(', ')}`);
    });
  }

  if (customSections?.length) {
    parts.push('\nCUSTOM SECTIONS:');
    customSections.forEach((section) => {
      parts.push(`- ${section.title || 'Custom'}: ${section.content || ''}`);
    });
  }

  return parts.join('\n');
};

const extractResumeProfile = (content) => {
  const technicalSkills = unique(content?.skills?.technical || []);
  const softSkills = unique(content?.skills?.soft || []);
  const languageSkills = unique(content?.skills?.languages || []);
  const certifications = unique(content?.skills?.certifications || []);
  const projectTechnologies = unique((content?.projects || []).flatMap((project) => project.technologies || []));
  const experienceKeywords = unique((content?.experience || []).flatMap((exp) => extractKeywordsFromText(`${exp.position || ''} ${exp.description || ''} ${(exp.achievements || []).join(' ')}`)));
  const projectKeywords = unique((content?.projects || []).flatMap((project) => extractKeywordsFromText(`${project.name || ''} ${project.description || ''}`)));
  const technologiesUsed = unique([...technicalSkills, ...projectTechnologies, ...experienceKeywords, ...projectKeywords]);
  const projects = (content?.projects || []).map((project) => ({
    name: project.name || 'Untitled project',
    description: project.description || '',
    technologies: unique(project.technologies || [])
  }));
  const experience = (content?.experience || []).map((exp) => ({
    company: exp.company || '',
    position: exp.position || '',
    summary: exp.description || '',
    achievements: unique(exp.achievements || [])
  }));
  const education = (content?.education || []).map((edu) => ({
    institution: edu.institution || '',
    degree: edu.degree || '',
    field: edu.field || ''
  }));

  const measurableSignals = resumeToText(content).match(/\b\d+(?:\.\d+)?%|\b\d+x\b|\$\d+|\b\d+\+\b/g) || [];
  const strengthScore = Math.min(
    100,
    20 +
      (technicalSkills.length * 4) +
      (projects.length * 6) +
      (experience.length * 8) +
      (measurableSignals.length * 5)
  );
  const difficulty = strengthScore >= 75 ? 'hard' : strengthScore >= 45 ? 'medium' : 'easy';

  return {
    technicalSkills,
    softSkills,
    languageSkills,
    certifications,
    technologiesUsed,
    projects,
    experience,
    education,
    summary: content?.personalInfo?.summary || '',
    strengthScore,
    difficulty
  };
};

module.exports = {
  resumeToText,
  extractResumeProfile
};
