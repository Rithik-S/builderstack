'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';

// ── Local types ────────────────────────────────────────────

interface RecommendedTool {
  rank: 1 | 2 | 3 | 4;
  sponsored: boolean;
  name: string;
  slug: string;
  logo: string;
  logoBg: string;
  oneliner: string;
  forYou: string;
  users: string;
  updated: string;
  price: string;
  rating: number;
  tags: string[];
  pros: string[];
  cons: string[];
  websiteLink?: string;
}

interface ChatSignal {
  label: string;
  value: string;
}

interface ChatContext {
  id: string;
  title: string;
  summary: string;
  signals: ChatSignal[];
}

interface CategoryMeta {
  id: string;
  title: string;
  blurb: string;
}

interface PageData {
  chat: ChatContext;
  category: CategoryMeta;
  tools: RecommendedTool[];
}

// ── Dummy data ─────────────────────────────────────────────

const ANALYTICS: PageData = {
  chat: {
    id: 'ana',
    title: 'Analytics for the new landing page',
    summary: 'Privacy-first analytics for a B2B landing page at ~30k pageviews/month. Hosted is fine. Cookie banners are a hard no.',
    signals: [
      { label: 'Site type', value: 'B2B landing page' },
      { label: 'Traffic', value: '~30k pageviews/mo' },
      { label: 'Hosting', value: 'Hosted is fine' },
      { label: 'Hard no', value: 'Cookie banners' },
    ],
  },
  category: { id: 'analytics', title: 'Analytics', blurb: 'Know what your visitors do without strapping a cookie banner to your front page.' },
  tools: [
    {
      rank: 1, sponsored: false, name: 'Plausible', slug: 'plausible',
      logo: 'P', logoBg: '#1A6F2E',
      oneliner: 'Lightweight, privacy-first web analytics',
      forYou: 'Cookie-free by design and GDPR-compliant out of the box — perfect for a B2B landing page that refuses to show a cookie banner.',
      users: '12,000+', updated: 'Apr 2026', price: '$9/mo', rating: 4.8,
      tags: ['No cookies', 'GDPR ready', 'Open source'],
      pros: ['No cookie banner needed', 'Under 1 kb script', 'Open source + self-hostable', 'Simple, clean dashboard'],
      cons: ['No session recording', 'No funnel analysis', 'Limited event tracking'],
      websiteLink: 'https://plausible.io',
    },
    {
      rank: 2, sponsored: false, name: 'Fathom', slug: 'fathom',
      logo: 'F', logoBg: '#1F4FFF',
      oneliner: 'Simple analytics that respect user privacy',
      forYou: 'Fathom is GDPR, CCPA, and PECR compliant with no cookie consent required — and their EU-isolation option means your data never leaves Europe.',
      users: '8,000+', updated: 'Mar 2026', price: '$14/mo', rating: 4.7,
      tags: ['Privacy-first', 'Cookie-free', 'GDPR'],
      pros: ['No cookie consent required', 'EU isolation option', 'Great uptime SLA', 'Easy setup'],
      cons: ['More expensive than Plausible', 'No free tier', 'Limited filtering'],
      websiteLink: 'https://usefathom.com',
    },
    {
      rank: 3, sponsored: false, name: 'PostHog', slug: 'posthog',
      logo: 'P', logoBg: '#E34A00',
      oneliner: 'Product analytics, session replays, feature flags',
      forYou: 'If you eventually want session recordings and funnels beyond pageviews, PostHog gives you the full stack — still self-hostable to stay out of cookie-law territory.',
      users: '40,000+', updated: 'Apr 2026', price: 'Free → $0.000225/event', rating: 4.6,
      tags: ['Product analytics', 'Session replay', 'Feature flags', 'Open source'],
      pros: ['All-in-one product suite', 'Generous free tier', 'Self-hostable', 'Feature flags built in'],
      cons: ['Heavier script than Plausible', 'Cookie consent needed in some configs', 'Can overwhelm simple use cases'],
      websiteLink: 'https://posthog.com',
    },
    {
      rank: 4, sponsored: true, name: 'Mixpanel', slug: 'mixpanel',
      logo: 'M', logoBg: '#7856FF',
      oneliner: 'Advanced user behaviour analytics for growth teams',
      forYou: 'Mixpanel excels at deep funnel analysis and retention cohorts — best if you plan to grow the landing page into a full product over time.',
      users: '100,000+', updated: 'Apr 2026', price: 'Free → $28/mo', rating: 4.5,
      tags: ['Funnel analysis', 'Retention', 'A/B testing'],
      pros: ['Powerful funnel builder', 'Strong retention charts', 'Good free tier', 'Lots of integrations'],
      cons: ['Requires cookie consent', 'Complex for simple use cases', 'Can get expensive at scale'],
      websiteLink: 'https://mixpanel.com',
    },
  ],
};

const CRM: PageData = {
  chat: {
    id: 'crm',
    title: 'CRM for tracking client conversations',
    summary: 'Need a lightweight CRM for a 5-person consulting team. We track leads, proposals, and follow-ups. No Salesforce complexity — just pipelines that work.',
    signals: [
      { label: 'Team size', value: '5 people' },
      { label: 'Use case', value: 'Consulting pipeline' },
      { label: 'Must have', value: 'Email integration' },
      { label: 'Hard no', value: 'Enterprise complexity' },
    ],
  },
  category: { id: 'crm', title: 'CRM', blurb: 'Lightweight pipelines for small teams who want to track real conversations, not enterprise dashboards.' },
  tools: [
    {
      rank: 1, sponsored: false, name: 'Attio', slug: 'attio',
      logo: 'A', logoBg: '#0A1628',
      oneliner: 'Flexible, no-code CRM built for modern teams',
      forYou: 'Attio feels like it was built in 2024 — spreadsheet-style views, AI enrichment, and deep Gmail/Outlook sync with zero setup ceremony.',
      users: '15,000+', updated: 'Apr 2026', price: 'Free → $34/seat', rating: 4.9,
      tags: ['No-code customisable', 'AI-native', 'Strong API'],
      pros: ['Deeply customisable without code', 'Real-time Gmail/Outlook sync', 'Beautiful UI', 'Fast onboarding'],
      cons: ['Newer — some features still maturing', 'No mobile app yet', 'Pricier than alternatives'],
      websiteLink: 'https://attio.com',
    },
    {
      rank: 2, sponsored: false, name: 'Folk', slug: 'folk',
      logo: 'F', logoBg: '#6D28D9',
      oneliner: 'Relationship-first CRM for small teams',
      forYou: 'Folk puts relationships before pipelines — great for consulting where context and conversation history matter more than stage labels.',
      users: '7,000+', updated: 'Mar 2026', price: 'Free → $20/seat', rating: 4.7,
      tags: ['Relationship-focused', 'LinkedIn import', 'Templates'],
      pros: ['Excellent contact enrichment', 'One-click LinkedIn import', 'Collaborative notes', 'Generous free tier'],
      cons: ['Pipeline view less mature than Attio', 'Limited reporting', 'No native email sending'],
      websiteLink: 'https://folk.app',
    },
    {
      rank: 3, sponsored: false, name: 'Pipedrive', slug: 'pipedrive',
      logo: 'P', logoBg: '#1E8A4A',
      oneliner: 'Visual pipeline CRM loved by small sales teams',
      forYou: 'The OG visual pipeline CRM — still the best if your team thinks in deal stages and wants zero configuration to get started.',
      users: '100,000+', updated: 'Apr 2026', price: '$14/seat/mo', rating: 4.5,
      tags: ['Visual pipeline', 'Email tracking', 'Proven'],
      pros: ['Extremely intuitive pipeline view', 'Rock-solid email integration', 'Huge integration marketplace', 'Strong reporting'],
      cons: ['UI starting to feel dated', 'No free tier', 'Add-ons get expensive'],
      websiteLink: 'https://pipedrive.com',
    },
    {
      rank: 4, sponsored: true, name: 'HubSpot CRM', slug: 'hubspot',
      logo: 'H', logoBg: '#FF5C35',
      oneliner: 'Free CRM with a powerful marketing suite',
      forYou: 'HubSpot Free gives you a solid CRM baseline plus email marketing — unmatched value if you plan to run outbound campaigns from the same tool.',
      users: '200,000+', updated: 'Apr 2026', price: 'Free → $50/seat', rating: 4.4,
      tags: ['Free tier', 'All-in-one', 'Email marketing'],
      pros: ['Genuinely useful free tier', 'Email marketing built in', 'Great reporting', 'Wide ecosystem'],
      cons: ['Gets expensive fast', 'Can feel overwhelming', 'Aggressive upsell'],
      websiteLink: 'https://hubspot.com',
    },
  ],
};

const WEBSITES: PageData = {
  chat: {
    id: 'web',
    title: 'Portfolio site for my consulting practice',
    summary: 'Clean, professional portfolio for a solo consultant. Needs a blog, contact form, and to look great without months of dev time.',
    signals: [
      { label: 'Type', value: 'Portfolio + blog' },
      { label: 'Builder', value: 'Solo, non-technical' },
      { label: 'Timeline', value: 'Days, not months' },
      { label: 'Hard no', value: 'Coding required' },
    ],
  },
  category: { id: 'website-builders', title: 'Website Builders', blurb: "Get a polished site live in days, not months — without locking yourself into a framework you'll outgrow." },
  tools: [
    {
      rank: 1, sponsored: false, name: 'Framer', slug: 'framer',
      logo: 'F', logoBg: '#0A1628',
      oneliner: 'Design and publish sites without writing code',
      forYou: 'Framer is the best combination of design control and zero-code publishing — ideal for a consulting portfolio that needs to look premium without hiring a developer.',
      users: '30,000+', updated: 'Apr 2026', price: 'Free → $20/mo', rating: 4.9,
      tags: ['No-code', 'Design-first', 'CMS built in'],
      pros: ['Pixel-perfect design control', 'CMS for blog posts', 'Fast hosting included', 'Outstanding templates'],
      cons: ['Steeper curve than Squarespace', 'Custom domain on paid plan only', 'Limited e-commerce'],
      websiteLink: 'https://framer.com',
    },
    {
      rank: 2, sponsored: false, name: 'Webflow', slug: 'webflow',
      logo: 'W', logoBg: '#4353FF',
      oneliner: 'Professional website builder with CMS power',
      forYou: 'Webflow gives more design control than Squarespace with a proper CMS — great if you want a blog and the ability to customise every detail without touching code.',
      users: '200,000+', updated: 'Apr 2026', price: 'Free → $23/mo', rating: 4.7,
      tags: ['CMS', 'Full design control', 'No code'],
      pros: ['Best-in-class CMS', 'Full visual design control', 'Clean exported code', 'Strong community'],
      cons: ['Steeper learning curve', 'Pricier hosting', 'Overwhelming for simple sites'],
      websiteLink: 'https://webflow.com',
    },
    {
      rank: 3, sponsored: false, name: 'Squarespace', slug: 'squarespace',
      logo: 'S', logoBg: '#222222',
      oneliner: 'Beautiful templates, all-in-one platform',
      forYou: 'Squarespace is the fastest path to a professional portfolio — polished templates, built-in blogging, and contact forms that just work out of the box.',
      users: '500,000+', updated: 'Mar 2026', price: '$16/mo', rating: 4.4,
      tags: ['Templates', 'All-in-one', 'Blog ready'],
      pros: ['Outstanding templates', 'Blog and contact forms built in', 'Very easy to use', 'All-in-one pricing'],
      cons: ['Less design flexibility', 'Can feel generic', 'Harder to stand out'],
      websiteLink: 'https://squarespace.com',
    },
    {
      rank: 4, sponsored: true, name: 'Wix', slug: 'wix',
      logo: 'W', logoBg: '#FACC00',
      oneliner: 'Flexible drag-and-drop website builder',
      forYou: 'Wix offers the broadest template library and drag-and-drop freedom — worth a look if you want lots of choice and a generous free trial before committing.',
      users: '700,000+', updated: 'Apr 2026', price: 'Free → $17/mo', rating: 4.2,
      tags: ['Drag and drop', 'Templates', 'App market'],
      pros: ['Huge template library', 'Generous free tier', 'Lots of apps', 'Easy drag-and-drop'],
      cons: ["Can't change template after publish", 'Ads on free plan', 'SEO limitations'],
      websiteLink: 'https://wix.com',
    },
  ],
};

const DUMMY: Record<string, PageData> = { ana: ANALYTICS, crm: CRM, web: WEBSITES };

// ── Medal ──────────────────────────────────────────────────

function Medal({ rank, sponsored }: { rank: number; sponsored: boolean }) {
  if (sponsored) {
    return (
      <span className="medal medal--sponsor">
        <span className="medal__ring" aria-hidden>$</span>
        Sponsored · #4
      </span>
    );
  }
  if (rank === 1) return <span className="medal medal--gold"><span className="medal__ring" aria-hidden>1</span>Top pick</span>;
  if (rank === 2) return <span className="medal medal--silver"><span className="medal__ring" aria-hidden>2</span>Runner-up</span>;
  if (rank === 3) return <span className="medal medal--bronze"><span className="medal__ring" aria-hidden>3</span>Solid pick</span>;
  return null;
}

// ── Signal card ────────────────────────────────────────────

function SignalCard({ chat }: { chat: ChatContext }) {
  return (
    <div style={{
      maxWidth: '720px', width: '100%', margin: '40px auto 0',
      background: 'white', border: '1px solid var(--graphite)',
      borderRadius: '16px', padding: '24px',
      boxShadow: '2px 2px 0 0 var(--ink)',
      textAlign: 'left',
    }}>
      {/* Head row */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        paddingBottom: '14px', marginBottom: '16px',
        borderBottom: '1px solid var(--graphite)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span aria-hidden style={{
            width: '6px', height: '6px', borderRadius: '50%',
            background: 'var(--amber)', flexShrink: 0,
            boxShadow: '0 0 0 3px rgba(31,79,255,0.18)',
            display: 'inline-block',
          }} />
          <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--fg-3)' }}>
            From your chat · {chat.title}
          </span>
        </div>
        <a
          href="/"
          style={{
            fontSize: '12px', fontWeight: 500, color: 'var(--amber-deep)',
            padding: '4px 8px', borderRadius: '4px', textDecoration: 'none',
            transition: 'background 150ms',
          }}
          onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = 'var(--amber-tint)')}
          onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = 'transparent')}
        >
          Edit signals →
        </a>
      </div>

      {/* Summary */}
      <p style={{ fontSize: '15px', lineHeight: 1.55, color: 'var(--ink)', margin: '0 0 16px' }}>
        {chat.summary}
      </p>

      {/* Chips */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
        {chat.signals.map((sig) => (
          <span
            key={sig.label}
            style={{
              background: 'var(--bone)', border: '1px solid var(--graphite)',
              borderRadius: '100px', padding: '5px 11px', fontSize: '12.5px',
              display: 'inline-flex', gap: '5px',
            }}
          >
            <span style={{ color: 'var(--fg-3)', fontWeight: 500 }}>{sig.label}</span>
            <span style={{ fontWeight: 500, color: 'var(--fg-1)' }}>{sig.value}</span>
          </span>
        ))}
      </div>
    </div>
  );
}

// ── Tool Card ──────────────────────────────────────────────

function ToolCard({ tool, onOpen }: { tool: RecommendedTool; onOpen: () => void }) {
  const variant = tool.sponsored ? 'sponsor' : tool.rank === 1 ? 'gold' : tool.rank === 2 ? 'silver' : tool.rank === 3 ? 'bronze' : 'unranked';

  return (
    <div
      className={`t-card t-card--${variant}`}
      onClick={onOpen}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onOpen()}
      aria-label={`View details for ${tool.name}`}
    >
      {/* Head: medal + rating */}
      <div className="t-card__head">
        <Medal rank={tool.rank} sponsored={tool.sponsored} />
        <div className="t-card__rating" aria-label={`Rated ${tool.rating} out of 5`}>
          <span className="star" aria-hidden>★</span>
          {tool.rating}
        </div>
      </div>

      {/* Identity */}
      <div className="t-card__id">
        <div className="t-card__logo" style={{ background: tool.logoBg }}>{tool.logo}</div>
        <div>
          <div className="t-card__name">{tool.name}</div>
          <div className="t-card__oneliner">{tool.oneliner}</div>
        </div>
      </div>

      {/* AI block */}
      <div className="t-card__why">
        <div className="t-card__why-head">
          <span className="t-card__why-chip">AI</span>
          Best for you
        </div>
        <p className="t-card__why-body">{tool.forYou}</p>
      </div>

      {/* Tags */}
      <div className="t-card__tags">
        {tool.tags.map((tag, i) => (
          <span key={i} className="t-card__tag">{tag}</span>
        ))}
      </div>

      {/* Trust strip */}
      <div className="t-card__trust">
        <div className="t-card__trust-cell">
          <div className="t-card__trust-lab">Active users</div>
          <div className="t-card__trust-val">{tool.users}</div>
        </div>
        <div className="t-card__trust-cell">
          <div className="t-card__trust-lab">Updated</div>
          <div className="t-card__trust-val">{tool.updated}</div>
        </div>
        <div className="t-card__trust-cell">
          <div className="t-card__trust-lab">Price</div>
          <div className="t-card__trust-val">{tool.price}</div>
        </div>
      </div>

      {/* Actions */}
      <div className="t-card__actions">
        <button className="t-card__btn" onClick={(e) => { e.stopPropagation(); onOpen(); }}>
          View details
        </button>
        <a
          href={tool.websiteLink || '#'}
          target="_blank"
          rel="noopener noreferrer"
          className="t-card__btn t-card__btn--primary"
          onClick={(e) => e.stopPropagation()}
          style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
          Visit site →
        </a>
      </div>
    </div>
  );
}

// ── Tool Drawer ────────────────────────────────────────────

function ToolDrawer({ tool, onClose, categoryTitle }: { tool: RecommendedTool; onClose: () => void; categoryTitle: string }) {
  const howto = [
    {
      t: `Get started with ${tool.name}`,
      b: `Sign up and complete the onboarding. ${tool.name} typically takes under 30 minutes to reach your first productive workflow.`,
    },
    {
      t: 'Import your existing data',
      b: 'Bring in contacts, projects, or data via CSV or native integrations. Clean data in, clean insights out.',
    },
    {
      t: 'Set up your core workflow',
      b: `Configure ${tool.name} around your team's actual process — not the default template. The defaults are a starting point.`,
    },
    {
      t: 'Connect your other tools',
      b: 'Wire up the integrations your team already relies on. Most modern tools have Zapier or native connectors to make this painless.',
    },
  ];

  const handleKey = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') onClose();
  }, [onClose]);

  useEffect(() => {
    window.addEventListener('keydown', handleKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', handleKey);
      document.body.style.overflow = '';
    };
  }, [handleKey]);

  return (
    <>
      <div className="t-drawer-shade" onClick={onClose} />
      <aside className="t-drawer" role="dialog" aria-modal aria-label={`${tool.name} details`}>
        {/* Sticky head */}
        <div className="t-drawer__head">
          <div className="t-drawer__title">
            <Medal rank={tool.rank} sponsored={tool.sponsored} />
            <span>{tool.name}</span>
          </div>
          <button className="t-drawer__close" onClick={onClose} aria-label="Close details panel">✕</button>
        </div>

        <div className="t-drawer__body">
          {/* Sponsor banner */}
          {tool.sponsored && (
            <div className="t-drawer__sponsor-banner">
              This is a paid placement. {tool.name} pays for the #4 slot in {categoryTitle}; the editorial picks above were chosen independently.
            </div>
          )}

          {/* Hero row */}
          <div className="t-drawer__hero">
            <div className="t-drawer__logo" style={{ background: tool.logoBg }}>{tool.logo}</div>
            <div>
              <div className="t-drawer__name">{tool.name}</div>
              <div className="t-drawer__oneliner">{tool.oneliner}</div>
            </div>
          </div>

          {/* CTA row */}
          <div className="t-drawer__cta">
            <a
              href={tool.websiteLink || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="t-card__btn t-card__btn--primary"
              style={{ textDecoration: 'none' }}
            >
              Visit {tool.name} →
            </a>
            <button className="t-card__btn">Save to my stack</button>
          </div>

          {/* AI callout */}
          <div className="t-drawer__why">
            <div className="t-drawer__why-head">
              <span className="t-card__why-chip">AI</span>
              Best for your goal
            </div>
            <p className="t-drawer__why-body">{tool.forYou}</p>
          </div>

          {/* Editor's review */}
          <h3>Editor&rsquo;s review</h3>
          <div className="t-drawer__review">
            <p>
              {tool.name} earns its{' '}
              {tool.rank === 1 ? 'top spot' : tool.rank === 2 ? 'runner-up position' : tool.rank === 3 ? 'third-place finish' : 'sponsored slot'}{' '}
              in {categoryTitle} by doing one thing exceptionally well: {tool.oneliner.replace(/\.$/, '').toLowerCase()}.
            </p>
            <p>
              For most teams exploring {categoryTitle.toLowerCase()} options, it offers the right balance of power and setup time.
              You&rsquo;ll be productive on day one, and still discovering useful capabilities months later.
            </p>
          </div>

          {/* How to use */}
          <h3>How to use it</h3>
          <div className="t-howto">
            {howto.map((step, i) => (
              <div key={i} className="t-howto__step">
                <div className="t-howto__num">{i + 1}</div>
                <div>
                  <div className="t-howto__title">{step.t}</div>
                  <p className="t-howto__body">{step.b}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Pros & cons */}
          <h3>Pros &amp; cons</h3>
          <div className="t-procon">
            <div className="t-procon__col t-procon__col--pros">
              <div className="t-procon__head t-procon__head--pros">What we like</div>
              <ul className="t-procon__list">
                {tool.pros.map((p, i) => <li key={i}>{p}</li>)}
              </ul>
            </div>
            <div className="t-procon__col t-procon__col--cons">
              <div className="t-procon__head t-procon__head--cons">Trade-offs</div>
              <ul className="t-procon__list">
                {tool.cons.map((c, i) => <li key={i}>{c}</li>)}
              </ul>
            </div>
          </div>

          {/* Compare CTA */}
          <div className="t-drawer__chat-cta">
            <div>
              <div className="t-cta-title">Compare {tool.name} with another pick</div>
              <div className="t-cta-sub">Take this question to chat for a head-to-head.</div>
            </div>
            <a href="/" className="t-card__btn" style={{ textDecoration: 'none' }}>Open chat →</a>
          </div>
        </div>
      </aside>
    </>
  );
}

// ── Skeleton ───────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="t-skeleton">
      <div className="t-skeleton__line" style={{ height: '20px', width: '40%' }} />
      <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
        <div className="t-skeleton__line" style={{ width: '44px', height: '44px', borderRadius: '10px', flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <div className="t-skeleton__line" style={{ height: '18px', width: '60%', marginBottom: '8px' }} />
          <div className="t-skeleton__line" style={{ height: '14px', width: '80%' }} />
        </div>
      </div>
      <div className="t-skeleton__line" style={{ height: '72px', borderRadius: '10px' }} />
      <div style={{ display: 'flex', gap: '6px' }}>
        {[40, 50, 35].map((w, i) => (
          <div key={i} className="t-skeleton__line" style={{ height: '24px', width: `${w}%`, borderRadius: '100px' }} />
        ))}
      </div>
    </div>
  );
}

// ── Compare CTA ────────────────────────────────────────────

function CompareCTA({ chatId }: { chatId: string }) {
  return (
    <section className="t-compare">
      <div className="t-compare__inner">
        <h2 className="t-compare__title">Want to compare two of these in depth?</h2>
        <p className="t-compare__sub">
          Describe your goal and let the chat weigh any two tools head-to-head against your specific needs.
        </p>
        <a href={`/?chat=${chatId}`} className="t-compare__btn">
          Start a conversation <span>→</span>
        </a>
      </div>
    </section>
  );
}

// ── Disclosure Footer ──────────────────────────────────────

function DisclosureFooter() {
  return (
    <footer className="t-foot">
      <div className="t-foot__inner">
        <div>
          <h3 className="t-foot__title">How we make money</h3>
          <p className="t-foot__lede">Transparency is the product. Here&rsquo;s the full picture.</p>
        </div>
        <div className="t-foot__list">
          <div className="t-foot__item">
            <span className="t-foot__item-head"><span className="pip" />Affiliate (primary)</span>
            <p className="t-foot__item-body">
              If you click &ldquo;Visit site&rdquo; and sign up, we may earn a commission. Same price for you.
              Editorial picks #1–3 are chosen on merit; affiliate status doesn&rsquo;t change the order.
            </p>
          </div>
          <div className="t-foot__item">
            <span className="t-foot__item-head"><span className="pip pip--gray" />Sponsored slot #4</span>
            <p className="t-foot__item-body">
              One paid slot per category, always position four, always labelled. Sponsors don&rsquo;t see,
              edit or influence the picks above them.
            </p>
          </div>
          <div className="t-foot__item">
            <span className="t-foot__item-head"><span className="pip pip--gray" />Editorial picks</span>
            <p className="t-foot__item-body">
              Slots #1, #2 and #3 are not for sale. We&rsquo;ve turned down sponsorships for them and
              we&rsquo;ll keep doing it.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ── Inner page (needs useSearchParams) ────────────────────

function SuggestInner() {
  const params = useSearchParams();
  const chatId = params.get('chat') ?? 'ana';
  const data = DUMMY[chatId] ?? ANALYTICS;

  const [openTool, setOpenTool] = useState<RecommendedTool | null>(null);
  const [loading, setLoading] = useState(true);

  // Simulate brief load so skeletons flash
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 600);
    return () => clearTimeout(t);
  }, [chatId]);

  const { chat, category, tools } = data;

  return (
    <div className="tools-page">

      {/* ── Sticky nav ──────────────────────────────────── */}
      <nav className="t-nav">
        <div className="t-nav__inner">
          {/* Brand */}
          <a href="/" className="t-nav__brand">
            <span className="mark" aria-hidden>B</span>
            BuilderStack
          </a>

          {/* Category pill */}
          <div className="t-nav__crumb">
            <span className="t-nav__crumb-tag">{category.title.toUpperCase()}</span>
          </div>

          {/* Back */}
          <a href="/" className="t-nav__back">← Back to chat</a>
        </div>
      </nav>

      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="t-hero">
        <div className="t-hero__eyebrow">{category.title} · personalised for you</div>
        <h1 className="t-hero__title">
          Four {category.title.toLowerCase()} picks,<br />ranked <em>for you.</em>
        </h1>
        <SignalCard chat={chat} />
      </section>

      {/* ── The shortlist ─────────────────────────────────── */}
      <section className="t-cat" style={{ paddingBottom: '80px' }}>
        <div className="t-cat__head">
          <div className="t-cat__head-left">
            <div className="t-cat__num">The shortlist</div>
            <h2 className="t-cat__title">{category.title}</h2>
            <p className="t-cat__blurb">{category.blurb}</p>
          </div>
          <div className="t-cat__meta">
            <div>4 tools tracked</div>
            <div>Updated weekly</div>
          </div>
        </div>

        {loading ? (
          <div className="t-grid">
            {[1, 2, 3, 4].map((i) => <SkeletonCard key={i} />)}
          </div>
        ) : (
          <div className="t-grid">
            {tools.map((tool) => (
              <ToolCard key={tool.slug} tool={tool} onOpen={() => setOpenTool(tool)} />
            ))}
          </div>
        )}
      </section>

      <CompareCTA chatId={chatId} />
      <DisclosureFooter />

      {openTool && (
        <ToolDrawer
          tool={openTool}
          categoryTitle={category.title}
          onClose={() => setOpenTool(null)}
        />
      )}
    </div>
  );
}

// ── Page export ────────────────────────────────────────────

export default function SuggestPage() {
  return (
    <Suspense fallback={
      <div className="tools-page">
        <div style={{ maxWidth: '1180px', margin: '0 auto', padding: '80px 32px' }}>
          <div className="t-grid">{[1, 2, 3, 4].map((i) => <SkeletonCard key={i} />)}</div>
        </div>
      </div>
    }>
      <SuggestInner />
    </Suspense>
  );
}
