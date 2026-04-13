'use client';

import { useState, useEffect } from 'react';  // Added useEffect
import { useRouter } from 'next/navigation';
import { Tool } from '@/types';
import { getTools } from '@/lib/api';

export default function ToolsPage() {
    const router = useRouter();
    const [tools, setTools] = useState<Tool[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {  // Changed from useState to useEffect
        async function fetchTools() {
            try {
                const data = await getTools();
                setTools(data);
            } catch (err) {
                setError('Failed to load tools');
            } finally {
                setLoading(false);
            }
        }
        fetchTools();
    }, []);  // Empty array = run once on page load

    if (loading) return <p>Loading...</p>;
    if (error) return <p className="text-red-500">{error}</p>;

    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">Available Tools</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tools.map((tool) => (
                    <div key={tool.id} className="card-dark p-4">  
                        <h2 className="text-xl font-semibold">{tool.name}</h2>
                        <p className="text-gray-400">{tool.short_description}</p>
                        <button 
                            className="btn-primary mt-4"
                            onClick={() => router.push(`/tools/${tool.id}`)}
                        >
                            View Details
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}