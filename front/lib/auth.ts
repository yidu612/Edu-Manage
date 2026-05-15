const TOKEN_KEY = "auth_token";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  imageUrl?: string;
};

// ─── Token storage ────────────────────────────────────────────────────────────

export function saveToken(token: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, token);
  // Also persist as a JS-readable cookie so Next.js middleware can protect routes.
  const maxAge = 7 * 24 * 60 * 60; // 7 days — matches backend JWT expiry
  document.cookie = `${TOKEN_KEY}=${token}; path=/; max-age=${maxAge}; SameSite=Strict`;
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function removeToken() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
  document.cookie = `${TOKEN_KEY}=; path=/; max-age=0; SameSite=Strict`;
}

// ─── JWT parsing ──────────────────────────────────────────────────────────────

// Decodes a real JWT without verifying the signature.
// Verification is the backend's job — we just read the claims.
export function parseToken(token: string): AuthUser | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    // Base64URL → Base64 → JSON
    const base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const payload = JSON.parse(atob(base64));

    // JWT exp is in seconds; check against current time in seconds
    if (payload.exp && payload.exp < Date.now() / 1000) {
      removeToken();
      return null;
    }

    // Backend payload shape: { userId, fullName, email, role, imageUrl, ... }
    return {
      id: payload.userId,
      name: payload.fullName,
      email: payload.email,
      role: payload.role,
      imageUrl: payload.imageUrl,
    };
  } catch {
    return null;
  }
}

// Called on app start and tab focus. Tries to reuse the stored token.
// Falls back to null if the token is missing or locally expired.
// The Axios 401 interceptor handles the case where the server rejects it.
export function validateAndRefreshToken(): AuthUser | null {
  const token = getToken();
  if (!token) return null;
  return parseToken(token);
}

// ─── Navigation helpers ───────────────────────────────────────────────────────

export function getRedirectPath(role: string): string {
  if (role === "teacher") return "/teacher/dashboard";
  if (role === "admin") return "/admin/dashboard";
  return "/student/dashboard";
}
