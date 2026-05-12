const OpenAI = require('openai');
const path = require('path');
const mockAI = require('./mockAI');

require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

// ---------------------------------------------------------------------------
// Key validation — detect placeholder / mock keys
// ---------------------------------------------------------------------------
const isPlaceholderKey = (key) => {
  if (!key) return true;
  const normalized = key.trim().toLowerCase();
  return [
    'mock_mode',
    'your_gemini_api_key_here',
    'your_openai_api_key_here',
    'your_openai_api_key',
    'replace_with_your_openai_api_key',
    'replace_me',
    'openai_api_key',
    'gemini_api_key',
    'your_groq_api_key_here',
    'your_groq_api_key'
  ].includes(normalized);
};

// ---------------------------------------------------------------------------
// Provider detection — Gemini > OpenAI > Mock
// Gemini uses its OpenAI-compatible endpoint so we can keep the OpenAI SDK
// ---------------------------------------------------------------------------
const geminiKey = process.env.GEMINI_API_KEY?.trim();
const openAIKey = process.env.OPENAI_API_KEY?.trim();

let provider = null;
let apiKey = null;
let baseURL = undefined;

if (!isPlaceholderKey(geminiKey)) {
  provider = 'gemini';
  apiKey = geminiKey;
  // Gemini's OpenAI-compatible endpoint
  baseURL = 'https://generativelanguage.googleapis.com/v1beta/openai/';
} else if (!isPlaceholderKey(openAIKey)) {
  provider = 'openai';
  apiKey = openAIKey;
}

const defaultModel = provider === 'gemini' ? 'gemini-1.5-flash' : 'gpt-4o-mini';
const mockMode = !provider || !apiKey;

// Moved logging below definitions

// ---------------------------------------------------------------------------
// Lazy-initialized OpenAI client (works for both OpenAI & Gemini via baseURL)
// ---------------------------------------------------------------------------
let openaiClient = null;
const getOpenAIClient = () => {
  if (mockMode) return null;
  if (!openaiClient) {
    openaiClient = new OpenAI({ apiKey, baseURL });
  }
  return openaiClient;
};

const isMockMode = () => mockMode;
const getAIProvider = () => provider;
const getAIModel = () => {
  return process.env.AI_MODEL?.trim() || defaultModel;
};

// ---------------------------------------------------------------------------
// Initialization Log
// ---------------------------------------------------------------------------
if (mockMode) {
  console.warn('⚠️  AI STATUS: Running in MOCK mode (Generic results).');
  if (!geminiKey && !openAIKey) {
    console.warn('   REASON: No API keys found in backend/.env');
  } else {
    console.warn('   REASON: Configured keys appear to be placeholders or are missing.');
  }
  console.warn('   To enable real AI, set GEMINI_API_KEY or OPENAI_API_KEY in backend/.env and restart.');
} else {
  console.log('--------------------------------------------------');
  console.log('🚀 AI INITIALIZED');
  console.log(`   Provider: ${provider.toUpperCase()}`);
  console.log(`   Model:    ${getAIModel()}`);
  console.log('   Mode:     Production-ready (Real AI)');
  console.log('--------------------------------------------------');
}


// ---------------------------------------------------------------------------
// JSON response format — Gemini does NOT support response_format
// Only return it for native OpenAI
// ---------------------------------------------------------------------------
const getJSONResponseFormat = () => {
  if (provider === 'openai') return { type: 'json_object' };
  return null; // Gemini: omit — we inject JSON instruction into the prompt instead
};

const getMockAI = () => mockAI;

// ---------------------------------------------------------------------------
// Robust JSON parser — handles Gemini's markdown-wrapped responses,
// trailing text, code fences, and other common LLM output quirks
// ---------------------------------------------------------------------------
const parseAIJSON = (content = '') => {
  const raw = String(content).trim();

  // 1. Direct parse (clean JSON)
  try {
    return JSON.parse(raw);
  } catch (_) { /* continue */ }

  // 2. Extract from ```json ... ``` or ``` ... ``` code fences (Gemini common)
  const fenceMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch) {
    try {
      return JSON.parse(fenceMatch[1].trim());
    } catch (_) { /* continue */ }
  }

  // 3. Find outermost { ... } block
  const objStart = raw.indexOf('{');
  const objEnd = raw.lastIndexOf('}');
  if (objStart !== -1 && objEnd !== -1 && objEnd > objStart) {
    try {
      return JSON.parse(raw.slice(objStart, objEnd + 1));
    } catch (_) { /* continue */ }
  }

  // 4. Find outermost [ ... ] block
  const arrStart = raw.indexOf('[');
  const arrEnd = raw.lastIndexOf(']');
  if (arrStart !== -1 && arrEnd !== -1 && arrEnd > arrStart) {
    try {
      return JSON.parse(raw.slice(arrStart, arrEnd + 1));
    } catch (_) { /* continue */ }
  }

  // 5. Last resort: try to fix common JSON issues (trailing commas, unquoted keys)
  try {
    let sanitized = raw
      .replace(/,\s*}/g, '}')   // trailing comma before }
      .replace(/,\s*]/g, ']');  // trailing comma before ]
    // Try to find JSON in sanitized text
    const sStart = sanitized.indexOf('{');
    const sEnd = sanitized.lastIndexOf('}');
    if (sStart !== -1 && sEnd !== -1 && sEnd > sStart) {
      return JSON.parse(sanitized.slice(sStart, sEnd + 1));
    }
  } catch (_) { /* continue */ }

  throw new Error(
    `Failed to parse AI response as JSON. Raw preview (first 400 chars):\n${raw.substring(0, 400)}`
  );
};

// ---------------------------------------------------------------------------
// Build chat completion params
// For Gemini: injects a JSON-only instruction into the last user message
// because Gemini's OpenAI-compatible endpoint ignores response_format
// ---------------------------------------------------------------------------
const buildCompletionParams = ({ model, messages, temperature, max_tokens }) => {
  // Deep-clone messages so we don't mutate the caller's array
  const clonedMessages = messages.map((m) => ({ ...m }));

  if (provider === 'gemini') {
    // Find the last user message and append JSON instruction
    const lastUserMsg = [...clonedMessages].reverse().find((m) => m.role === 'user');
    if (lastUserMsg) {
      lastUserMsg.content = `${lastUserMsg.content}\n\n⚠️ CRITICAL: Respond with ONLY valid JSON. No markdown formatting, no code fences, no explanatory text outside the JSON. Your entire response must start with { or [ and be parseable by JSON.parse().`;
    }
    return { model, messages: clonedMessages, temperature, max_tokens };
  }

  // OpenAI: use native JSON mode
  return {
    model,
    messages: clonedMessages,
    temperature,
    max_tokens,
    response_format: { type: 'json_object' }
  };
};

// ---------------------------------------------------------------------------
// Resume text validation
// ---------------------------------------------------------------------------
const validateResumeText = (resumeText) => {
  if (!resumeText || typeof resumeText !== 'string') {
    return {
      valid: false,
      text: '',
      error: 'Resume content is empty. Please add content before analyzing.'
    };
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