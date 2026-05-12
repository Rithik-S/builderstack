'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import ChatSidebar, { type SidebarChat } from '@/components/ChatSidebar';

// ── Sample data ───────────────────────────────────────────

const SAMPLE_CHATS: SidebarChat[] = [
  { id: 'web', title: 'Portfolio site for my consulting practice', goalShort: 'Website',   updatedLabel: 'Active now' },
  { id: 'crm', title: 'CRM for tracking client conversations',     goalShort: 'CRM',       updatedLabel: '2h ago'     },
  { id: 'ana', title: 'Analytics for the new landing page',        goalShort: 'Analytics', updatedLabel: 'Yesterday'  },
];

const NAV_LINKS = [
  { label: 'About', href: '/about' },
  { label: 'Tools', href: '/tools' },
];

// ── Page ──────────────────────────────────────────────────

export default function ChatPage() {
  const router  = useRouter();
  const { user } = useAuth();

  const [activeChatId, setActiveChatId] = useState<string | null>('web');
  const [value, setValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    ta.style.height = `${ta.scrollHeight}px`;
  }, [value]);

  function handleSubmit() {
    if (!value.trim()) return;
    router.push(`/suggest?chat=${activeChatId ?? 'ana'}`);
  }

  function handleKey(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }

  function handleNew() {
    setActiveChatId(null);
    setValue('');
  }

  const initials   = user?.name ? user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() : '';
  const firstName  = user?.name?.split(' ')[0] ?? '';
  const sidebarUser = user ? { name: user.name } : null;

  return (
    // CSS grid: sidebar fixed 260px | chat fills rest
    <div style={{
      display: 'grid',
      gridTemplateColumns: '260px 1fr',
      height: '100vh',
      overflow: 'hidden',
      fontFamily: 'var(--font-sans)',
    }}>

      {/* ── Sidebar ──────────────────────────────────────── */}
      <ChatSidebar
        chats={SAMPLE_CHATS}
        activeChatId={activeChatId}
        user={sidebarUser}
        onSelect={(id) => { setActiveChatId(id); router.push(`/suggest?chat=${id}`); }}
        onNew={handleNew}
      />

      {/* ── Main chat area ───────────────────────────────── */}
      <div style={{
        background: 'var(--bone)',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        overflow: 'hidden',
      }}>

        {/* Top nav bar */}
        <div style={{
          height: '54px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 20px',
          borderBottom: '1px solid var(--graphite)',
          flexShrink: 0,
          background: 'rgba(245,243,238,0.92)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
        }}>

          {/* Left — Suggest tools */}
          <a
            href="/suggest"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              fontSize: '13px', fontWeight: 600, color: 'white',
              padding: '7px 14px', background: 'var(--amber)',
              borderRadius: '8px', textDecoration: 'none',
              transition: 'background 150ms, transform 150ms',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLElement).style.background = 'var(--amber-deep)';
              (e.currentTarget as HTMLElement).style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = 'var(--amber)';
              (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
            }}
          >
            Suggest tools →
          </a>

          {/* Right — nav + auth */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>

            {NAV_LINKS.map(({ label, href }) => (
              <a
                key={href}
                href={href}
                style={{
                  fontSize: '13px', fontWeight: 500, color: 'var(--fg-2)',
                  padding: '6px 11px', borderRadius: '6px',
                  textDecoration: 'none', transition: 'background 150ms, color 150ms',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.background = 'var(--bone-2)';
                  (e.currentTarget as HTMLElement).style.color = 'var(--ink)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.background = 'transparent';
                  (e.currentTarget as HTMLElement).style.color = 'var(--fg-2)';
                }}
              >
                {label}
              </a>
            ))}

            <div style={{ width: '1px', height: '18px', background: 'var(--graphite)', margin: '0 6px' }} />

            {/* Logged out */}
            {!user && (
              <>
                <a
                  href="/login"
                  style={{
                    fontSize: '13px', fontWeight: 500, color: 'var(--fg-2)',
                    padding: '6px 12px', border: '1px solid var(--graphite)',
                    borderRadius: '7px', background: 'white', textDecoration: 'none',
                    transition: 'border-color 150ms',
                  }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.borderColor = 'var(--ink)')}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.borderColor = 'var(--graphite)')}
                >
                  Login
                </a>
                <a
                  href="/register"
                  style={{
                    fontSize: '13px', fontWeight: 600, color: 'white',
                    padding: '6px 12px', background: 'var(--ink)',
                    border: '1px solid var(--ink)', borderRadius: '7px',
                    textDecoration: 'none', marginLeft: '4px',
                    transition: 'background 150ms',
                  }}
                  onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.background = 'var(--ink-2)')}
                  onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.background = 'var(--ink)')}
                >
                  Sign up
                </a>
              </>
            )}

            {/* Logged in */}
            {user && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: '28px', height: '28px', borderRadius: '50%',
                  background: 'var(--amber)', color: 'white',
                  display: 'grid', placeItems: 'center',
                  fontSize: '11px', fontWeight: 600,
                }}>
                  {initials}
                </div>
                <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--fg-2)' }}>
                  {firstName}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Chat content */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

          {/* Hero */}
          <div style={{
            flex: 1, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            padding: '48px 32px 0', textAlign: 'center',
          }}>
            <h1 style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 'clamp(40px, 5vw, 56px)',
              fontWeight: 700, lineHeight: 1.08, letterSpacing: '-0.03em',
              color: 'var(--ink)', margin: '0 0 20px', maxWidth: '640px',
            }}>
              What are you{' '}
              <span style={{
                background: 'linear-gradient(180deg, var(--amber) 0%, var(--amber-deep) 100%)',
                WebkitBackgroundClip: 'text', backgroundClip: 'text', color: 'transparent',
              }}>
                building?
              </span>
            </h1>
            <p style={{
              fontSize: '16px', lineHeight: 1.6, color: 'var(--fg-3)',
              maxWidth: '480px', margin: 0,
            }}>
              Describe it in your own words. We'll ask a few questions,
              then return a short, ranked list of tools that actually fit.
            </p>
          </div>

          {/* Input */}
          <div style={{ padding: '24px 32px 28px', maxWidth: '760px', width: '100%', alignSelf: 'center' }}>
            <div
              style={{
                background: 'white', border: '1px solid var(--graphite)',
                borderRadius: '14px', boxShadow: '0 2px 12px rgba(10,22,40,0.06)',
                overflow: 'hidden', transition: 'border-color 150ms, box-shadow 150ms',
              }}
              onFocusCapture={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = 'var(--ink)';
                (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 16px rgba(10,22,40,0.10)';
              }}
              onBlurCapture={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = 'var(--graphite)';
                (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 12px rgba(10,22,40,0.06)';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', padding: '14px 14px 14px 18px' }}>
                <textarea
                  ref={textareaRef}
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  onKeyDown={handleKey}
                  placeholder="Describe what you're building…"
                  rows={1}
                  style={{
                    flex: 1, resize: 'none', border: 'none', outline: 'none',
                    background: 'transparent', fontFamily: 'var(--font-sans)',
                    fontSize: '15px', lineHeight: 1.55, color: 'var(--ink)',
                    maxHeight: '160px', overflowY: 'auto',
                  }}
                />
                <button
                  onClick={handleSubmit}
                  disabled={!value.trim()}
                  aria-label="Send"
                  style={{
                    width: '34px', height: '34px', borderRadius: '8px', border: 'none',
                    background: value.trim() ? 'var(--amber)' : 'var(--bone-2)',
                    color: value.trim() ? 'white' : 'var(--graphite-2)',
                    display: 'grid', placeItems: 'center',
                    cursor: value.trim() ? 'pointer' : 'default', flexShrink: 0,
                    transition: 'background 150ms, color 150ms',
                  }}
                >
                  <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
                    <path d="M7.5 2L13 7.5M13 7.5L7.5 13M13 7.5H2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>
            </div>

            <div style={{
              display: 'flex', alignItems: 'center',
              justifyContent: 'space-between', marginTop: '10px', padding: '0 4px',
            }}>
              <span style={{ fontSize: '12px', color: 'var(--fg-3)' }}>
                BuilderStack uses your brief to recommend tools.
              </span>
              <span style={{ fontSize: '11.5px', color: 'var(--graphite-2)', fontFamily: 'var(--font-mono)' }}>
                ↵ send · ⇧↵ new line
              </span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
