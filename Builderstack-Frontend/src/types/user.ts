export interface User {
  id: number;
  name: string;
  email: string;
  role: 'user' | 'admin';
  location?: string;
  age_group?: string;
  profession?: string;
  gender?: string;
  created_at: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}