'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AdminDashboard() {
  const { user, isAdmin, loading } = useAuth();
  const router = useRouter();

  // Redirect if not admin
  useEffect(() => {
    if (!loading && !isAdmin) {
      router.push('/');
    }
  }, [loading, isAdmin, router]);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (!isAdmin) {
    return <p>Access denied</p>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">
          <span className="gradient-text">Admin Dashboard</span>
        </h1>
        <button 
          onClick={() => router.push('/')}
          className="btn-secondary"
        >
          ← Exit Dev Mode
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card-dark">
          <h3 className="text-gray-400 text-sm">Total Users</h3>
          <p className="text-3xl font-bold">12</p>
        </div>
        <div className="card-dark">
          <h3 className="text-gray-400 text-sm">Total Tools</h3>
          <p className="text-3xl font-bold">20</p>
        </div>
        <div className="card-dark">
          <h3 className="text-gray-400 text-sm">Your Role</h3>
          <p className="text-3xl font-bold text-purple-400">{user?.role}</p>
        </div>
      </div>

      <div className="flex gap-4">
        <a href="/admin/users" className="btn-primary">
          Manage Users
        </a>
        <a href="/admin/tools" className="btn-secondary">
          Manage Tools
        </a>
      </div>
    </div>
  );
}