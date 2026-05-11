const OpenAI = require('openai');
const path = require('path');
const mockAI = require('./mockAI');

require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

const isPlaceholderKey = (key) => {
  if (!key) return true;
  const normalized = key.trim().toLowerCase();
  return [
    'mock_mode',
    'your_openai_api_key_here',
    'your_openai_api_key',
    'replace_with_your_openai_api_key',
    'replace_me',
    'openai_api_key'
  ].includes(normalized);
};

const openAIKey = process.env.OPENAI_API_KEY?.trim();
const groqKey = process.env.GROQ_API_KEY?.trim();
const provider = !isPlaceholderKey(openAIKey) ? 'openai' : (!isPlaceholderKey(groqKey) ? 'groq' : null);
const apiKey = provider === 'openai' ? openAIKey : groqKey;
const baseURL = provider === 'groq' ? 'https://api.groq.com/openai/v1' : undefined;

const defaultModel = provider === 'groq' ? 'llama-3.3-70b-versatile' : 'gpt-4o-mini';
let mockMode = !provider || !apiKey || isPlaceholderKey(apiKey);

if (mockMode) {
  console.warn('Using MOCK AI mode - no real AI API key configured.');
  console.warn('To use real AI, set OPENAI_API_KEY or GROQ_API_KEY in backend/.env and restart.');
} else {
  console.log(`AI provider configured: ${provider} (model: ${defaultModel})`);
}

const getOpenAIClient = () => {
  if (mockMode) return null;
  return new OpenAI({ apiKey, baseURL });
};

const isMockMode = () => mockMode;
const getAIProvider = () => provider;
const getAIModel = () => process.env.AI_MODEL?.trim() || defaultModel;

// FIX: For Groq, do NOT pass response_format at all (return null, not undefined)
// Groq ignores it but some SDK versions throw on unexpected keys
const getJSONResponseFormat = () => {
  if (provider === 'openai') return { type: 'json_object' };
  return null; // Groq: omit this field entirely
};

const getMockAI = () => mockAI;

const parseAIJSON = (content = '') => {
  const raw = String(content).trim();
  try {
    return JSON.parse(raw);
  } catch (error) {
    const start = raw.indexOf('{');
    const end = raw.lastIndexOf('}');
    if (start === -1 || end === -1 || end <= start) throw error;
    return JSON.parse(raw.slice(start, end + 1));
  }
};

// Helper to build chat.completions.create params, safely omitting response_format for Groq
const buildCompletionParams = ({ model, messages, temperature, max_tokens }) => {
  const params = { model, messages, temperature, max_tokens };
  const fmt = getJSONResponseFormat();
  if (fmt !== null) params.response_format = fmt;
  return params;
};

const validateResumeText = (resumeText) => {
  if (!resumeText || typeof resumeText !== 'string') {
    return { valid: false, text: '', error: 'Resume content is empty. Please add content before analyzing.' };
  }

  const cleaned = resumeText.replace(/\s+/g, ' ').trim();

  if (cleaned.length < 50) {
    return {
      valid: false,
      text: cleaned,
      error: 'Resume content is too short for meaningful analysis. Please add more details to your resume.'
    };
  }

  const placeholderPatterns = [
    /^uploaded resume file:/i,
    /^saved and ready for selection/i,
    /^add structured resume details/i
  ];
  if (placeholderPatterns.some((p) => p.test(cleaned))) {
    return {
      valid: false,
      text: cleaned,
      error: 'Resume contains only placeholder text. Please fill in your actual resume details.'
    };
  }

  return { valid: true, text: cleaned };
};

module.exports = {
  getOpenAIClient,
  isMockMode,
  getAIProvider,
  getAIModel,
  getJSONResponseFormat,
  buildCompletionParams,
  parseAIJSON,
  getMockAI,
  validateResumeText
};