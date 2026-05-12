'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AddToolPage() {
  const { isAdmin, loading } = useAuth();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Form fields
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [category, setCategory] = useState('');
  const [pricingModel, setPricingModel] = useState('freemium');
  const [budgetLevel, setBudgetLevel] = useState('low');
  const [rating, setRating] = useState('4.5');
  const [websiteLink, setWebsiteLink] = useState('');

  // Redirect if not admin
  useEffect(() => {
    if (!loading && !isAdmin) {
      router.push('/');
    }
  }, [loading, isAdmin, router]);

  // Auto-generate slug from name
  function handleNameChange(value: string) {
    setName(value);
    setSlug(value.toLowerCase().replace(/\s+/g, '-'));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      const res = await fetch('/api/tools', {
        method: 'POST',
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

      if (!res.ok) throw new Error('Failed to create tool');

      router.push('/admin/tools');
    } catch (err) {
      setError('Failed to create tool');
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
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">
          ➕ <span className="gradient-text">Add New Tool</span>
        </h1>
        <a href="/admin/tools" className="btn-secondary">← Back</a>
      </div>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      <form onSubmit={handleSubmit} className="card-dark">
        <div className="grid gap-4">
          <div>
            <label className="block text-gray-400 mb-2">Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
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
              placeholder="https://example.com"
            />
          </div>

          <div className="flex gap-4 mt-4">
            <button
              type="submit"
              disabled={saving}
              className="btn-primary"
            >
              {saving ? 'Creating...' : 'Create Tool'}
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