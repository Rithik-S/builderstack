'use client';

import { useState, useEffect, useCallback } from 'react';
import { Tool } from '@/types';
import { getTools } from '@/lib/api';

// ── Helpers ──────────────────────────────────────────────

function formatUsers(count: number, display: string): string {
  if (display) return display;
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M+`;
  if (count >= 1_000) return `${Math.round(count / 1_000)}k+`;
  return String(count);
}

function formatPrice(model: string, display: string): string {
  if (display) return display;
  const m = model.toLowerCase();
  if (m === 'free') return 'Free';
  if (m === 'freemium') return 'Free tier available';
  if (m === 'paid') return 'Paid';
  return model;
}

function groupByCategory(tools: Tool[]): Record<string, Tool[]> {
  const map: Record<string, Tool[]> = {};
  for (const tool of tools) {
    if (!map[tool.category]) map[tool.category] = [];
    map[tool.category].push(tool);
  }
  for (const cat of Object.keys(map)) {
    map[cat] = map[cat]
      .sort((a: Tool, b: Tool) => {
        const ra = a.rank_in_category ?? 0;
        const rb = b.rank_in_category ?? 0;
        if (ra > 0 && rb > 0) return ra - rb;
        if (ra > 0) return -1;
        if (rb > 0) return 1;
        return b.rating - a.rating;
      })
      .slice(0, 4);
  }
  return map;
}

// Category metadata (blurbs for known categories)
const CATEGORY_BLURBS: Record<string, string> = {
  CRM: 'Lightweight pipelines for small teams who want to track real conversations, not enterprise dashboards.',
  'Website Builders': "Get a polished site live in days, not months — without locking yourself into a framework you'll outgrow.",
  Analytics: 'Know what your visitors do without strapping a cookie banner to your front page.',
  Design: 'From wireframe to polished product — tools that make design feel fast.',
  Backend: 'Databases, auth, and APIs so you can ship without reinventing the wheel.',
  DevOps: 'Ship code with confidence. CI/CD, containers, and version control in one place.',
  Productivity: 'Cut the noise. Tools that let your team focus on the work that matters.',
  Communication: 'Async or real-time — tools that keep your team in sync without the meeting overhead.',
  Hosting: 'From preview to production in seconds. Hosting platforms built for modern stacks.',
  Monitoring: 'Catch errors before your users do.',
  'Project Mgmt': 'Track work without the overhead. Built for the pace of modern software teams.',
  Frontend: 'The building blocks of fast, beautiful UIs.',
  Email: 'Reliable delivery infrastructure for transactional and marketing email.',
  Auth: 'Ship auth in an afternoon. Secure, managed, and out of your way.',
  Payments: 'Accept money on the internet. Stripe-tier reliability, developer-first APIs.',
  'Low-Code': 'Build internal tools in hours, not weeks.',
  'API Tools': 'Design, test, and document APIs with confidence.',
  Editor: 'Your code home. Fast, extensible, and deeply integrated.',
};

// ── Medal ─────────────────────────────────────────────────

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

// ── Tool Card ─────────────────────────────────────────────

function ToolCard({ tool, onOpen }: { tool: Tool; onOpen: () => void }) {
  const rank = tool.rank_in_category ?? 0;
  const isSponsored = tool.is_sponsored && rank === 4;
  const variant = isSponsored ? 'sponsor' : rank === 1 ? 'gold' : rank === 2 ? 'silver' : rank === 3 ? 'bronze' : 'unranked';
  const logoBg = tool.logo_bg || '#0F172A';
  const logoLetter = tool.logo_letter || tool.name[0].toUpperCase();
  const hasTags = tool.tags?.length > 0;
  const hasWhyBlock = !!tool.for_you_text;

  return (
    <div
      className={`t-card t-card--${variant}`}
      onClick={onOpen}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onOpen()}
      aria-label={`View details for ${tool.name}`}
    >
      <div className="t-card__head">
        {rank > 0 ? (
          <Medal rank={rank} sponsored={isSponsored} />
        ) : (
          <span style={{ fontSize: '11px', color: 'var(--fg-3)', fontWeight: 500 }}>{tool.category}</span>
        )}
        <div className="t-card__rating" aria-label={`Rated ${tool.rating} out of 5`}>
          <span className="star" aria-hidden>★</span>
          {tool.rating}
        </div>
      </div>

      <div className="t-card__id">
        <div className="t-card__logo" style={{ background: logoBg }}>
          {logoLetter}
        </div>
        <div>
          <div className="t-card__name">{tool.name}</div>
          <div className="t-card__oneliner">{tool.short_description}</div>
        </div>
      </div>

      {hasWhyBlock && (
        <div className="t-card__why">
          <div className="t-card__why-head">
            <span className="t-card__why-chip">AI</span>
            Best for you
          </div>
          <p className="t-card__why-body">{tool.for_you_text}</p>
        </div>
      )}

      {hasTags && (
        <div className="t-card__tags">
          {tool.tags.map((tag, i) => (
            <span key={i} className="t-card__tag">{tag}</span>
          ))}
        </div>
      )}

      <div className="t-card__trust">
        <div className="t-card__trust-cell">
          <div className="t-card__trust-lab">Active users</div>
          <div className="t-card__trust-val">{formatUsers(tool.active_users_count, tool.users_display)}</div>
        </div>
        <div className="t-card__trust-cell">
          <div className="t-card__trust-lab">Updated</div>
          <div className="t-card__trust-val">{tool.last_updated_label || `${tool.launched_year}`}</div>
        </div>
        <div className="t-card__trust-cell">
          <div className="t-card__trust-lab">Price</div>
          <div className="t-card__trust-val">{formatPrice(tool.pricing_model, tool.price_display)}</div>
        </div>
      </div>

      <div className="t-card__actions">
        <button
          className="t-card__btn"
          onClick={(e) => { e.stopPropagation(); onOpen(); }}
        >
          View details
        </button>
        <a
          href={tool.website_link || '#'}
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

// ── Category Section ──────────────────────────────────────

function CategorySection({
  category,
  tools,
  onOpen,
}: {
  category: string;
  tools: Tool[];
  onOpen: (tool: Tool) => void;
}) {
  const blurb = CATEGORY_BLURBS[category] ?? `The best ${category.toLowerCase()} tools, curated for builders.`;
  const toolCount = tools.length;

  return (
    <section className="t-cat" id={`cat-${category.toLowerCase().replace(/\s+/g, '-')}`}>
      <div className="t-cat__head">
        <div className="t-cat__head-left">
          <div className="t-cat__num">The shortlist</div>
          <h2 className="t-cat__title">{category}</h2>
          <p className="t-cat__blurb">{blurb}</p>
        </div>
        <div className="t-cat__meta">
          <div>{toolCount} tool{toolCount !== 1 ? 's' : ''} tracked</div>
          <div>Updated weekly</div>
        </div>
      </div>
      <div className="t-grid">
        {tools.map((tool) => (
          <ToolCard key={tool.id} tool={tool} onOpen={() => onOpen(tool)} />
        ))}
      </div>
    </section>
  );
}

// ── Skeleton ─────────────────────────────────────────────

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

// ── Tool Drawer ───────────────────────────────────────────

function ToolDrawer({ tool, onClose }: { tool: Tool; onClose: () => void }) {
  const rank = tool.rank_in_category ?? 0;
  const isSponsored = tool.is_sponsored && rank === 4;
  const logoBg = tool.logo_bg || '#0F172A';
  const logoLetter = tool.logo_letter || tool.name[0].toUpperCase();
  const hasPros = tool.pros?.length > 0;
  const hasCons = tool.cons?.length > 0;

  const howto = [
    {
      t: `Get started with ${tool.name}`,
      b: `Sign up and complete the onboarding. ${tool.name} typically takes under 30 minutes to get to your first productive workflow.`,
    },
    {
      t: 'Import your existing data',
      b: 'Bring in contacts, projects, or data via CSV or native integrations. Clean data in, clean insights out.',
    },
    {
      t: 'Set up your core workflow',
      b: `Configure ${tool.name} around your team's actual process — not the default template. The defaults are a starting point, not a destination.`,
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
        <div className="t-drawer__head">
          <div className="t-drawer__title">
            {rank > 0 && <Medal rank={rank} sponsored={isSponsored} />}
            <span>{tool.name}</span>
          </div>
          <button className="t-drawer__close" onClick={onClose} aria-label="Close details panel">
            ✕
          </button>
        </div>

        <div className="t-drawer__body">
          {isSponsored && (
            <div className="t-drawer__sponsor-banner">
              This is a paid placement. {tool.name} pays for the #4 slot in {tool.category}; the editorial picks above were chosen independently.
            </div>
          )}

          <div className="t-drawer__hero">
            <div className="t-drawer__logo" style={{ background: logoBg }}>
              {logoLetter}
            </div>
            <div>
              <div className="t-drawer__name">{tool.name}</div>
              <div className="t-drawer__oneliner">{tool.short_description}</div>
            </div>
          </div>

          <div className="t-drawer__cta">
            <a
              href={tool.website_link || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="t-card__btn t-card__btn--primary"
              style={{ textDecoration: 'none' }}
            >
              Visit {tool.name} →
            </a>
            <button className="t-card__btn">Save to my stack</button>
          </div>

          {tool.for_you_text && (
            <div className="t-drawer__why">
              <div className="t-drawer__why-head">
                <span className="t-card__why-chip">AI</span>
                Best for your goal
              </div>
              <p className="t-drawer__why-body">{tool.for_you_text}</p>
            </div>
          )}

          <h3>Editor's review</h3>
          <div className="t-drawer__review">
            <p>
              {tool.name} earns its{' '}
              {rank === 1 ? 'top spot' : rank === 2 ? 'runner-up position' : rank === 3 ? 'third-place finish' : rank === 4 && isSponsored ? 'sponsored slot' : 'place'}{' '}
              in {tool.category} by doing one thing exceptionally well: {tool.short_description.replace(/\.$/, '').toLowerCase()}.
            </p>
            <p>
              For most teams in the {tool.category.toLowerCase()} space, it offers the right balance of power and setup time.
              You'll be productive on day one, and still discovering useful capabilities months later.
            </p>
          </div>

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

          {(hasPros || hasCons) && (
            <>
              <h3>Pros &amp; cons</h3>
              <div className="t-procon">
                {hasPros && (
                  <div className="t-procon__col t-procon__col--pros">
                    <div className="t-procon__head t-procon__head--pros">What we like</div>
                    <ul className="t-procon__list">
                      {tool.pros.map((p, i) => <li key={i}>{p}</li>)}
                    </ul>
                  </div>
                )}
                {hasCons && (
                  <div className="t-procon__col t-procon__col--cons">
                    <div className="t-procon__head t-procon__head--cons">Trade-offs</div>
                    <ul className="t-procon__list">
                      {tool.cons.map((c, i) => <li key={i}>{c}</li>)}
                    </ul>
                  </div>
                )}
              </div>
            </>
          )}

          <div className="t-drawer__chat-cta">
            <div>
              <div className="t-cta-title">Compare {tool.name} with another pick</div>
              <div className="t-cta-sub">Take this question to chat for a head-to-head.</div>
            </div>
            <a href="/" className="t-card__btn" style={{ textDecoration: 'none' }}>
              Open chat →
            </a>
          </div>
        </div>
      </aside>
    </>
  );
}

// ── Compare CTA ───────────────────────────────────────────

function CompareCTA() {
  return (
    <section className="t-compare">
      <div className="t-compare__inner">
        <h2 className="t-compare__title">Want to compare two of these in depth?</h2>
        <p className="t-compare__sub">
          Describe your goal and let the chat weigh any two tools head-to-head against your specific needs.
        </p>
        <a href="/" className="t-compare__btn">
          Start a conversation <span>→</span>
        </a>
      </div>
    </section>
  );
}

// ── Disclosure Footer ─────────────────────────────────────

function DisclosureFooter() {
  return (
    <footer className="t-foot">
      <div className="t-foot__inner">
        <div>
          <h3 className="t-foot__title">How we make money</h3>
          <p className="t-foot__lede">Transparency is the product. Here's the full picture.</p>
        </div>
        <div className="t-foot__list">
          <div className="t-foot__item">
            <span className="t-foot__item-head">
              <span className="pip" />
              Affiliate (primary)
            </span>
            <p className="t-foot__item-body">
              If you click "Visit site" and sign up, we may earn a commission. Same price for you.
              Editorial picks #1–3 are chosen on merit; affiliate status doesn't change the order.
            </p>
          </div>
          <div className="t-foot__item">
            <span className="t-foot__item-head">
              <span className="pip pip--gray" />
              Sponsored slot #4
            </span>
            <p className="t-foot__item-body">
              One paid slot per category, always position four, always labelled. Sponsors don't see,
              edit or influence the picks above them.
            </p>
          </div>
          <div className="t-foot__item">
            <span className="t-foot__item-head">
              <span className="pip pip--gray" />
              Editorial picks
            </span>
            <p className="t-foot__item-body">
              Slots #1, #2 and #3 are not for sale. We've turned down sponsorships for them and
              we'll keep doing it.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ── Page ──────────────────────────────────────────────────

export default function ToolsPage() {
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openTool, setOpenTool] = useState<Tool | null>(null);

  useEffect(() => {
    getTools()
      .then(setTools)
      .catch(() => setError('Couldn\'t reach the catalog. Retry, or check your connection.'))
      .finally(() => setLoading(false));
  }, []);

  const categories = groupByCategory(tools);

  // Priority order: curated categories first, then alphabetical
  const priorityOrder = ['CRM', 'Website Builders', 'Analytics'];
  const sortedCategories = Object.keys(categories).sort((a, b) => {
    const ai = priorityOrder.indexOf(a);
    const bi = priorityOrder.indexOf(b);
    if (ai >= 0 && bi >= 0) return ai - bi;
    if (ai >= 0) return -1;
    if (bi >= 0) return 1;
    return a.localeCompare(b);
  });

  return (
    <div className="tools-page" style={{ margin: '-32px' }}>
      {/* Hero */}
      <section className="t-hero">
        <div className="t-hero__eyebrow">Curated for builders</div>
        <h1 className="t-hero__title">
          The best tools, for <em>every build.</em>
        </h1>
        <p className="t-hero__sub">
          Ranked by real usage, not ad spend. Every #4 slot is clearly labelled — the other three are editorial, full stop.
        </p>
      </section>

      {/* Category sections */}
      {loading ? (
        <div style={{ maxWidth: '1180px', margin: '0 auto', padding: '80px 32px 0' }}>
          <div className="t-grid">
            {[1, 2, 3, 4].map((i) => <SkeletonCard key={i} />)}
          </div>
        </div>
      ) : error ? (
        <div style={{ maxWidth: '1180px', margin: '0 auto', padding: '80px 32px', textAlign: 'center' }}>
          <p style={{ fontSize: '18px', color: 'var(--fg-2)' }}>{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="t-card__btn"
            style={{ marginTop: '16px', flex: 'none' }}
          >
            Retry
          </button>
        </div>
      ) : sortedCategories.length === 0 ? (
        <div style={{ maxWidth: '1180px', margin: '0 auto', padding: '80px 32px', textAlign: 'center' }}>
          <p style={{ fontSize: '18px', color: 'var(--fg-2)' }}>
            No tools matched the brief. Try a broader category.
          </p>
          <a href="/" className="t-card__btn" style={{ marginTop: '16px', display: 'inline-flex', textDecoration: 'none' }}>
            Refine in chat →
          </a>
        </div>
      ) : (
        sortedCategories.map((cat) => (
          <CategorySection
            key={cat}
            category={cat}
            tools={categories[cat]}
            onOpen={setOpenTool}
          />
        ))
      )}

      <CompareCTA />
      <DisclosureFooter />

      {openTool && (
        <ToolDrawer tool={openTool} onClose={() => setOpenTool(null)} />
      )}
    </div>
  );
}
