import axios from "axios";

const rawApiBaseUrl = import.meta.env.VITE_API_URL?.trim().replace(/\/$/, "");

const isLocalhostUrl = (value) =>
    /^https?:\/\/(localhost|127(?:\.\d{1,3}){3})(?::\d+)?(?:\/|$)/i.test(value);

const API_BASE_URL =
    rawApiBaseUrl && !(import.meta.env.PROD && isLocalhostUrl(rawApiBaseUrl))
        ? rawApiBaseUrl
        : import.meta.env.DEV
            ? "http://localhost:5000/api"
            : "https://webjobportl-backend.vercel.app/api";

const API = axios.create({
    baseURL: API_BASE_URL,
})

export const apiUrl = (path = "") => {
    const normalizedPath = path.startsWith("/") ? path : `/${path}`;
    return `${API_BASE_URL.replace(/\/$/, "")}${normalizedPath}`;
};

export const assetUrl = (path = "") => {
    if (!path) return "";
    if (/^(https?:)?\/\//.test(path) || path.startsWith("data:") || path.startsWith("blob:")) {
        return path;
    }

    const normalizedPath = path.startsWith("/") ? path : `/${path}`;
    const origin = API_BASE_URL.startsWith("http")
        ? API_BASE_URL.replace(/\/api$/, "").replace(/\/$/, "")
        : window.location.origin;

    return `${origin}${normalizedPath}`;
};

API.interceptors.request.use((req) => {
    const user = JSON.parse(localStorage.getItem("jobportal_user"));
    if (user?.token) {
        req.headers.Authorization = `Bearer ${user.token}`;
    }
    return req;
})

export default API;