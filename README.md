# ResumeIQ — AI-Powered Resume Parser

> Parse any PDF or DOCX resume in seconds. Extract name, contact info, skills, education, and experience using Gemini Flash AI + spaCy NLP.

---

## ✨ Features

| Feature | Status |
|---------|--------|
| PDF & DOCX upload (drag & drop) | ✅ MVP |
| Name, email, phone, LinkedIn extraction | ✅ MVP |
| AI skills + summary (Gemini Flash) | ✅ MVP |
| Education & experience timeline | ✅ MVP |
| JD match scoring | ✅ MVP |
| JSON & CSV export | ✅ MVP |
| Session resume listing | ✅ MVP |

---

## 🛠️ Tech Stack

**Frontend:** React 19 + Vite + Tailwind CSS v4  
**Backend:** FastAPI + Python 3.11+  
**NLP:** spaCy `en_core_web_sm`  
**AI:** Google Gemini Flash (`gemini-2.0-flash`)  
**PDF:** pdfplumber | **DOCX:** python-docx

---

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+
- Google Gemini API key — [Get one free](https://aistudio.google.com/apikey)

### 1. Clone the repo
```bash
git clone https://github.com/YOUR_USERNAME/resumeiq.git
cd resumeiq
```

### 2. Backend Setup
```bash
cd backend

# Create virtual environment
python -m venv .venv
.venv\Scripts\activate        # Windows
# source .venv/bin/activate   # macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Download spaCy NLP model (one-time, ~12 MB)
python -m spacy download en_core_web_sm

# Set your Gemini API key
copy .env.example .env
# Edit .env and add your GEMINI_API_KEY

# Run the backend
uvicorn main:app --reload --port 8000
```

Backend will be available at: `http://localhost:8000`  
Interactive API docs: `http://localhost:8000/docs`

### 3. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Run the dev server
npm run dev
```

Frontend will be available at: `http://localhost:5173`

---

## 📡 API Reference

### `POST /parse`
Upload and parse a resume file.

**Request:** `multipart/form-data`
- `file` — PDF or DOCX file (max 5 MB)

**Response:**
```json
{
  "id": "uuid-here",
  "name": "Mimanshu Sharma",
  "email": "mimanshu@email.com",
  "phone": "+91-9876543210",
  "linkedin": "https://linkedin.com/in/mimanshu",
  "education": [
    { "degree": "B.E. CSE (AI & ML)", "institution": "Chandigarh University", "year": "2022–2026" }
  ],
  "experience": [
    { "title": "AI Intern", "company": "XYZ Corp", "duration": "June 2025 – July 2025" }
  ],
  "skills": ["Python", "Machine Learning", "React", "FastAPI"],
  "summary": "AI/ML engineering student...",
  "parsed_at": "2026-05-27T00:00:00Z",
  "filename": "resume.pdf"
}
```

### `POST /match`
Score resume against a job description.

**Request:**
```json
{
  "resume_id": "uuid-here",
  "job_description": "Looking for a Python developer with ML experience..."
}
```

**Response:**
```json
{
  "match_score": 87,
  "matched_skills": ["Python", "Machine Learning"],
  "missing_skills": ["Docker", "Kubernetes"],
  "recommendation": "Strong candidate for ML roles..."
}
```

### `GET /resumes`
List all parsed resumes in the current session.

### `GET /resumes/{id}`
Get a specific parsed resume by UUID.

---

## 🌐 Deployment

### Frontend → Vercel
```bash
cd frontend
npm run build
# Deploy dist/ folder to Vercel
```
Or connect your GitHub repo to Vercel for automatic deployments.

Set environment variable in Vercel:
```
VITE_API_URL=https://your-backend.onrender.com
```

### Backend → Render.com
1. Create a new **Web Service** on Render
2. Connect your GitHub repo
3. Set root directory to `backend/`
4. Build command: `pip install -r requirements.txt && python -m spacy download en_core_web_sm`
5. Start command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
6. Add environment variable: `GEMINI_API_KEY=your_key`

> **Note:** Free tier Render services have a 30-50s cold start after inactivity.

---

## 📁 Project Structure

```
resume-parser/
├── backend/
│   ├── main.py                 ← FastAPI entry point
│   ├── requirements.txt
│   ├── .env.example
│   ├── models/
│   │   └── schemas.py          ← Pydantic models
│   ├── routers/
│   │   ├── parse.py            ← POST /parse
│   │   ├── match.py            ← POST /match
│   │   └── resumes.py          ← GET /resumes
│   └── services/
│       ├── extractor.py        ← Master pipeline orchestrator
│       ├── pdf_reader.py       ← pdfplumber
│       ├── docx_reader.py      ← python-docx
│       ├── regex_parser.py     ← Email, phone, LinkedIn
│       ├── nlp_parser.py       ← spaCy NER
│       └── ai_parser.py        ← Gemini Flash
└── frontend/
    └── src/
        ├── App.jsx
        ├── components/         ← UI components
        ├── hooks/              ← useParse, useMatch
        └── services/           ← api.js (Axios)
```

---

## ⚠️ Known Limitations

- **In-memory storage** — parsed resumes are lost when the server restarts (MVP design)
- **Scanned PDFs** — image-only PDFs cannot be parsed (requires OCR, not in MVP)
- **Gemini rate limits** — Free tier: 60 requests/minute
- **Render cold starts** — Free tier has ~30-50s startup delay

---

## 📄 License

MIT License — built by **Mimanshu Sharma** as part of the ResumeIQ project.
