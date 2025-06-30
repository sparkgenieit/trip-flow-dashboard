// src/services/auth.ts

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000";

export const login = async (email: string, password: string) => {
  const res = await fetch(`${API_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.message || "Login failed");
  }

  const data = await res.json();
  localStorage.setItem("authToken", data.accessToken);
  return data;
};
