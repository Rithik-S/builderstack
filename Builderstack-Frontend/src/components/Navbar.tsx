'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function Navbar() {
    const { user, isAdmin, logout } = useAuth();
    const router = useRouter();
    const [showDevModal, setShowDevModal] = useState(false);

    function handleLogout() {
        logout();
        router.push('/');
    }

    return (
        <>
            <nav className="flex items-center justify-between h-16 px-8 bg-[#0a0a0a] text-white navbar-gradient">
                <div className="flex items-center">
                    <h1 className="text-xl font-bold">
                        <span className="gradient-text">Builder</span>Stack
                    </h1>

                    {/* Secret dot - only visible to admins */}
                    {isAdmin && (
                        <button
                            onClick={() => setShowDevModal(true)}
                            className="ml-1 text-gray-600 hover:text-purple-500 transition-colors"
                            title="Dev Mode"
                        >
                            .
                        </button>
                    )}
                </div>

                <div className="flex gap-6 items-center">
                    <a href="/about" className="text-gray-400 hover:text-white transition-colors">About</a>
                    <a href="/tools" className="text-gray-400 hover:text-white transition-colors">Tools</a>

                    {user ? (
                        <>
                            <span className="text-gray-400">Hi, {user.name}</span>
                            <button onClick={handleLogout} className="btn-secondary">Logout</button>
                        </>
                    ) : (
                        <>
                            <a href="/login" className="btn-secondary">Login</a>
                            <a href="/register" className="btn-primary">Sign Up</a>
                        </>
                    )}
                </div>
            </nav>

            {/* Dev Mode Modal */}
            {showDevModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div
                        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                        onClick={() => setShowDevModal(false)}
                    />
                    <div className="relative z-10 p-8 bg-gray-900 border border-gray-700 rounded-2xl">
                        <h2 className="text-xl font-bold mb-4">🔧 Developer Mode</h2>
                        <p className="text-gray-400 mb-6">Switch to admin dashboard?</p>
                        <div className="flex gap-4">
                            <button
                                onClick={() => setShowDevModal(false)}
                                className="btn-secondary"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    setShowDevModal(false);
                                    router.push('/admin');
                                }}
                                className="btn-primary"
                            >
                                Enter Dev Mode
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}