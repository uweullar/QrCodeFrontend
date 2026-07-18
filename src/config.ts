// Единственное место, где определяется адрес бэкенда.
// Локально Vite подставит значение из .env.development,
// на проде (Vercel/Netlify) — из .env.production или из
// переменной окружения, заданной в панели хостинга.
export const API_BASE_URL = "/api";
import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
