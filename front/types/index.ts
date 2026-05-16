// Canonical frontend types — derived from backend models.
// All fields use the normalized names produced by the api.ts interceptor:
//   _id  → id   (original _id also present)
//   fullName → name  (original fullName also present)

export interface User {
  id: string;
  _id?: string;
  name: string;
  fullName?: string;
  email: string;
  role: "student" | "teacher" | "admin" | "community";
  department?: string;
  bio?: string;
  phone?: string;
  location?: string;
  imageUrl?: string;
  socialLinks?: { platform: string; url: string }[];
  skills?: string[];
}

export interface Attachment {
  name: string;
  url: string;
  type?: string;
  size: number;
}

export interface FeedbackSection {
  title: string;
  rating: number;
  strengths: string;
  areasForImprovement: string;
  comments: string;
}

export interface ProposalFeedback {
  id: string;
  _id?: string;
  teacher: User | string;
  projectTitle: string;
  status: "pending" | "approved" | "rejected" | "needs_revision";
  sections: FeedbackSection[];
  attachments: Attachment[];
  createdAt: string;
  updatedAt: string;
}

export interface Proposal {
  id: string;
  _id?: string;
  title: string;
  student: User | string;
  teacher: User | string;
  status: "pending" | "approved" | "rejected";
  attachments: Attachment[];
  feedbackList: ProposalFeedback[];
  createdAt: string;
  updatedAt: string;
}

export interface ProjectComment {
  id: string;
  commenterId: string;
  name: string;
  image?: string;
  text: string;
}

export interface Project {
  id: string;
  _id?: string;
  title: string;
  elevatorPitch?: string;
  projectDescription?: string;
  tags?: string[];
  coverImage?: string;
  teamMembers?: { id: string; name: string; role: string }[];
  status: boolean;
  reviewedByTeacherId?: string;
  views?: number;
  likes?: string[];
  comments?: ProjectComment[];
  createdAt: string;
  updatedAt: string;
}

export interface Milestone {
  id: string;
  projectId: string;
  name: string;
  description?: string;
  deadline: string;
  status: "pending" | "in_progress" | "completed" | "overdue";
  completedAt?: string;
}

export interface Notification {
  id: string;
  recipientId: string;
  notificationType: "feedback" | "milestone" | "proposal" | "system";
  message: string;
  timestamp: string;
  isRead: boolean;
  priority: "low" | "medium" | "high";
}

export interface TeamMember {
  user_id: string;
  role: "leader" | "member";
  invitation_status: "pending" | "accepted" | "rejected";
  user: {
    id: string;
    name: string;
    fullName?: string;
    email: string;
    department?: string;
  };
}

export interface Team {
  id: string;
  _id?: string;
  name: string;
  description?: string;
  code: string;
  createdAt: string;
  status: "active" | "approved" | "rejected";
  is_finalized: boolean;
  creator: { id: string; name: string; email: string };
  members: TeamMember[];
}
