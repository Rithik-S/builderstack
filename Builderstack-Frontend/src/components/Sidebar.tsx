export default function Sidebar() {
  return (
    <aside
      style={{
        width: '256px',
        flexShrink: 0,
        borderRight: '1px solid var(--graphite)',
        padding: '24px 16px',
        background: 'var(--bone)',
        fontFamily: 'var(--font-sans)',
      }}
    >
      {/* Sign in prompt */}
      <div
        style={{
          padding: '16px',
          background: 'white',
          border: '1px solid var(--graphite)',
          borderRadius: '12px',
          marginBottom: '16px',
        }}
      >
        <p style={{ fontSize: '13px', color: 'var(--fg-3)', marginBottom: '12px', lineHeight: 1.5 }}>
          Sign in to save your chats
        </p>
        <a href="/register" className="btn-primary" style={{ width: '100%', justifyContent: 'center', fontSize: '13px', padding: '8px 14px' }}>
          Sign up
        </a>
      </div>

      <div style={{ borderTop: '1px solid var(--graphite)', margin: '16px 0' }} />

      {/* Chat history */}
      <div>
        <p
          style={{
            fontSize: '11px',
            fontWeight: 600,
            color: 'var(--fg-3)',
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            fontFamily: 'var(--font-mono)',
            marginBottom: '8px',
          }}
        >
          Chat History
        </p>
        <p style={{ fontSize: '13px', color: 'var(--graphite-2)' }}>Sign in to see history</p>
      </div>
    </aside>
  );
}
