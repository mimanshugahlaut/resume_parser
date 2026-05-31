---
title: Resume Parser
emoji: 📄
colorFrom: blue
colorTo: green
sdk: docker
pinned: false
---

<div align="center">
  <h1>📄 ResumeIQ</h1>
  <p><strong>A lightning-fast, AI-powered resume parsing engine.</strong></p>

  [![Live on Hugging Face](https://img.shields.io/badge/%F0%9F%A4%97%20Hugging%20Face-Spaces-blue?style=for-the-badge)](https://mimanshugahlaut-resume-parser.hf.space/)
  [![Python 3.11+](https://img.shields.io/badge/python-3.11+-blue.svg?style=for-the-badge)](https://www.python.org/downloads/)
  [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
</div>

<br />

**ResumeIQ** effortlessly extracts structured data from PDF and DOCX resumes, scoring them against job descriptions using Google Gemini 2.5 Flash and NLP techniques. It features a blazing-fast FastAPI backend and a sleek React/Vite frontend.

---

## ✨ Key Features

- **📂 Multi-Format Support:** Upload and parse both `.pdf` and `.docx` resumes instantly.
- **🧠 AI-Powered Extraction:** Uses **Google Gemini 2.5 Flash** for deep contextual extraction and professional summary generation.
- **🔍 Local NLP Fallback:** Employs **spaCy NER** (`en_core_web_sm`) and Regex for fast extraction of emails, phone numbers, and LinkedIn URLs without API dependency.
- **📊 ATS JD Matching:** Compare a parsed resume against a Job Description to get an ATS Match Score and personalized improvement recommendations.
- **⚡ Modern Tech Stack:** Built on **FastAPI** for high performance and **React + Vite** for a snappy, glassmorphic UI.

---

## 🛠️ Technology Stack

| Frontend | Backend | AI / NLP |
|----------|---------|----------|
| React 18 | FastAPI | Google Gemini 2.5 Flash |
| Vite | Python 3.11+ | spaCy (`en_core_web_sm`) |
| Vanilla CSS | Uvicorn | Regex Pipelines |

---

## 🚀 Getting Started (Local Development)

### Prerequisites
- Python 3.11+
- Node.js 18+
- [Google Gemini API Key](https://aistudio.google.com/app/apikey)

### 1️⃣ Backend Setup
Navigate to the `backend` directory or root and start the API:
```powershell
python -m venv .venv
.venv\Scripts\activate
pip install -r backend\requirements.txt
python -m spacy download en_core_web_sm  # Optional but highly recommended
set GEMINI_API_KEY=your_gemini_api_key   # Or add it to backend/.env
uvicorn backend.main:app --reload --port 8000
```
*API Docs will be available at: [http://localhost:8000/docs](http://localhost:8000/docs)*

### 2️⃣ Frontend Setup
In a new terminal, navigate to the `frontend` directory:
```bash
cd frontend
npm install
npm run dev
```
*Frontend runs at: [http://localhost:5173](http://localhost:5173)*

*(Note: The frontend automatically connects to the backend at `http://localhost:8000` via the `VITE_API_URL` environment variable).*

---

## ☁️ Deployment

### Hugging Face Spaces (Recommended)
This repository is configured to deploy instantly on [Hugging Face Spaces](https://huggingface.co/spaces) using Docker. 
1. Create a new Space and select **Docker**.
2. Connect this GitHub repository.
3. Add `GEMINI_API_KEY` to your Space Secrets.
4. The space will automatically build and serve both the backend and static frontend from port `7860`.

### Render
A `render.yaml` blueprint is included for deploying the backend and frontend as separate services on [Render](https://render.com). 
- Connect your repo, select **New > Blueprint**.
- Ensure you set `GEMINI_API_KEY` in the backend environment.

---

## 📖 API Endpoints

- `POST /parse`: Upload a multipart `file` (PDF/DOCX) to extract all structured data.
- `POST /match`: Provide a `{ resume_id, job_description }` JSON body to receive an ATS match score.
- `GET /resumes`: List all parsed resumes in the current temporary session.
- `GET /resumes/{id}`: Retrieve a specific parsed resume.

---

## ⚠️ Limitations & Notes
- **In-Memory Storage:** Parsed data is stored in memory and will be wiped upon server restart. Not suitable for production databases without modification.
- **Image PDFs:** Scanned, image-only PDFs are not currently supported (requires OCR preprocessing).
- **API Limits:** Gemini usage is subject to Google's rate limits and pricing tiers.

---

## 🤝 Contributing
Contributions are welcome! 
1. Fork the repository.
2. Create your feature branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

## 📄 License
Distributed under the MIT License. See `LICENSE` for more information.
