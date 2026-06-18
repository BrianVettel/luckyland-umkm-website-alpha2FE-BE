/**
 * API Fetch Wrapper
 * Automatically attaches Authorization headers if a token exists in localStorage.
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

interface ApiOptions extends RequestInit {
  data?: any;
}

export async function apiFetch(endpoint: string, options: ApiOptions = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  // Setup headers
  const headers = new Headers(options.headers || {});
  
  if (options.data && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  // Retrieve token from localStorage (client-side only)
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("lucky_token");
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }

  const config: RequestInit = {
    ...options,
    headers,
  };

  if (options.data) {
    config.body = JSON.stringify(options.data);
  }

  const response = await fetch(url, config);
  
  if (response.status === 401 || response.status === 403) {
    if (typeof window !== "undefined") {
      localStorage.removeItem("lucky_token");
      window.location.href = "/";
    }
    throw new Error("Sesi Anda telah berakhir atau Anda tidak memiliki akses.");
  }

  let json;
  try {
    json = await response.json();
  } catch (err) {
    throw new Error("Server returned an invalid JSON response");
  }

  if (!response.ok) {
    // Standardize error throwing based on backend format
    throw new Error(json.message || "An error occurred");
  }

  return json;
}
