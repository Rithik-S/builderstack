import { User, LoginRequest, RegisterRequest, Tool } from '@/types';

// Login
export async function login({ email, password }: LoginRequest): Promise<User> {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ email, password }),
  });
  
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || 'Login failed');
  }
  
  return res.json();
}

// Register
export async function register({ name, email, password }: RegisterRequest): Promise<User> {
  const res = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ name, email, password }),
  });
  
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || 'Registration failed');
  }
  
  return res.json();
}

// Logout
export async function logout(): Promise<void> {
  const res = await fetch('/api/auth/logout', {
    method: 'POST',
    credentials: 'include',
  });
  
  if (!res.ok) {
    throw new Error('Logout failed');
  }
}

// Get current user
export async function getCurrentUser(): Promise<User> {
  const res = await fetch('/api/users/me', {
    method: 'GET',
    credentials: 'include',
  });
  
  if (!res.ok) {
    throw new Error('Not authenticated');
  }
  
  return res.json();
}

// Get all tools
export async function getTools(): Promise<Tool[]> {
  const res = await fetch('/api/tools', {
    method: 'GET',
  });
  
  if (!res.ok) {
    throw new Error('Failed to fetch tools');
  }
  
  return res.json();
}
