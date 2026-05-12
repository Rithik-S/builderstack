'use client';

// ── Types ─────────────────────────────────────────────────

export interface SidebarChat {
  id: string;
  title: string;
  goalShort: string;    // e.g. "CRM", "Website"
  updatedLabel: string; // e.g. "2h ago", "Active now"
}

interface ChatSidebarProps {
  chats: SidebarChat[];
  activeChatId: string | null;
  user: { name: string; plan?: string } | null;
  onSelect: (chatId: string) => void;
  onNew: () => void;
}

// ── Helpers ───────────────────────────────────────────────

const S = {
  // Colours exactly as specified
  canvas:    '#F4F4EE',   // sidebar bg — 1 step deeper than chat canvas
  border:    '#D6D2C7',
  ink:       '#0A1628',
  ink2:      '#142442',
  fg3:       '#5C6376',
  bone3:     '#E2DED3',
  graphite2: '#9A9588',
  cobalt:    '#1F4FFF',
  font:      '"Geist", system-ui, -apple-system, sans-serif',
  ease:      'cubic-bezier(0.2, 0.8, 0.2, 1)',
} as const;

// ── Component ─────────────────────────────────────────────

export default function ChatSidebar({ chats, activeChatId, user, onSelect, onNew }: ChatSidebarProps) {
  const initial = user?.name?.[0]?.toUpperCase() ?? 'B';
  const plan = user?.plan ?? 'Builder · pro';

  return (
    <aside
      style={{
        width: '260px',
        height: '100vh',
        overflow: 'hidden',
        background: S.canvas,
        borderRight: `1px solid ${S.border}`,
        display: 'flex',
        flexDirection: 'column',
        padding: '16px 12px 12px',
        gap: '14px',
        fontFamily: S.font,
        color: S.ink,
        boxSizing: 'border-box',
      }}
    >

      {/* ── 1. Brand block ──────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '6px 10px 0' }}>

        {/* Logo mark */}
        <div style={{
          width: '26px', height: '26px', flexShrink: 0,
          background: S.ink, borderRadius: '2px',
          display: 'grid', placeItems: 'center',
          color: 'white', fontSize: '14px', fontWeight: 700,
        }}>
          B
        </div>

        {/* Wordmark */}
        <span style={{
          fontSize: '15px', fontWeight: 600,
          letterSpacing: '-0.01em', color: S.ink,
          lineHeight: 1,
        }}>
          BuilderStack
        </span>

        {/* BETA tag */}
        <span
          aria-hidden
          style={{
            fontSize: '10px', fontWeight: 500,
            textTransform: 'uppercase', letterSpacing: '0.06em',
            color: S.fg3, background: S.bone3,
            padding: '2px 5px', borderRadius: '3px',
            marginLeft: '2px', lineHeight: 1,
          }}
        >
          Beta
        </span>
      </div>

      {/* ── 2. New-chat button ───────────────────────────── */}
      <NewChatButton onClick={onNew} />

      {/* ── 3. Chat list (scrollable) ────────────────────── */}
      <div style={{
        flex: 1, overflowY: 'auto',
        paddingTop: '4px', display: 'flex',
        flexDirection: 'column', gap: '1px',
        // scrollbar styling
        scrollbarWidth: 'thin',
        scrollbarColor: `${S.border} transparent`,
      }}>
        {chats.map((chat) => (
          <ChatItem
            key={chat.id}
            chat={chat}
            active={chat.id === activeChatId}
            onSelect={onSelect}
          />
        ))}
      </div>

      {/* ── 4. User block (pinned) ───────────────────────── */}
      <UserBlock initial={initial} name={user?.name ?? 'Guest'} plan={plan} />

    </aside>
  );
}

// ── Sub-components ────────────────────────────────────────

function NewChatButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: '100%', display: 'flex', alignItems: 'center', gap: '10px',
        padding: '10px 14px', background: S.ink, color: 'white',
        border: `1px solid ${S.ink}`, borderRadius: '2px',
        fontSize: '13px', fontWeight: 500, letterSpacing: '-0.005em',
        cursor: 'pointer', fontFamily: S.font, textAlign: 'left',
        transition: `background 200ms ${S.ease}`,
      }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = S.ink2; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = S.ink; }}
    >
      {/* "+" glyph box */}
      <span style={{
        width: '16px', height: '16px', flexShrink: 0,
        borderRadius: '3px', background: 'rgba(255,255,255,0.14)',
        display: 'grid', placeItems: 'center',
        fontSize: '13px', color: 'white', lineHeight: 1,
      }} aria-hidden>
        +
      </span>
      New chat
    </button>
  );
}

function ChatItem({
  chat, active, onSelect,
}: {
  chat: SidebarChat;
  active: boolean;
  onSelect: (id: string) => void;
}) {
  return (
    <button
      onClick={() => onSelect(chat.id)}
      aria-current={active ? 'page' : undefined}
      style={{
        width: '100%', display: 'flex', alignItems: 'flex-start', gap: '10px',
        padding: '10px 12px', borderRadius: '2px',
        background: active ? 'white' : 'transparent',
        boxShadow: active ? '0 1px 2px rgba(11,18,32,0.04)' : 'none',
        border: 'none', cursor: 'pointer', fontFamily: S.font,
        textAlign: 'left',
        transition: `background 150ms ${S.ease}`,
      }}
      onMouseEnter={(e) => {
        if (!active) (e.currentTarget as HTMLElement).style.background = 'rgba(11,18,32,0.04)';
      }}
      onMouseLeave={(e) => {
        if (!active) (e.currentTarget as HTMLElement).style.background = 'transparent';
      }}
    >
      {/* Status dot */}
      <span
        aria-hidden
        style={{
          flexShrink: 0,
          marginTop: '5px',
          width: '6px', height: '6px',
          borderRadius: '50%',
          background: active ? S.cobalt : '#9A9588',
          boxShadow: active ? '0 0 0 3px rgba(37,99,235,0.2)' : 'none',
          transition: `background 150ms, box-shadow 150ms`,
        }}
      />

      {/* Text */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: '13.5px', fontWeight: 500, color: S.ink,
          lineHeight: 1.35, overflow: 'hidden',
          textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {chat.title}
        </div>
        <div style={{ fontSize: '11px', color: S.fg3, marginTop: '2px' }}>
          {chat.goalShort} · {chat.updatedLabel}
        </div>
      </div>
    </button>
  );
}

function UserBlock({ initial, name, plan }: { initial: string; name: string; plan: string }) {
  return (
    <button
      style={{
        width: '100%', display: 'flex', alignItems: 'center', gap: '10px',
        padding: '8px 10px', borderRadius: '2px',
        background: 'transparent', border: '1px solid transparent',
        cursor: 'pointer', fontFamily: S.font, textAlign: 'left',
        transition: `background 200ms ${S.ease}, border-color 200ms ${S.ease}`,
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget as HTMLElement;
        el.style.background = 'white';
        el.style.borderColor = S.border;
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget as HTMLElement;
        el.style.background = 'transparent';
        el.style.borderColor = 'transparent';
      }}
      aria-label="Account menu"
    >
      {/* Avatar */}
      <div style={{
        width: '28px', height: '28px', flexShrink: 0,
        borderRadius: '50%', background: S.ink,
        display: 'grid', placeItems: 'center',
        color: 'white', fontSize: '13px', fontWeight: 600,
      }}>
        {initial}
      </div>

      {/* Name + plan */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: '13px', fontWeight: 500, color: S.ink,
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {name}
        </div>
        <div style={{ fontSize: '11px', color: S.fg3, marginTop: '1px' }}>
          {plan}
        </div>
      </div>
    </button>
  );
}
