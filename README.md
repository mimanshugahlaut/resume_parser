---
title: Resume Parser
emoji: 📄
colorFrom: blue
colorTo: green
sdk: docker
pinned: false
---
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
python -m venv .venv
.venv\Scripts\activate
pip install -r backend\requirements.txt
python -m spacy download en_core_web_sm  # optional but recommended
set GEMINI_API_KEY=your_key_here        # or add to backend/.env
uvicorn backend.main:app --reload --port 8000
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

## Deployment

### Hugging Face Spaces (recommended free option)

This repo includes a root-level `Dockerfile` for Hugging Face Spaces. It builds the React frontend, installs the FastAPI backend, and serves both from one container.

Deploy steps:

1. Create a new Hugging Face Space.
2. Choose **Docker** as the Space SDK.
3. Connect or upload this GitHub repo from the `main` branch.
4. Add `GEMINI_API_KEY` as a Space secret.
5. Wait for the Space build to finish.

The app runs on Hugging Face's default container port `7860`. The frontend calls the backend on the same origin, so `VITE_API_URL` is not required for the Space deployment.

### Render

This repo includes a root-level `render.yaml` Blueprint for Render:

- `resumeiq-backend` FastAPI web service
- `resumeiq-frontend` Vite static site

Deploy from Render with **New > Blueprint**, connect this GitHub repo, and select the `main` branch.

Set `GEMINI_API_KEY` in the backend service environment. If Render assigns different service URLs, update:

- Backend `FRONTEND_ORIGIN`
- Frontend `VITE_API_URL`

The frontend build expects `VITE_API_URL` to point to the deployed backend URL.

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

## GitHub

- **Repository:** https://github.com/mimanshugahlaut/resume_parser
- **Contributing:** Please open issues for bugs or feature requests. To contribute code:
   1. Fork the repo and create a feature branch `feature/your-change`
   2. Implement your changes and add tests where appropriate
   3. Open a Pull Request targeting `main` and describe the change
- **Code style:** Follow existing repository conventions (Python: PEP8, JS: project ESLint/Prettier if used).
- **CI / Actions:** Add a GitHub Actions workflow under `.github/workflows/` to run tests (`backend/test_client.py`) and lint on push/PR.
- **Releases:** Tag a release with `git tag -a vX.Y.Z -m "Release notes"` and `git push --tags`.
- **Branching model:** Use `main` for production-ready code; open short-lived feature branches for development.

---

## License

MIT

