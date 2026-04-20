'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Tool } from '@/types';

export default function AdminToolsPage() {
  const { isAdmin, loading } = useAuth();
  const router = useRouter();
  const [tools, setTools] = useState<Tool[]>([]);
  const [loadingTools, setLoadingTools] = useState(true);
  const [error, setError] = useState('');

  // Redirect if not admin
  useEffect(() => {
    if (!loading && !isAdmin) {
      router.push('/');
    }
  }, [loading, isAdmin, router]);

  // Fetch tools
  useEffect(() => {
    async function fetchTools() {
      try {
        const res = await fetch('/api/tools');
        if (!res.ok) throw new Error('Failed to fetch tools');
        const data = await res.json();
        setTools(data);
      } catch (err) {
        setError('Failed to load tools');
      } finally {
        setLoadingTools(false);
      }
    }

    if (isAdmin) {
      fetchTools();
    }
  }, [isAdmin]);

  // Delete tool
  async function handleDelete(id: number) {
    if (!confirm('Are you sure you want to delete this tool?')) return;

    try {
      const res = await fetch(`/api/tools/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!res.ok) throw new Error('Failed to delete');

      setTools(tools.filter((tool) => tool.id !== id));
    } catch (err) {
      setError('Failed to delete tool');
    }
  }

  if (loading || loadingTools) {
    return <p>Loading...</p>;
  }

  if (!isAdmin) {
    return <p>Access denied</p>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">
          🛠️ <span className="gradient-text">Manage Tools</span>
        </h1>
        <div className="flex gap-4">
          <a href="/admin" className="btn-secondary">← Back</a>
          <a href="/admin/tools/new" className="btn-primary">+ Add Tool</a>
        </div>
      </div>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      <div className="card-dark overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-800">
            <tr>
              <th className="text-left p-4">ID</th>
              <th className="text-left p-4">Name</th>
              <th className="text-left p-4">Category</th>
              <th className="text-left p-4">Pricing</th>
              <th className="text-left p-4">Rating</th>
              <th className="text-left p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {tools.map((tool) => (
              <tr key={tool.id} className="border-t border-gray-700 hover:bg-gray-800/50">
                <td className="p-4">{tool.id}</td>
                <td className="p-4 font-medium">{tool.name}</td>
                <td className="p-4 text-gray-400">{tool.category}</td>
                <td className="p-4">
                  <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-sm">
                    {tool.pricing_model}
                  </span>
                </td>
                <td className="p-4 text-yellow-400">⭐ {tool.rating}</td>
                <td className="p-4">
                  <div className="flex gap-2">
                    <button
                      onClick={() => router.push(`/admin/tools/${tool.id}/edit`)}
                      className="px-3 py-1 bg-gray-700 rounded hover:bg-gray-600 text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(tool.id)}
                      className="px-3 py-1 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-gray-500 mt-4">Total: {tools.length} tools</p>
    </div>
  );
}