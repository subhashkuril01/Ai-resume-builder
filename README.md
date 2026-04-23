# ResumeAI — Full-Stack MERN AI Resume Builder

A production-ready AI-powered resume builder built with the MERN stack. Features real OpenAI integration, ATS scoring, job matching, 6 professional templates, PDF export, and public sharing.

---

## Project Structure

```
resume-builder/
├── backend/                  # Node.js + Express API
│   ├── controllers/          # Business logic
│   ├── middleware/           # Auth + error handling
│   ├── models/               # Mongoose schemas
│   ├── routes/               # REST endpoints
│   └── server.js             # Entry point
└── frontend/                 # React + Vite SPA
    └── src/
        ├── api/              # Axios API client
        ├── components/       # Reusable components
        │   ├── builder/      # Form steps + resume templates
        │   └── common/       # Navbar, Spinner, ScoreRing
        ├── context/          # Auth + Theme context
        ├── hooks/            # useDebounce, useAutoSave
        ├── pages/            # All page components
        └── utils/            # PDF export
```

---

## Quick Start

### 1. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/resume-builder
JWT_SECRET=your_super_secret_key_here
OPENAI_API_KEY=sk-...your_openai_key...
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

```bash
npm run dev
```

Backend runs at: `http://localhost:5000`

---

### 2. Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
```

The Vite dev server proxies `/api` → `http://localhost:5000` automatically.

```bash
npm run dev
```

Frontend runs at: `http://localhost:5173`

---

## Features

| Feature | Details |
|---|---|
| **Authentication** | JWT, bcrypt, protected routes |
| **Resume Builder** | Multi-step form, dynamic fields, auto-save |
| **6 Templates** | Modern, Classic, Minimal, Executive, Creative, Tech |
| **Live Preview** | Real-time resume preview while editing |
| **ATS Analyzer** | GPT-4o powered score (0–100) with keyword analysis |
| **Job Match** | Match % against job descriptions |
| **AI Enhancer** | Improve descriptions and summaries with AI |
| **PDF Export** | html2canvas + jsPDF, A4 format |
| **Public Sharing** | Unique URL per resume |
| **Version History** | Save/restore up to 10 versions |
| **Dark/Light Mode** | Persistent theme preference |

---

## API Endpoints

### Auth
```
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/me
PUT    /api/auth/profile
PUT    /api/auth/password
```

### Resumes
```
GET    /api/resumes
POST   /api/resumes
GET    /api/resumes/:id
PUT    /api/resumes/:id
DELETE /api/resumes/:id
POST   /api/resumes/:id/duplicate
POST   /api/resumes/:id/share
GET    /api/resumes/:id/versions
POST   /api/resumes/:id/versions
POST   /api/resumes/:id/versions/:vid/restore
```

### AI
```
POST   /api/analyzer/ats
POST   /api/analyzer/enhance
GET    /api/analyzer/history/:resumeId
POST   /api/job-match/analyze
POST   /api/job-match/keywords
```

### Public
```
GET    /api/public/resume/:slug
```

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Description |
|---|---|
| `PORT` | Server port (default: 5000) |
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret for JWT signing |
| `JWT_EXPIRE` | Token expiry (default: 7d) |
| `OPENAI_API_KEY` | OpenAI API key (required for AI features) |
| `FRONTEND_URL` | Frontend URL for CORS |
| `NODE_ENV` | development / production |

### Frontend (`frontend/.env`)

| Variable | Description |
|---|---|
| `VITE_API_URL` | Backend API base URL |

---

## Deployment

### Backend (Render / Railway)
1. Set all environment variables in the dashboard
2. Build command: `npm install`
3. Start command: `node server.js`

### Frontend (Vercel / Netlify)
1. Set `VITE_API_URL` to your deployed backend URL
2. Build command: `npm run build`
3. Publish directory: `dist`

---

## Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, React Router v6, Axios
- **Backend**: Node.js, Express, MongoDB, Mongoose
- **AI**: OpenAI GPT-4o-mini
- **Auth**: JWT + bcryptjs
- **PDF**: html2canvas + jsPDF
- **Security**: Helmet, CORS, express-rate-limit
