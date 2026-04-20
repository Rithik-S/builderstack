'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter, useParams } from 'next/navigation';
import { Tool } from '@/types';

export default function EditToolPage() {
  const { isAdmin, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const toolId = params.id;

  const [tool, setTool] = useState<Tool | null>(null);
  const [loadingTool, setLoadingTool] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Form fields
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [category, setCategory] = useState('');
  const [pricingModel, setPricingModel] = useState('');
  const [budgetLevel, setBudgetLevel] = useState('');
  const [rating, setRating] = useState('');
  const [websiteLink, setWebsiteLink] = useState('');

  // Redirect if not admin
  useEffect(() => {
    if (!loading && !isAdmin) {
      router.push('/');
    }
  }, [loading, isAdmin, router]);

  // Fetch tool data
  useEffect(() => {
    async function fetchTool() {
      try {
        const res = await fetch(`/api/tools/${toolId}`);
        if (!res.ok) throw new Error('Failed to fetch tool');
        const data = await res.json();
        setTool(data);
        
        // Populate form
        setName(data.name || '');
        setSlug(data.slug || '');
        setShortDescription(data.short_description || '');
        setCategory(data.category || '');
        setPricingModel(data.pricing_model || '');
        setBudgetLevel(data.budget_level || '');
        setRating(data.rating?.toString() || '');
        setWebsiteLink(data.website_link || '');
      } catch (err) {
        setError('Failed to load tool');
      } finally {
        setLoadingTool(false);
      }
    }

    if (isAdmin && toolId) {
      fetchTool();
    }
  }, [isAdmin, toolId]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      const res = await fetch(`/api/tools/${toolId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          name,
          slug,
          short_description: shortDescription,
          category,
          pricing_model: pricingModel,
          budget_level: budgetLevel,
          rating: parseFloat(rating),
          website_link: websiteLink,
        }),
      });

      if (!res.ok) throw new Error('Failed to update tool');

      router.push('/admin/tools');
    } catch (err) {
      setError('Failed to update tool');
    } finally {
      setSaving(false);
    }
  }

  if (loading || loadingTool) {
    return <p>Loading...</p>;
  }

  if (!isAdmin) {
    return <p>Access denied</p>;
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">
          ✏️ <span className="gradient-text">Edit Tool</span>
        </h1>
        <a href="/admin/tools" className="btn-secondary">← Back</a>
      </div>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      <form onSubmit={handleSubmit} className="card-dark">
        <div className="grid gap-4">
          <div>
            <label className="block text-gray-400 mb-2">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-dark"
              required
            />
          </div>

          <div>
            <label className="block text-gray-400 mb-2">Slug</label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="input-dark"
              required
            />
          </div>

          <div>
            <label className="block text-gray-400 mb-2">Short Description</label>
            <textarea
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              className="input-dark"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-400 mb-2">Category</label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="input-dark"
              />
            </div>

            <div>
              <label className="block text-gray-400 mb-2">Pricing Model</label>
              <select
                value={pricingModel}
                onChange={(e) => setPricingModel(e.target.value)}
                className="input-dark"
              >
                <option value="free">Free</option>
                <option value="freemium">Freemium</option>
                <option value="paid">Paid</option>
                <option value="subscription">Subscription</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-400 mb-2">Budget Level</label>
              <select
                value={budgetLevel}
                onChange={(e) => setBudgetLevel(e.target.value)}
                className="input-dark"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div>
              <label className="block text-gray-400 mb-2">Rating</label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="5"
                value={rating}
                onChange={(e) => setRating(e.target.value)}
                className="input-dark"
              />
            </div>
          </div>

          <div>
            <label className="block text-gray-400 mb-2">Website Link</label>
            <input
              type="url"
              value={websiteLink}
              onChange={(e) => setWebsiteLink(e.target.value)}
              className="input-dark"
            />
          </div>

          <div className="flex gap-4 mt-4">
            <button
              type="submit"
              disabled={saving}
              className="btn-primary"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <a href="/admin/tools" className="btn-secondary">
              Cancel
            </a>
          </div>
        </div>
      </form>
    </div>
  );
}