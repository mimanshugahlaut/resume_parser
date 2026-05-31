# Resume Parser

A lightweight AI-assisted resume parsing web app (FastAPI backend + React/Vite frontend).

This project accepts PDF or DOCX resumes, extracts structured data (contact info, skills, education, experience), generates a short summary using Google Gemini, and provides a match-scoring endpoint to compare a parsed resume against a job description.

Key elements implemented in this repository:
- File upload and parsing pipeline (PDF/DOCX)
- Regex extraction for email/phone/LinkedIn
- Optional spaCy NER for entity extraction (`en_core_web_sm`)
- Gemini Flash integration for structured extraction and match scoring
- In-memory session storage for parsed resumes (MVP)
- React + Vite frontend with Axios API client

---

## Quick Start

Prerequisites:
- Python 3.11+
- Node.js 18+

Backend (development):

```powershell
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
python -m spacy download en_core_web_sm  # optional but recommended
set GEMINI_API_KEY=your_key_here        # or add to backend/.env
uvicorn main:app --reload --port 8000
```

Backend API will be available at `http://localhost:8000` (interactive docs at `/docs`).

Frontend (development):

```bash
cd frontend
npm install
npm run dev
```

Frontend dev server defaults to `http://localhost:5173` and reads backend URL from `VITE_API_URL`.

---

## Environment

- `GEMINI_API_KEY` — required for AI extraction and match scoring (set in environment or `backend/.env`).
- `VITE_API_URL` — frontend environment variable to point to the backend (defaults to `http://localhost:8000`).

---

## API (summary)

- POST `/parse` — multipart upload (`file`): returns parsed resume JSON (see `backend/models/schemas.py`).
- POST `/match` — JSON body `{ resume_id, job_description }`: returns match score and recommendations.
- GET `/resumes` — list parsed resumes in current server session.
- GET `/resumes/{id}` — retrieve a parsed resume by id.

See FastAPI docs at `http://localhost:8000/docs` for full request/response schemas.

---

## Project layout

```
resume-parser/
├─ backend/
│  ├─ main.py          # FastAPI app and startup logic
│  ├─ requirements.txt
│  ├─ models/schemas.py # Pydantic models for API
│  ├─ routers/          # /parse, /match, /resumes
│  └─ services/         # extractor, pdf/docx readers, regex, ai_parser
└─ frontend/
   └─ src/             # React app, components, hooks, api client
```

---

## Notes & limitations

- Parsed resumes are stored only in memory and will be lost on restart.
- Scanned/image-only PDFs are not OCR'd (use OCR pre-processing for those files).
- Gemini API usage requires a valid API key and may incur costs or rate limits.

---

## License

MIT

