const OpenAI = require('openai');
const mockAI = require('./mockAI');

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

// Initialize mock mode based on API key at module load time
const apiKey = process.env.OPENAI_API_KEY?.trim();
let mockMode = !apiKey || isPlaceholderKey(apiKey) || apiKey === 'mock_mode';

// Log the mode once at startup
if (mockMode) {
  console.warn('⚠️  Using MOCK AI mode - no real OpenAI API key configured.');
  console.warn('⚠️  To use real AI, set OPENAI_API_KEY=sk-... in backend/.env and restart.');
}

const getOpenAIClient = () => {
  if (mockMode) {
    return null; // Signal to use mock mode
  }
  return new OpenAI({ apiKey });
};

const isMockMode = () => mockMode;
const getMockAI = () => mockAI;

module.exports = { getOpenAIClient, isMockMode, getMockAI };
