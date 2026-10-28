export type Role = 'ADMIN' | 'USER';

export interface Account {
  id: number;
  username: string;
  fullname: string;
  email: string;
  departmentId?: number;
  departmentName?: string;
  positionId?: number;
  positionName?: string;
  createDate: string;
  role: Role;
}

export interface Department {
  id: number;
  name: string;
  accountCount: number;
}

export interface Position {
  id: number;
  name: string;
  accountCount: number;
}

export interface AuthResponse {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  account: Account;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface DashboardStats {
  totalAccounts: number;
  totalDepartments: number;
  totalPositions: number;
  adminCount: number;
  userCount: number;
}
