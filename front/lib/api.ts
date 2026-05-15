import axios from "axios";

const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

const api = axios.create({
  baseURL: BASE,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("auth_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("auth_token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;

// ─── Types ───────────────────────────────────────────────────────────────────

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: "leader" | "member";
  status: "active" | "pending";
}

export interface AdvisorRequest {
  teacher: { id: string; name: string; department: string };
  status: "pending" | "accepted" | "rejected";
  requestedAt: string;
}

export interface Team {
  id: string;
  name: string;
  description: string;
  code: string;
  createdAt: string;
  status: "pending_approval" | "approved" | "rejected";
  members: TeamMember[];
  advisor: string | null;
  advisorRequest: AdvisorRequest | null;
  project_id?: string;
}

export interface Teacher {
  id: string;
  name: string;
  email: string;
  department: string;
  specialization: string;
  slots: number;
}

export interface Student {
  id: string;
  name: string;
  email: string;
  department: string;
}

export interface Message {
  id: string;
  groupId: string;
  userId: string;
  senderName: string;
  content: string;
  createdAt: string;
}

// ─── Team API ────────────────────────────────────────────────────────────────

export const teamApi = {
  getMyTeam: () =>
    api.get<Team>("/teams/my").then((r) => r.data),

  createTeam: (name: string, description: string) =>
    api.post<Team>("/teams", { name, description }).then((r) => r.data),

  joinTeam: (code: string) =>
    api.post<Team>("/teams/join", { code }).then((r) => r.data),

  leaveTeam: (teamId: string) =>
    api.post(`/teams/${teamId}/leave`).then((r) => r.data),

  removeMember: (teamId: string, memberId: string) =>
    api.delete(`/teams/${teamId}/members/${memberId}`).then((r) => r.data),

  inviteByEmail: (teamId: string, email: string) =>
    api.post(`/teams/${teamId}/invite`, { email }).then((r) => r.data),

  updateSettings: (teamId: string, name: string, description: string) =>
    api.put<Team>(`/teams/${teamId}`, { name, description }).then((r) => r.data),

  getAvailableTeachers: () =>
    api.get<Teacher[]>("/teachers/available").then((r) => r.data),

  getAvailableStudents: () =>
    api.get<Student[]>("/students/available").then((r) => r.data),

  requestAdvisor: (teamId: string, teacherId: string) =>
    api.post(`/teams/${teamId}/advisor-request`, { teacherId }).then((r) => r.data),
};

// ─── Documentation API ──────────────────────────────────────────────────────

export type DocSection = "Proposal" | "Design" | "Implementation" | "Final";

export interface ProjectDocument {
  id: number;
  project_id: string;
  section: DocSection;
  file_name: string;
  file_type: string;
  file_size: number;
  url: string;
  status: "pending" | "approved" | "rejected";
  uploaded_at: string;
}

export const documentationApi = {
  list: (projectId: string) =>
    api.get<{ data: ProjectDocument[] }>(`/projects/${projectId}/documentation`).then((r) => r.data.data),

  upload: (
    projectId: string,
    section: DocSection,
    file: File,
    onProgress: (pct: number) => void
  ) => {
    const form = new FormData();
    form.append("file", file);
    form.append("section", section);
    return api.post<{ data: ProjectDocument }>(
      `/projects/${projectId}/documentation`,
      form,
      {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (e) => {
          if (e.total) onProgress(Math.round((e.loaded * 100) / e.total));
        },
      }
    ).then((r) => r.data.data);
  },

  replace: (
    docId: number,
    file: File,
    onProgress: (pct: number) => void
  ) => {
    const form = new FormData();
    form.append("file", file);
    return api.put<{ data: ProjectDocument }>(
      `/documentation/${docId}`,
      form,
      {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (e) => {
          if (e.total) onProgress(Math.round((e.loaded * 100) / e.total));
        },
      }
    ).then((r) => r.data.data);
  },

  delete: (docId: number) =>
    api.delete(`/documentation/${docId}`),

  downloadUrl: (docId: number) =>
    `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1"}/documentation/${docId}/download`,
};

// ─── Discussion API ───────────────────────────────────────────────────────────

export const discussionApi = {
  getMessages: (groupId: string) =>
    api.get<Message[]>(`/teams/${groupId}/messages`).then((r) => r.data),

  sendMessage: (groupId: string, content: string) =>
    api.post<Message>(`/teams/${groupId}/messages`, { content }).then((r) => r.data),
};

// ─── WebSocket helper ─────────────────────────────────────────────────────────

export function createDiscussionSocket(
  groupId: string,
  token: string,
  onMessage: (msg: Message) => void
): WebSocket {
  const wsBase = BASE.replace(/^http/, "ws");
  const ws = new WebSocket(`${wsBase}/teams/${groupId}/ws?token=${token}`);
  ws.onmessage = (e) => {
    try {
      const msg: Message = JSON.parse(e.data);
      onMessage(msg);
    } catch {
      // ignore malformed frames
    }
  };
  return ws;
}
