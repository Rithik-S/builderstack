'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { User } from '@/types';

export default function AdminUsersPage() {
    const { isAdmin, loading } = useAuth();
    const router = useRouter();
    const [users, setUsers] = useState<User[]>([]);
    const [loadingUsers, setLoadingUsers] = useState(true);
    const [error, setError] = useState('');

    // Redirect if not admin
    useEffect(() => {
        if (!loading && !isAdmin) {
            router.push('/');
        }
    }, [loading, isAdmin, router]);

    
    // Fetch users
    useEffect(() => {
        console.log('=== Users Page Debug ===');
        console.log('loading:', loading);
        console.log('isAdmin:', isAdmin);

        async function fetchUsers() {
            console.log('Fetching users...');
            try {
                const res = await fetch('/api/users', {
                    method: 'GET',
                    credentials: 'include',
                });
                console.log('Response status:', res.status);
                if (!res.ok) throw new Error('Failed to fetch users');
                const data = await res.json();
                console.log('Users data:', data);
                setUsers(data);
            } catch (err) {
                console.error('Fetch error:', err);
                setError('Failed to load users');
            } finally {
                setLoadingUsers(false);
            }
        }

        if (!loading && isAdmin) {
            fetchUsers();
        } else if (!loading && !isAdmin) {
            setLoadingUsers(false);
        }
    }, [loading, isAdmin]);

    if (loading || loadingUsers) {
        return <p>Loading...</p>;
    }

    if (!isAdmin) {
        return <p>Access denied</p>;
    }

    return (
        <div>
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold">
                    👥 <span className="gradient-text">Manage Users</span>
                </h1>
                <div className="flex gap-4">
                    <a href="/admin" className="btn-secondary">← Back</a>
                    <a href="/admin/users/new" className="btn-primary">+ Add User</a>
                </div>
            </div>

            {error && <p className="text-red-500 mb-4">{error}</p>}

            <div className="card-dark overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-800">
                        <tr>
                            <th className="text-left p-4">ID</th>
                            <th className="text-left p-4">Name</th>
                            <th className="text-left p-4">Email</th>
                            <th className="text-left p-4">Role</th>
                            <th className="text-left p-4">Created</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                            <tr key={user.id} className="border-t border-gray-700 hover:bg-gray-800/50">
                                <td className="p-4">{user.id}</td>
                                <td className="p-4">{user.name}</td>
                                <td className="p-4 text-gray-400">{user.email}</td>
                                <td className="p-4">
                                    <span className={`px-2 py-1 rounded text-sm ${user.role === 'admin'
                                        ? 'bg-purple-500/20 text-purple-400'
                                        : 'bg-gray-500/20 text-gray-400'
                                        }`}>
                                        {user.role}
                                    </span>
                                </td>
                                <td className="p-4 text-gray-400">
                                    {new Date(user.created_at).toLocaleDateString()}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <p className="text-gray-500 mt-4">Total: {users.length} users</p>
        </div>
    );
}