'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function AddUserPage() {
  const { isAdmin, loading } = useAuth();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Form fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');

  // Redirect if not admin
  useEffect(() => {
    if (!loading && !isAdmin) {
      router.push('/');
    }
  }, [loading, isAdmin, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    try {
      // Use the register endpoint
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || 'Failed to create user');
      }

      const data = await res.json();

      // If role is admin, update the user role
      if (role === 'admin') {
        // Note: You may need a backend endpoint for this
        // For now, show success and mention manual update needed
        setSuccess(`User created! To make them admin, run: UPDATE users SET role = 'admin' WHERE email = '${email}';`);
      } else {
        setSuccess('User created successfully!');
        setTimeout(() => router.push('/admin/users'), 1500);
      }

      // Clear form
      setName('');
      setEmail('');
      setPassword('');
      setRole('user');

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create user');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return <p>Loading...</p>;
  }

  if (!isAdmin) {
    return <p>Access denied</p>;
  }

  return (
    <div className="max-w-xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">
          ➕ <span className="gradient-text">Add New User</span>
        </h1>
        <a href="/admin/users" className="btn-secondary">← Back</a>
      </div>

      {error && <p className="text-red-500 mb-4 p-3 bg-red-500/10 rounded">{error}</p>}
      {success && <p className="text-green-500 mb-4 p-3 bg-green-500/10 rounded">{success}</p>}

      <form onSubmit={handleSubmit} className="card-dark">
        <div className="grid gap-4">
          <div>
            <label className="block text-gray-400 mb-2">Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-dark"
              placeholder="John Doe"
              required
            />
          </div>

          <div>
            <label className="block text-gray-400 mb-2">Email *</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-dark"
              placeholder="john@example.com"
              required
            />
          </div>

          <div>
            <label className="block text-gray-400 mb-2">Password *</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-dark"
              placeholder="••••••••"
              required
              minLength={6}
            />
          </div>

          <div>
            <label className="block text-gray-400 mb-2">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="input-dark"
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
            {role === 'admin' && (
              <p className="text-yellow-500 text-sm mt-2">
                ⚠️ Admin role requires manual database update after creation
              </p>
            )}
          </div>

          <div className="flex gap-4 mt-4">
            <button
              type="submit"
              disabled={saving}
              className="btn-primary"
            >
              {saving ? 'Creating...' : 'Create User'}
            </button>
            <a href="/admin/users" className="btn-secondary">
              Cancel
            </a>
          </div>
        </div>
      </form>
    </div>
  );
}