# AI Backend Setup Guide

## Quick Start (Mock Mode - No API Key Required)

The app is already configured to work **without a real OpenAI API key**. The AI features run in **mock mode**, generating realistic demo responses instantly with no costs.

### Current Setup

- **Status**: ✅ AI features operational in mock mode
- **Mode**: Demo mode with realistic responses
- **Cost**: $0

### What Works in Mock Mode

✅ ATS Score Analysis
✅ Resume Enhancement
✅ Job Matching
✅ Keyword Extraction

All features return professional, realistic responses perfect for testing and demos.

---

## Upgrade to Real AI (Optional)

To use real OpenAI GPT-4 responses instead of mock data:

### 1. Get an OpenAI API Key

1. Go to [https://platform.openai.com/api/keys](https://platform.openai.com/api/keys)
2. Sign in or create an account
3. Click "Create new secret key"
4. Copy the key (starts with `sk-`)

### 2. Update `.env`

Edit `backend/.env`:

```env
OPENAI_API_KEY=sk-your-actual-key-here
```

Replace `sk-your-actual-key-here` with your real key from step 1.

### 3. Restart Backend

```bash
cd backend
npm start
```

You'll see this message on startup:
```
✅ OpenAI API configured. Using real AI responses.
```

Instead of:
```
⚠️  Using MOCK AI mode - no real OpenAI API key configured.
```

---

## Switching Back to Mock Mode

Simply set:
```env
OPENAI_API_KEY=mock_mode
```

Then restart the backend.

---

## Mock Mode Limitations

- Responses are static/pre-generated (good for demo/testing)
- All resumes get similar analysis patterns
- No real AI training data analysis

## Real Mode Advantages

- Personalized AI analysis based on actual resume content
- Accurate ATS scoring
- Real keyword recommendations from job market data
- Better job matching analysis
- ~$0.01-0.05 per API call

---

## Cost Tracking

Monitor your OpenAI usage at [https://platform.openai.com/account/billing/overview](https://platform.openai.com/account/billing/overview)

---

## Troubleshooting

**Q: Getting "OpenAI API key not configured" error?**
- Ensure `.env` has `OPENAI_API_KEY=sk-...` (real key from OpenAI)
- Restart the backend server
- Check no spaces around the key

**Q: Mock mode responses seem generic?**
- This is normal! Mock mode returns realistic demo data
- Upgrade to real API key for personalized analysis

**Q: How to verify which mode is active?**
- Check backend logs on startup
- Mock mode: `⚠️  Using MOCK AI mode`
- Real mode: `✅ OpenAI API configured`
