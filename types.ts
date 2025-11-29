export enum Role {
  MANAGER = 'MANAGER',
  EMPLOYEE = 'EMPLOYEE'
}

export enum TaskStatus {
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED'
}

export interface Note {
  id: string;
  text: string;
  author: string;
  date: string;
  lastEditedBy?: string;
}

export interface User {
  id: string;
  name: string;
  username: string; // e.g., lamec.zehrs
  email: string;
  password?: string;
  role: Role;
  avatar?: string;
  level?: number; // Gamification
  xp?: number; // Gamification
  privateNotes?: Note[]; // Manager notes for feedback
}

export interface Task {
  id: string;
  title: string;
  description: string;
  assignedToId: string; // User ID
  status: TaskStatus;
  imageUrl?: string;
  instructions?: string;
  dueDate: string;
  xpReward: number; // Gamification
  managerVerified?: boolean; // If manager approved the completion
  assignedBy?: string;
}

export interface Shift {
  id: string;
  title: string;
  date: string;
  fileUrl: string; // Mock URL or Base64
  fileName: string;
  uploadedBy: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
}

export type ViewState = 'DASHBOARD' | 'TEAM' | 'TASKS' | 'SHIFTS';