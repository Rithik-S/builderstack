// BuilderStack — Tools page components
const { useState: useS, useEffect: useE } = React;

// ─── Top nav ────────────────────────────────────────────
function ToolsNav({ category }) {
  return (
    <header className="t-nav">
      <div className="t-nav__inner">
        <a href="Chat.html" className="t-nav__brand" style={{textDecoration: 'none'}}>
          <div className="mark">B</div>
          BuilderStack
        </a>
        <div className="t-nav__crumb">
          <span className="t-nav__crumb-tag">{category.title}</span>
        </div>
        <a href="Chat.html" className="t-nav__back">← Back to chat</a>
      </div>
    </header>
  );
}

// ─── Hero + signal summary ─────────────────────────────
function ToolsHero({ chat }) {
  return (
    <section className="t-hero">
      <div className="t-hero__eyebrow">{chat.categoryTitle} · personalised for you</div>
      <h1 className="t-hero__title">
        Four {chat.categoryTitle.toLowerCase()} picks, ranked <em>for you.</em>
      </h1>

      <div className="t-signals">
        <div className="t-signals__head">
          <div className="t-signals__from">
            <span className="src-dot" />
            From your chat · {chat.title}
          </div>
          <a className="t-signals__edit" href="Chat.html">Edit signals →</a>
        </div>
        <p className="t-signals__summary">{chat.summary}</p>
        <div className="t-signals__chips">
          {chat.signals.map((s, i) => (
            <span key={i} className="t-signal">
              <span className="t-signal__lab">{s.label}</span>
              <span className="t-signal__val">{s.value}</span>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Medal badge ────────────────────────────────────────
function Medal({ rank, sponsored }) {
  if (sponsored) return <span className="medal medal--sponsor"><span className="medal__ring">$</span>Sponsored · #4</span>;
  if (rank === 1) return <span className="medal medal--gold"><span className="medal__ring">1</span>Top pick</span>;
  if (rank === 2) return <span className="medal medal--silver"><span className="medal__ring">2</span>Runner-up</span>;
  if (rank === 3) return <span className="medal medal--bronze"><span className="medal__ring">3</span>Solid pick</span>;
  return null;
}

// ─── Tool card ──────────────────────────────────────────
function ToolCard({ tool, onOpen }) {
  const variant = tool.sponsored ? 'sponsor' : (tool.rank === 1 ? 'gold' : tool.rank === 2 ? 'silver' : 'bronze');
  return (
    <div className={`t-card t-card--${variant}`} onClick={onOpen}>
      <div className="t-card__head">
        <Medal rank={tool.rank} sponsored={tool.sponsored} />
        <div className="t-card__rating">
          <span className="star">★</span> {tool.rating}
        </div>
      </div>

      <div className="t-card__id">
        <div className="t-card__logo" style={{background: tool.logoBg}}>{tool.logo}</div>
        <div>
          <div className="t-card__name">{tool.name}</div>
          <div className="t-card__oneliner">{tool.oneliner}</div>
        </div>
      </div>

      <div className="t-card__why">
        <div className="t-card__why-head">
          <span className="t-card__why-chip">AI</span>
          Best for you
        </div>
        <p className="t-card__why-body">{tool.forYou}</p>
      </div>

      <div className="t-card__tags">
        {tool.tags.map((t, i) => <span key={i} className="t-card__tag">{t}</span>)}
      </div>

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

      <div className="t-card__actions">
        <button className="t-card__btn" onClick={(e) => { e.stopPropagation(); onOpen(); }}>View details</button>
        <button className="t-card__btn t-card__btn--primary" onClick={(e) => e.stopPropagation()}>Visit site →</button>
      </div>
    </div>
  );
}

// ─── Category section ───────────────────────────────────
function CategorySection({ category, onOpen }) {
  return (
    <section className="t-cat" id={`cat-${category.id}`}>
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
      <div className="t-grid">
        {category.tools.map(t => (
          <ToolCard key={t.name} tool={t} onOpen={() => onOpen(t, category)} />
        ))}
      </div>
    </section>
  );
}

// ─── Compare-in-chat CTA ────────────────────────────────
function CompareCTA() {
  return (
    <section className="t-compare">
      <div className="t-compare__inner">
        <h2 className="t-compare__title">Want to compare two of these in depth?</h2>
        <p className="t-compare__sub">
          The chat knows your goal. Ask it to weigh any two tools head-to-head against your specific needs.
        </p>
        <a href="Chat.html" className="t-compare__btn" style={{textDecoration: 'none'}}>
          Continue the chat <span>→</span>
        </a>
      </div>
    </section>
  );
}

// ─── Disclosure footer ──────────────────────────────────
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
            <span className="t-foot__item-head"><span className="pip" />Affiliate (primary)</span>
            <p className="t-foot__item-body">If you click "Visit site" and sign up, we may earn a commission. Same price for you. Editorial picks #1–3 are chosen on merit; affiliate status doesn't change the order.</p>
          </div>
          <div className="t-foot__item">
            <span className="t-foot__item-head"><span className="pip pip--gray" />Sponsored slot #4</span>
            <p className="t-foot__item-body">One paid slot per category, always position four, always labelled. Sponsors don't see, edit or influence the picks above them.</p>
          </div>
          <div className="t-foot__item">
            <span className="t-foot__item-head"><span className="pip pip--gray" />Editorial picks</span>
            <p className="t-foot__item-body">Slots #1, #2 and #3 are not for sale. We've turned down sponsorships for them and we'll keep doing it.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ─── Drawer (tool detail) ───────────────────────────────
function ToolDrawer({ tool, category, chat, onClose }) {
  useE(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  // Build a how-to-use plan tailored to the chat goal.
  const howto = [
    { t: 'Sign up + import your contacts', b: `Import the team's existing contacts via CSV or LinkedIn. ${tool.name} will deduplicate by email automatically.` },
    { t: `Set up your pipeline for ${category.title.toLowerCase()}`, b: `Based on your inbound flow, create three stages: New lead → Qualified → Proposal sent. Skip the enterprise stuff for now.` },
    { t: 'Connect your inbox', b: `Two-way email sync means every conversation lands in the right contact's timeline — no manual logging required.` },
    { t: 'Wire up referrals tracking', b: `You said referrals are a major source. Add a "Source" custom field with values: Inbound form, Referral, LinkedIn, Other. You'll know what works in 30 days.` },
  ];

  return (
    <>
      <div className="t-drawer-shade" onClick={onClose} />
      <aside className="t-drawer" role="dialog" aria-label={tool.name}>
        <div className="t-drawer__head">
          <div className="t-drawer__title">
            <Medal rank={tool.rank} sponsored={tool.sponsored} />
            <span>{tool.name}</span>
          </div>
          <button className="t-drawer__close" onClick={onClose} aria-label="Close">✕</button>
        </div>

        <div className="t-drawer__body">
          {tool.sponsored && (
            <div className="t-drawer__sponsor-banner">
              This is a paid placement. {tool.name} pays for the #4 slot in {category.title}; the editorial picks above were chosen independently.
            </div>
          )}

          <div className="t-drawer__hero">
            <div className="t-drawer__logo" style={{background: tool.logoBg}}>{tool.logo}</div>
            <div>
              <div className="t-drawer__name">{tool.name}</div>
              <div className="t-drawer__oneliner">{tool.oneliner}</div>
            </div>
          </div>

          <div className="t-drawer__cta">
            <button className="t-card__btn t-card__btn--primary">Visit {tool.name} →</button>
            <button className="t-card__btn">Save to my stack</button>
          </div>

          <div className="t-drawer__why">
            <div className="t-drawer__why-head">
              <span className="t-card__why-chip">AI</span>
              Best for your goal
            </div>
            <p className="t-drawer__why-body">{tool.forYou}</p>
          </div>

          <h3>Editor's review</h3>
          <div className="t-drawer__review">
            <p>{tool.name} earns its {tool.rank === 1 ? 'top spot' : tool.rank === 2 ? 'runner-up position' : tool.rank === 3 ? 'third-place finish' : 'sponsored slot'} in {category.title} by being unusually good at one thing: {tool.oneliner.replace(/\.$/, '')} — without bolting on enterprise sprawl that small teams don't need.</p>
            <p>For your specific goal — {chat.summary.split('.')[0].toLowerCase()} — it offers the right ratio of power to setup time. You'll be productive on day one and still finding useful capabilities six months in.</p>
          </div>

          <h3>How to use it for your goal</h3>
          <div className="t-howto">
            {howto.map((s, i) => (
              <div key={i} className="t-howto__step">
                <div className="t-howto__num">{i + 1}</div>
                <div>
                  <div className="t-howto__title">{s.t}</div>
                  <p className="t-howto__body">{s.b}</p>
                </div>
              </div>
            ))}
          </div>

          <h3>Pros & cons</h3>
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

          <div className="t-drawer__chat-cta">
            <div>
              <div className="t">Compare {tool.name} with another pick</div>
              <div className="s">Take this question back to chat for a head-to-head.</div>
            </div>
            <a href="Chat.html" className="t-card__btn t-card__btn--primary" style={{textDecoration: 'none'}}>Open chat →</a>
          </div>
        </div>
      </aside>
    </>
  );
}

Object.assign(window, {
  ToolsNav, ToolsHero, CategorySection, CompareCTA, DisclosureFooter, ToolDrawer
});
