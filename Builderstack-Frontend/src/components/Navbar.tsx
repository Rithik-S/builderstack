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
      <nav
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 30,
          height: '64px',
          background: 'rgba(245, 243, 238, 0.90)',
          backdropFilter: 'saturate(180%) blur(20px)',
          WebkitBackdropFilter: 'saturate(180%) blur(20px)',
          borderBottom: '1px solid var(--graphite)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 32px',
          fontFamily: 'var(--font-sans)',
        }}
      >
        {/* Brand */}
        <a
          href="/"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontWeight: 600,
            fontSize: '15px',
            letterSpacing: '-0.01em',
            color: 'var(--ink)',
            textDecoration: 'none',
          }}
        >
          <div
            style={{
              width: '24px',
              height: '24px',
              background: 'var(--ink)',
              color: 'white',
              display: 'grid',
              placeItems: 'center',
              fontSize: '13px',
              fontWeight: 700,
              borderRadius: '5px',
              flexShrink: 0,
            }}
          >
            B
          </div>
          BuilderStack
          {isAdmin && (
            <button
              onClick={(e) => { e.preventDefault(); setShowDevModal(true); }}
              style={{
                marginLeft: '2px',
                background: 'none',
                border: 'none',
                color: 'var(--graphite-2)',
                cursor: 'pointer',
                fontSize: '18px',
                lineHeight: 1,
                padding: 0,
              }}
              title="Dev Mode"
            >
              ·
            </button>
          )}
        </a>

        {/* Nav links + auth */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          {[
            { label: 'About', href: '/about' },
            { label: 'Tools', href: '/tools' },
          ].map(({ label, href }) => (
            <a
              key={href}
              href={href}
              style={{
                fontSize: '13px',
                fontWeight: 500,
                color: 'var(--fg-2)',
                padding: '8px 12px',
                borderRadius: '6px',
                textDecoration: 'none',
                transition: 'background 200ms, color 200ms',
              }}
              onMouseEnter={(e) => {
                (e.target as HTMLElement).style.background = 'var(--bone-2)';
                (e.target as HTMLElement).style.color = 'var(--ink)';
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLElement).style.background = 'transparent';
                (e.target as HTMLElement).style.color = 'var(--fg-2)';
              }}
            >
              {label}
            </a>
          ))}

          <div style={{ width: '1px', height: '20px', background: 'var(--graphite)', margin: '0 8px' }} />

          {user ? (
            <>
              <span style={{ fontSize: '13px', color: 'var(--fg-3)', marginRight: '4px' }}>
                {user.name}
              </span>
              <button onClick={handleLogout} className="btn-secondary" style={{ fontSize: '13px', padding: '7px 14px' }}>
                Logout
              </button>
            </>
          ) : (
            <>
              <a href="/login" className="btn-secondary" style={{ fontSize: '13px', padding: '7px 14px' }}>
                Login
              </a>
              <a href="/register" className="btn-primary" style={{ fontSize: '13px', padding: '7px 14px', marginLeft: '4px' }}>
                Sign up
              </a>
            </>
          )}
        </div>
      </nav>

      {/* Dev Mode Modal */}
      {showDevModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 50,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(10, 22, 40, 0.5)',
              backdropFilter: 'blur(4px)',
            }}
            onClick={() => setShowDevModal(false)}
          />
          <div
            style={{
              position: 'relative',
              zIndex: 10,
              padding: '32px',
              background: 'white',
              border: '1px solid var(--graphite)',
              borderRadius: '16px',
              boxShadow: 'var(--stamp-1)',
              minWidth: '320px',
              fontFamily: 'var(--font-sans)',
            }}
          >
            <h2 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--ink)', marginBottom: '8px' }}>
              Developer Mode
            </h2>
            <p style={{ fontSize: '14px', color: 'var(--fg-3)', marginBottom: '24px' }}>
              Switch to the admin dashboard?
            </p>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => setShowDevModal(false)} className="btn-secondary">
                Cancel
              </button>
              <button
                onClick={() => { setShowDevModal(false); router.push('/admin'); }}
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
