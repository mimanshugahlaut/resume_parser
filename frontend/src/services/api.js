/**
 * api.js — Axios API layer for ResumeIQ
 * All backend communication goes through this file.
 */

import axios from 'axios'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 60000, // 60s — Gemini calls can take time
})

// Response error interceptor — normalise error messages
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.detail ||
      error.response?.data?.message ||
      error.message ||
      'An unexpected error occurred.'
    return Promise.reject(new Error(message))
  }
)

/**
 * Upload and parse a resume file.
 * @param {File} file - PDF or DOCX file
 * @param {function} onUploadProgress - Optional progress callback
 * @returns {Promise<ParsedResume>}
 */
export const parseResume = async (file, onUploadProgress) => {
  const formData = new FormData()
  formData.append('file', file)

  const response = await api.post('/parse', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: onUploadProgress
      ? (e) => onUploadProgress(Math.round((e.loaded * 100) / e.total))
      : undefined,
  })
  return response.data
}

/**
 * Score a resume against a job description.
 * @param {string} resumeId - UUID from a prior parseResume call
 * @param {string} jobDescription - Full job description text
 * @returns {Promise<MatchResult>}
 */
export const matchResume = async (resumeId, jobDescription) => {
  const response = await api.post('/match', {
    resume_id: resumeId,
    job_description: jobDescription,
  })
  return response.data
}

/**
 * Get all parsed resumes in the current session.
 * @returns {Promise<ParsedResume[]>}
 */
export const getResumes = async () => {
  const response = await api.get('/resumes')
  return response.data
}

/**
 * Get a specific parsed resume by ID.
 * @param {string} id
 * @returns {Promise<ParsedResume>}
 */
export const getResume = async (id) => {
  const response = await api.get(`/resumes/${id}`)
  return response.data
}

export default api
