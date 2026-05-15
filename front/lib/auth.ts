const TOKEN_KEY = "auth_token";
const USERS_KEY = "registered_users";

export const HARDCODED_USERS = [
  { id: "1", name: "Student User",      email: "student@university.edu", password: "student123", role: "student" },
  { id: "2", name: "Dr. Sarah Johnson", email: "teacher@university.edu", password: "teacher123", role: "teacher" },
  { id: "3", name: "Dr. James Mitchell",email: "admin@university.edu",   password: "admin123",   role: "admin"   },
];

export type RegisteredUser = { id: string; name: string; email: string; password: string; role: string };

export function getRegisteredUsers(): RegisteredUser[] {
  if (typeof window === "undefined") return [];
  try { return JSON.parse(localStorage.getItem(USERS_KEY) || "[]"); }
  catch { return []; }
}

export function registerUser(user: Omit<RegisteredUser, "id">): { success: boolean; message: string } {
  const all = [...HARDCODED_USERS, ...getRegisteredUsers()];
  if (all.find((u) => u.email === user.email))
    return { success: false, message: "An account with this email already exists." };
  const newUser: RegisteredUser = { ...user, id: Date.now().toString() };
  const existing = getRegisteredUsers();
  localStorage.setItem(USERS_KEY, JSON.stringify([...existing, newUser]));
  return { success: true, message: "Account created successfully." };
}

export type AuthUser = { id: string; name: string; email: string; role: string };

export function createToken(user: AuthUser): string {
  const payload = { ...user, exp: Date.now() + 24 * 60 * 60 * 1000 };
  return btoa(JSON.stringify(payload));
}

export function parseToken(token: string): AuthUser | null {
  try {
    const payload = JSON.parse(atob(token));
    if (payload.exp < Date.now()) { removeToken(); return null; }
    const { exp, ...user } = payload;
    return user as AuthUser;
  } catch {
    return null;
  }
}

export function refreshToken(user: AuthUser): string {
  const newToken = createToken(user);
  saveToken(newToken);
  return newToken;
}

export function validateAndRefreshToken(): AuthUser | null {
  const token = getToken();
  if (!token) return null;
  const user = parseToken(token);
  if (!user) return null;
  refreshToken(user);
  return user;
}

export function saveToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function removeToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export function getRedirectPath(role: string): string {
  if (role === "teacher") return "/teacher/dashboard";
  if (role === "admin")   return "/admin/dashboard";
  return "/student/dashboard";
}
