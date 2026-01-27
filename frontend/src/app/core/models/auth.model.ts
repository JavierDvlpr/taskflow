// Modelos de autenticación para TaskFlow Pro

export interface AuthResponse {
  token: string;
  email: string;
  role: string;
  firstName: string;
  lastName: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: 'ADMIN' | 'MANAGER' | 'EMPLOYEE';
  departmentId?: number;
  active: boolean;
}
