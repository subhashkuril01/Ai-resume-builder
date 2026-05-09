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
const defaultModel = provider === 'groq' ? 'llama-3.1-8b-instant' : 'gpt-4o-mini';
let mockMode = !provider || !apiKey || isPlaceholderKey(apiKey);

if (mockMode) {
  console.warn('Using MOCK AI mode - no real AI API key configured.');
  console.warn('To use real AI, set OPENAI_API_KEY or GROQ_API_KEY in backend/.env and restart.');
} else {
  console.log(`AI provider configured: ${provider}`);
}

const getOpenAIClient = () => {
  if (mockMode) {
    return null; // Signal to use mock mode
  }
  return new OpenAI({ apiKey, baseURL });
};

const isMockMode = () => mockMode;
const getAIProvider = () => provider;
const getAIModel = () => process.env.AI_MODEL?.trim() || defaultModel;
const getJSONResponseFormat = () => (provider === 'openai' ? { type: 'json_object' } : undefined);
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

module.exports = {
  getOpenAIClient,
  isMockMode,
  getAIProvider,
  getAIModel,
  getJSONResponseFormat,
  parseAIJSON,
  getMockAI
};
