const OpenAI = require('openai');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, 'backend', '.env') });

const apiKey = process.env.GEMINI_API_KEY;

async function test(url, modelName) {
  console.log(`Testing URL: ${url} with model: ${modelName}`);
  const client = new OpenAI({ apiKey, baseURL: url });
  try {
    const res = await client.chat.completions.create({
      model: modelName,
      messages: [{ role: 'user', content: 'Say hello' }],
      max_tokens: 10
    });
    console.log(`✅ Success with ${url}:`, res.choices[0].message.content);
    return true;
  } catch (e) {
    console.log(`❌ Failed with ${url}: ${e.message}`);
    return false;
  }
}

async function run() {
  const urls = [
    'https://generativelanguage.googleapis.com/v1beta/openai/',
    'https://generativelanguage.googleapis.com/v1beta/openai',
    'https://generativelanguage.googleapis.com/v1beta/'
  ];
  const models = ['gemini-1.5-flash', 'models/gemini-1.5-flash'];

  for (const url of urls) {
    for (const model of models) {
      if (await test(url, model)) return;
    }
  }
}

run();
