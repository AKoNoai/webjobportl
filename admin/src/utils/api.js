const rawApiBaseUrl = import.meta.env.VITE_API_URL?.trim().replace(/\/$/, "");

const API_BASE_URL = rawApiBaseUrl || (import.meta.env.DEV ? "http://localhost:5000/api" : "/api");

const API_ORIGIN = API_BASE_URL.startsWith("http")
  ? API_BASE_URL.replace(/\/api$/, "").replace(/\/$/, "")
  : window.location.origin;

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
  return `${API_ORIGIN}${normalizedPath}`;
};
