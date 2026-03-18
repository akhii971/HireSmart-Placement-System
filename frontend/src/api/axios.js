import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});


const getTokenForRequest = (url = "", method = "get") => {
  let key = "authUser"; // default: student

  if (url.startsWith("/admin")) {
    key = "adminUser";
  } else if (url.startsWith("/interviews/student")) {
    // Student viewing their own interviews — use student token
    key = "authUser";
  } else if (
    url.startsWith("/messages")
  ) {
    // Messages are shared: pick token based on the current page path
    const path = window.location.pathname;
    key = path.startsWith("/recruiter") ? "recruiterUser" : "authUser";
  } else if (
    url.startsWith("/recruiter") ||
    url.startsWith("/interviews") ||
    url.includes("/jobs/my") ||
    url.startsWith("/applications/recruiter") ||
    url.startsWith("/applications/job") ||
    url.startsWith("/applications/detail") ||
    url.match(/\/applications\/[a-f0-9]+\/status/)
  ) {
    key = "recruiterUser";
  } else if (
    url.startsWith("/jobs") &&
    ["post", "put", "delete"].includes(method.toLowerCase())
  ) {
    // Job create / update / delete = recruiter action
    key = "recruiterUser";
  }

  try {
    const stored = localStorage.getItem(key);
    if (stored) return JSON.parse(stored).token;
  } catch (_) {
    // ignore
  }
  return null;
};

// ✅ Automatically attach the correct token based on the request URL + method
api.interceptors.request.use(
  (config) => {
    const token = getTokenForRequest(config.url, config.method);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;