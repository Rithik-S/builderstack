# Handoff: BuilderStack Tools Page

## Overview

This handoff covers the **Tools page** for BuilderStack — the screen a user lands on after their conversation with the AI assistant. It shows a curated, ranked shortlist of software tools (4 picks per category: a gold #1, silver #2, bronze #3, and a clearly-labelled sponsored #4) tailored to the signals extracted from the chat.

The page contains:

1. A sticky top nav with brand mark, current category breadcrumb, and a back-to-chat link.
2. A centered hero with eyebrow, large display headline (with a single accented word), and a "signal summary" card showing what the chat understood — editable.
3. A category section with a two-column grid of four tool cards.
4. A tool card detail drawer that slides in from the right when a card is clicked.
5. A dark "continue the chat" comparison CTA.
6. A transparency footer that explicitly explains how BuilderStack makes money (affiliate + one labelled sponsored slot).

---

## About the Design Files

**The files in `design_files/` are design references created in HTML/JSX — prototypes showing the intended look and behavior, not production code to copy directly.**

They are inline-React (Babel-transpiled in the browser) backed by a single global `TOOLS_DATA` object. This was the right format for fast design iteration; it is **not** the right format for the production app.

Your task is to **recreate this design in the target codebase's existing environment** (the BuilderStack frontend is a Next.js 14 + Tailwind scaffold per the upstream repo) using its established patterns — Server/Client Components, real data fetched from `/api/tools` and `/api/tools/recommend`, accessibility primitives from a real component library, and the Tailwind config (extended to express the design tokens listed below). If those patterns don't yet exist, lay them down before building the page.

Treat the JSX as a **specification of structure and behavior**. Treat the CSS as a **specification of visual values** (you'll port the values into Tailwind theme extensions or CSS variables, not import the file as-is).

---

## Fidelity

**High-fidelity (hifi).** Final colors, typography, spacing, hover/press behavior, and animations are all specified. Recreate the UI pixel-perfectly. The one place there's deliberate looseness: the `forYou` rationale text and the drawer's "How to use it" plan are sample copy — production should render whatever the recommendation API returns. Use the seed copy as a length/voice reference.

---

## Screens / Views

There is one page in this handoff (`Tools.html` → renders `<ToolsApp />`), but it has six logical sections plus a modal drawer.

### 1. Top nav (`<ToolsNav />`)

- **Position:** sticky to top of viewport, full-bleed.
- **Background:** `rgba(245, 243, 238, 0.86)` over a 20px backdrop blur with 180% saturation — paper canvas, lightly translucent.
- **Border:** 1px solid `--graphite` (#D6D2C7) bottom only.
- **Inner container:** `max-width: 1180px`, padded `14px 32px`, three-column grid `1fr auto 1fr` with `gap: 16px`.
- **Left — brand:**
  - `<a>` linking to `Chat.html`. No underline.
  - 24×24px square mark, background `--ink` (#0A1628), white "B" character, `font-weight: 700`, `font-size: 13px`, `border-radius: 5px`.
  - Wordmark "BuilderStack" beside it: Geist 600, 15px, `letter-spacing: -0.01em`, color `--ink`.
  - Mark and wordmark separated by 10px gap.
- **Center — breadcrumb tag:**
  - Pill chip on `--ink` background, white text, font-size 11px, weight 600, `letter-spacing: 0.02em`, `text-transform: uppercase`, padding `4px 9px`, `border-radius: 100px`.
  - Content: the current category title (e.g. "CRM", "Website builders", "Analytics").
- **Right — back link:**
  - "← Back to chat", Geist 500, 13px, color `--fg-2` (#2E3A52).
  - Padding `8px 12px`, `border-radius: 6px`, transparent background at rest.
  - Hover: background `--bone-2` (#ECE9E1), color shifts to `--ink`. Transition `200ms cubic-bezier(0.2, 0.8, 0.2, 1)`.

### 2. Hero (`<ToolsHero />`)

- **Container:** `max-width: 1180px`, padded `96px 32px 64px`, `text-align: center`.
- **Eyebrow:** mono-feeling overline. `font-size: 12px`, weight 600, `letter-spacing: 0.04em`, `text-transform: uppercase`, color `--amber-deep` (#1538C8 — the cobalt theme override). Margin-bottom 20px. Content: `"{Category} · personalised for you"`.
- **Title:** Geist 600 (NOT the display serif here — this section uses sans for impact). `font-size: 72px`, `line-height: 1.05`, `letter-spacing: -0.035em`, color `--ink`, `max-width: 880px`, centered, `text-wrap: balance`.
  - One word/phrase wrapped in `<em>` (e.g. "for you.") gets the cobalt gradient: `linear-gradient(180deg, var(--amber) 0%, var(--amber-deep) 100%)` clipped to text. `font-style: normal`.
- **Mobile (≤880px):** title drops to 48px, container padding to `64px 24px 48px`.

#### Signal summary card (inside hero)

- **Container:** `max-width: 720px`, centered, white background, 1px `--graphite` border, `border-radius: 16px`, `padding: 24px`, `box-shadow: 2px 2px 0 0 var(--ink)` (`--stamp-1`), `text-align: left`.
- **Head row:** flex space-between, padding-bottom 14px, margin-bottom 16px, 1px `--graphite` bottom border.
  - Left: 6×6px cobalt dot (with a 3px translucent halo) followed by "From your chat · {chat title}". 12px, weight 500, color `--fg-3` (#5C6376).
  - Right: "Edit signals →" link. 12px, weight 500, color `--amber-deep`, padding `4px 8px`, `border-radius: 4px`. Hover: background `--amber-tint` (#E0E8FF).
- **Summary paragraph:** 15px, line-height 1.55, color `--ink`. Margin 0 0 16px.
- **Chips row:** flex wrap, `gap: 6px`. Each chip:
  - Background `--bone`, 1px `--graphite` border, `border-radius: 100px`, padding `5px 11px`, font-size 12.5px, color `--fg-1`.
  - Two spans: label (`--fg-3`, weight 500) then value (weight 500, `--ink`).

### 3. Category section (`<CategorySection />`)

- **Container:** `max-width: 1180px`, padded `80px 32px 0` (and `80px` bottom on the last category).
- **Head:** flex `justify-content: space-between`, `align-items: flex-end`, `gap: 32px`. Margin-bottom 36px, padding-bottom 20px, 1px `--graphite` bottom border.
  - **Left block:** `max-width: 640px`.
    - Eyebrow: "THE SHORTLIST" — `--font-mono` (JetBrains Mono), 12px, `letter-spacing: 0.06em`, color `--fg-3`, uppercase, margin-bottom 8px.
    - Title (h2): Geist 600, 44px, `line-height: 1.05`, `letter-spacing: -0.025em`, color `--ink`. Margin 0 0 10px. (Mobile ≤880px: 32px.)
    - Blurb: 16px, line-height 1.55, color `--fg-2`.
  - **Right meta:** `--font-mono`, 12px, color `--fg-3`, right-aligned, no-wrap. Two lines: "4 tools tracked" / "Updated weekly". 4px gap between lines.
- **Mobile (≤880px):** head stacks (`flex-direction: column`, `align-items: flex-start`).

### 4. Tool grid + cards (`<ToolCard />`)

- **Grid:** 2 columns equal, `gap: 18px`. Single column below 880px.
- **Card container:**
  - Background white, 1px `--graphite` border, `border-radius: 18px`, padding 24px, flex column, `gap: 16px`, `cursor: pointer`, `position: relative`, `overflow: hidden`.
  - Hover: border becomes `--ink`, translates `Y(-2px)`, gains soft shadow `0 12px 32px rgba(11,18,32,0.08)`. Transition 200ms with the system ease.
- **Top stripe:** a 3px-tall absolutely-positioned bar at top of card, full width:
  - Gold variant: `linear-gradient(90deg, #E5B547 0%, #C19024 100%)`
  - Silver variant: `linear-gradient(90deg, #C8CCD2 0%, #9499A2 100%)`
  - Bronze variant: `linear-gradient(90deg, #C68A5C 0%, #92602F 100%)`
  - Sponsor variant: solid `--graphite`
- **Card head row:** flex space-between with the medal badge on the left and the rating on the right.

#### Medal badge (`<Medal />`)

- Pill (`border-radius: 100px`), padding `4px 10px 4px 6px`, font-size 11px, weight 600, `letter-spacing: 0.02em`, uppercase, with an 18×18px circular "ring" on the left containing white mono text.
- Variants:
  - **Gold (#1, "TOP PICK"):** background gradient `#FBE9B6 → #F2D17A`, text `#6E4A0B`, 1px border `#E0B860`. Ring: gradient `#E5B547 → #B8860B`.
  - **Silver (#2, "RUNNER-UP"):** background `#EEF1F4 → #D9DDE3`, text `#424650`, border `#B8BDC4`. Ring: `#C0C5CD → #8A8F98`.
  - **Bronze (#3, "SOLID PICK"):** background `#F1DEC9 → #E0C09E`, text `#6B3D1F`, border `#C68A5C`. Ring: `#B97E50 → #8C552B`.
  - **Sponsored (#4, "$ SPONSORED · #4"):** background `--bone`, text `--fg-3`, border `--graphite`. Ring: `--graphite-2` (#9A9588).

#### Rating cell (right of card head)

- Inline-flex, `gap: 4px`, font-size 12px, weight 500, color `--fg-2`. Star glyph color `#E5B547`. Format: `★ 4.8`.

#### Identity row

- Flex, `align-items: center`, `gap: 14px`.
- **Logo:** 44×44px, `border-radius: 10px`, background per tool (`tool.logoBg`), white initial in Geist 600, font-size 19px, `letter-spacing: -0.01em`. Place-items center.
- **Right column:**
  - Name: Geist 600, 22px, `line-height: 1.15`, `letter-spacing: -0.015em`, color `--ink`.
  - One-liner: 13.5px, color `--fg-3`, margin-top 2px.

#### "Best for you" AI block

- Background `--amber-tint` (#E0E8FF), 1px border `rgba(31, 79, 255, 0.2)`, `border-radius: 10px`, padding `12px 14px`, `position: relative`.
- Head row (margin-bottom 6px): an "AI" chip + the label "BEST FOR YOU".
  - **AI chip:** background `--amber`, white text, font-size 9.5px, weight 700, padding `2px 6px`, `border-radius: 4px`, `letter-spacing: 0.04em`.
  - **Label:** font-size 11px, weight 600, color `--amber-deep`, `letter-spacing: 0.03em`, uppercase.
- Body: 13.5px, line-height 1.5, color `--ink`.

#### Tag chips row

- Flex wrap, `gap: 4px`. Each tag: font-size 11.5px, color `--fg-2`, background `--bone`, 1px `--graphite` border, padding `3px 8px`, `border-radius: 100px`, weight 500.

#### Trust strip (bottom of card)

- 3-column grid, `gap: 8px`, padding-top 14px, 1px `--graphite` top border.
- Each cell: a 11.5px label (color `--fg-3`, weight 500) and a 13px value (color `--ink`, weight 600). Cells are: Active users / Updated / Price.

#### Action row

- Flex `gap: 8px`, two equal-flex buttons:
  - **"View details"** (default): font Geist, 13px, weight 500, padding `10px 14px`, `border-radius: 8px`, 1px `--graphite` border, background `--bone`, color `--ink`. Hover: background `--bone-2`, border `--ink`.
  - **"Visit site →"** (primary): same shape, background `--ink`, color white, border `--ink`. Hover: background `--ink-2`.
- Clicking anywhere on the card opens the detail drawer; the "Visit site" button stops propagation (it should hit the affiliate link in production). The "View details" button explicitly opens the drawer too.

### 5. Compare CTA (`<CompareCTA />`)

- **Outer:** `max-width: 1180px`, padded `64px 32px`, centered.
- **Inner:** background `linear-gradient(135deg, var(--ink) 0%, var(--ink-2) 100%)`, `border-radius: 24px`, padding `56px 40px`, white text.
- **Title:** Geist 600, 36px, `letter-spacing: -0.025em`, `line-height: 1.1`, `max-width: 600px`, centered, white. Margin 0 0 12px. Copy: "Want to compare two of these in depth?"
- **Sub:** 16px, `line-height: 1.55`, `color: rgba(255,255,255,0.7)`, `max-width: 520px`, centered. Margin 0 auto 28px.
- **Button:** background `--amber` (cobalt #1F4FFF), white text, no border, padding `14px 22px`, `border-radius: 10px`, font-size 15px, weight 500, with a `→` glyph after a 8px gap. Hover: background `--amber-deep`, translate `Y(-1px)`. Links to `Chat.html`.

### 6. Disclosure footer (`<DisclosureFooter />`)

- **Outer:** background `--bone-2`, 1px `--graphite` top border, padding `48px 32px`.
- **Inner:** `max-width: 1180px`, centered, two-column grid `240px 1fr`, gap 48px. Stacks below 720px.
- **Left:**
  - Title (h3): Geist 600, 22px, `letter-spacing: -0.015em`, color `--ink`. Margin 0 0 8px. Copy: "How we make money".
  - Lede: 14px, color `--fg-3`. Copy: "Transparency is the product. Here's the full picture."
- **Right:** 3-column grid (gap 24px), stacks to 1 column below 720px. Each item:
  - Head row: a colored 8×8px circular "pip" + uppercase label. 12px, weight 600, `letter-spacing: 0.02em`, color `--ink`. The first pip is `--amber` (cobalt); the others are `--graphite-2`.
  - Body: 13.5px, line-height 1.5, color `--fg-2`. Margin 0.

The exact copy for the three items is in `tools-components.jsx > DisclosureFooter`. Do not paraphrase — the wording is intentional (matter-of-fact, no apology, no emoji).

### 7. Tool detail drawer (`<ToolDrawer />`)

A right-anchored modal panel that slides in when a card is clicked or "View details" is pressed.

- **Backdrop:** fixed inset, `background: rgba(11, 18, 32, 0.4)`, `z-index: 100`. Fades in over 200ms (`shade-in` keyframes 0→1 opacity).
- **Panel:** fixed top/right/bottom, `width: min(640px, 100vw)`, background `--bone`, `z-index: 101`, scrolls vertically. Slides in from right over 280ms (`drawer-in` keyframes `translateX(100%) → 0`). Drop shadow `-16px 0 40px rgba(11,18,32,0.16)`.
- **Sticky head:** background `rgba(245,243,238,0.92)` + 20px backdrop blur, padding `16px 24px`, flex `justify-content: space-between`, 1px `--graphite` bottom border, `z-index: 1`.
  - Left: medal badge + tool name (15px, weight 600, color `--ink`).
  - Right: 32×32px close button — 1px `--graphite` border, `border-radius: 8px`, white background, `✕` glyph at 16px in `--fg-2`. Hover: background `--bone-2`, color `--ink`.
- **Body:** padding `28px 32px 80px`. Sections in order:
  1. **Sponsor banner** (only if `tool.sponsored`): `--bone-2` background, 1px `--graphite`, `border-radius: 10px`, padding `12px 14px`, 13px text in `--fg-2`. Begins with a small italic "i" indicator (18×18px circle, `--graphite-2` background, white serif italic "i").
  2. **Hero row:** 64×64px logo (same colors as card logo, `border-radius: 14px`, font-size 28px) + name (Geist 600, 32px, `letter-spacing: -0.025em`) + 14px one-liner in `--fg-3`.
  3. **CTA row:** "Visit {Name} →" primary button + "Save to my stack" default button. Both `padding: 12px 18px` (primary 12px 22px). Margin 24px 0 32px.
  4. **"Best for your goal" callout:** white background, 1px `--amber` (cobalt) border, `border-radius: 12px`, padding `18px 20px`, `box-shadow: var(--stamp-amber)` (2px 2px 0 0 cobalt). The same head pattern as the card AI block; body is 15px, line-height 1.55.
  5. **Section header style:** all subsequent `<h3>` headers use Geist 600, 13px, color `--fg-3`, `letter-spacing: 0.04em`, uppercase, margin `32px 0 12px`.
  6. **Editor's review:** two paragraphs at 15px, line-height 1.65, color `--fg-1`. Margin-bottom 12px between paragraphs.
  7. **How to use it for your goal:** vertical list of step cards.
     - Each step: white card with 1px `--graphite` border, `border-radius: 10px`, padding `14px 16px`, two-column grid `28px 1fr` with 14px gap.
     - Number: 26×26px circle, background `--ink`, white mono numeral, weight 600, 12px.
     - Title: 14px, weight 600, color `--ink`, margin 0 0 4px.
     - Body: 13.5px, line-height 1.55, color `--fg-2`.
  8. **Pros & cons:** 2-column grid (1 column below 600px), gap 16px. Each column: white card with 1px `--graphite`, padding `16px 18px`, `border-radius: 10px`.
     - Heading: 11px, weight 600, `letter-spacing: 0.05em`, uppercase. Pros color `#1A6F2E` (deep paper-friendly green), cons color `#B22222` (the system's err red).
     - List: no bullets, `gap: 6px`, items at 13.5px line-height 1.45 in `--fg-1` with 18px left padding and a colored 10×2px rounded dash absolute-positioned at `(0, 8px)` matching the column's accent color.
  9. **"Compare … with another pick" CTA:** dark card. Background `--ink`, white text, `border-radius: 12px`, padding `20px 24px`. Flex wrap `space-between`. Title 15px weight 600; sub 13px in `rgba(255,255,255,0.65)`. Right side: cobalt button (background `--amber`, border `--amber`, color white) "Open chat →".

#### Drawer behavior

- Opens when `setOpenTool({ tool, category })` is called from a card click.
- Closes via:
  - Click on backdrop (`onClose` on `t-drawer-shade`).
  - Click on the close button.
  - **Escape key** (effect attaches a `keydown` listener for the lifetime of the drawer).
- While open, body `overflow` is set to `hidden` to prevent background scroll. Restored on unmount.

---

## Interactions & Behavior

| Trigger | Result | Notes |
|---|---|---|
| Page load | Reads `?chat={id}` from URL; defaults to `crm`. Looks up the chat in `CHATS_CTX` and the matching category in `TOOLS_DATA`. | Production: this should be a real recommendation result keyed off a chat/session ID, fetched server-side from `/api/tools/recommend`. |
| Click anywhere on a tool card | Opens the drawer for that tool. | Card has `cursor: pointer`. |
| Click "View details" inside a card | Opens the drawer (event bubbling — duplicates card click but explicit for a11y). | |
| Click "Visit site →" inside a card | Stops propagation. (Prototype: no-op.) | Production: open the affiliate URL in a new tab; record an attribution event. |
| Click backdrop / close button / press Escape | Closes drawer. | Body scroll lock is released. |
| Click "Edit signals →" in hero card | Navigates to `Chat.html`. | Production: should jump back to the chat with the assistant ready to refine its understanding. |
| Click "← Back to chat" in nav | Navigates to `Chat.html`. | |
| Click "Continue the chat" (compare CTA) | Navigates to `Chat.html`. | |
| Hover any card | Border darkens to `--ink`, card lifts 2px, soft shadow appears. 200ms transition with `cubic-bezier(0.2, 0.8, 0.2, 1)`. | |
| Hover any link or chip-style action | Background fills with `--bone-2` (or `--amber-tint` for cobalt actions). | |

### Animations

- **Drawer slide-in:** 280ms `cubic-bezier(0.2, 0.8, 0.2, 1)`, `translateX(100% → 0)`.
- **Backdrop fade-in:** 200ms same ease.
- **All hover transitions:** 200ms same ease. Properties animated: background, border-color, transform, box-shadow.
- **Press states:** instant — no transition delay on going *into* press, only on returning. (BuilderStack rule: hover-out animates, hover-in is immediate.) For the Tools page in particular, buttons translate `Y(1px)` on `:active` for primary actions; cards do not respond to press (they navigate).

### Empty / loading / error states

The prototype does not implement these. For production:

- **Loading:** show 4 skeleton cards in the same grid. Skeleton uses `--bone-2` blocks with 1px `--graphite` borders, no shimmer (the brand is calm).
- **Empty:** "No tools matched the brief. Try a broader category." in 18px `--fg-2`, with a single ghost button "Refine in chat →".
- **Error:** "Couldn't reach the catalog. Retry, or check your connection." Match the brand's matter-of-fact voice (see project README's voice guide).
- **Drawer focus:** the panel should trap focus, and the close button should be the initial focus target. The prototype omits this — production should not.

---

## State Management

The page is intentionally simple:

- `openTool: { tool, category } | null` — controls drawer visibility and which tool/category is shown.
- `chatId` — read from URL; not user-mutable on this page.

Everything else (the tools list, the chat context, the rankings) is server-derived and read-only from the page's perspective.

### Production state shape

The recommendation API should return something like:

```ts
type ToolsPageData = {
  chat: {
    id: string;
    title: string;
    summary: string;
    signals: { label: string; value: string }[];
  };
  category: {
    id: string;
    title: string;
    blurb: string;
  };
  tools: Tool[];      // length = 4
};

type Tool = {
  rank: 1 | 2 | 3 | 4;
  sponsored: boolean;             // true only when rank === 4
  name: string;
  slug: string;
  logo: string;                   // single character for the prototype's
                                  // initial; production should use a real SVG/image
  logoBg: string;                 // hex
  oneliner: string;
  forYou: string;                 // AI-generated rationale
  users: string;
  updated: string;                // ISO date or pre-formatted "Apr 12, 2026"
  price: string;
  rating: number;                 // 1 decimal
  tags: string[];                 // 2-4
  pros: string[];
  cons: string[];
};
```

The drawer's "How to use it" plan is generated client-side in the prototype (`tools-components.jsx > ToolDrawer > howto`). Production should request these from the recommendation backend so they can be tailored to the chat — the prototype's templating is just a placeholder.

---

## Design Tokens

These are the values the page actually uses. Port them into your Tailwind theme extension (or your design-token system). The full system is in `colors_and_type.css` plus the cobalt theme override in `theme.css` — values below are the merged final values.

### Colors

| Token | Hex | Usage |
|---|---|---|
| `--bone` | `#F5F3EE` | Page canvas, default background |
| `--bone-2` | `#ECE9E1` | Chips, sponsor banner, hover fills, footer surface |
| `--bone-3` | `#E2DED3` | Inset wells |
| `--ink` | `#0A1628` | Primary text, primary buttons, dark surfaces |
| `--ink-2` | `#142442` | Secondary dark, button hover |
| `--graphite` | `#D6D2C7` | Hairline borders |
| `--graphite-2` | `#9A9588` | Muted text, sponsor pip, "i" indicator |
| `--graphite-d` | `#1F2D45` | Borders on dark surfaces |
| `--amber` (cobalt) | `#1F4FFF` | Single accent — CTAs, AI chip, AI block border, links |
| `--amber-deep` | `#1538C8` | Cobalt hover/press |
| `--amber-tint` | `#E0E8FF` | AI block background, faint cobalt wash |
| `--navy` | `#0A1628` | Same as ink in cobalt theme (preserved for compatibility) |
| `--fg-1` | `#0A1628` | Body text on bone |
| `--fg-2` | `#2E3A52` | Secondary text |
| `--fg-3` | `#5C6376` | Meta text, eyebrows |
| `--fg-on-dark` | `#F5F3EE` | Text on ink |
| `--fg-on-dark-2` | `#A8B0C2` | Secondary text on ink |
| `--ok` | `#1E6B4F` | Pros heading (overridden to `#1A6F2E` in tools-styles) |
| `--err` | `#B22222` | Cons heading |

#### Medal-specific colors (literal — not in token file)

| Element | Value |
|---|---|
| Gold pill bg | `linear-gradient(180deg, #FBE9B6 0%, #F2D17A 100%)` |
| Gold pill text | `#6E4A0B` |
| Gold pill border | `#E0B860` |
| Gold ring | `linear-gradient(180deg, #E5B547 0%, #B8860B 100%)` |
| Silver pill bg | `linear-gradient(180deg, #EEF1F4 0%, #D9DDE3 100%)` |
| Silver pill text | `#424650` |
| Silver pill border | `#B8BDC4` |
| Silver ring | `linear-gradient(180deg, #C0C5CD 0%, #8A8F98 100%)` |
| Bronze pill bg | `linear-gradient(180deg, #F1DEC9 0%, #E0C09E 100%)` |
| Bronze pill text | `#6B3D1F` |
| Bronze pill border | `#C68A5C` |
| Bronze ring | `linear-gradient(180deg, #B97E50 0%, #8C552B 100%)` |
| Card stripe gold | `linear-gradient(90deg, #E5B547 0%, #C19024 100%)` |
| Card stripe silver | `linear-gradient(90deg, #C8CCD2 0%, #9499A2 100%)` |
| Card stripe bronze | `linear-gradient(90deg, #C68A5C 0%, #92602F 100%)` |
| Card stripe sponsor | `--graphite` solid |
| Star glyph in rating | `#E5B547` |

### Typography

Three families, loaded via Google Fonts:

```html
<link href="https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600;700&family=Instrument+Serif:ital@0;1&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
```

| Family | Stack | Where used on this page |
|---|---|---|
| Geist | `"Geist", system-ui, -apple-system, "Segoe UI", sans-serif` | All UI text, all headings on this page (the design system reserves Instrument Serif for marketing display, not used on this internal screen) |
| Instrument Serif | `"Instrument Serif", "Cormorant Garamond", Georgia, serif` | Not used on this page (reserved for marketing) |
| JetBrains Mono | `"JetBrains Mono", ui-monospace, "SF Mono", Menlo, monospace` | Eyebrows ("THE SHORTLIST", "Updated weekly"), medal ring numerals, drawer step numerals |

`font-variant-numeric: tabular-nums` is set globally on `html` so ratings and counts align across rows.

### Type scale used on this page

| Element | Family | Size | Weight | Line-height | Letter-spacing |
|---|---|---|---|---|---|
| Hero title | Geist | 72px (48px ≤880px) | 600 | 1.05 | -0.035em |
| Category title (h2) | Geist | 44px (32px ≤880px) | 600 | 1.05 | -0.025em |
| Compare CTA title | Geist | 36px | 600 | 1.1 | -0.025em |
| Drawer tool name | Geist | 32px | 600 | 1.1 | -0.025em |
| Card tool name | Geist | 22px | 600 | 1.15 | -0.015em |
| Footer title | Geist | 22px | 600 | (default) | -0.015em |
| Logo (drawer) | Geist | 28px | 600 | — | -0.01em |
| Logo (card) | Geist | 19px | 600 | — | -0.01em |
| Body | Geist | 15-17px | 400 | 1.5-1.65 | 0 |
| Card description / drawer review | 15px | 400 | 1.55-1.65 | 0 |
| Card AI body, oneliner | 13.5px | 400 | 1.5 | 0 |
| Eyebrows / overlines | JetBrains Mono | 11-12px | 600 | 1 | 0.04-0.06em |
| Trust strip values | Geist | 13px | 600 | 1.3 | 0 |
| Trust strip labels | Geist | 11.5px | 500 | 1.3 | 0 |
| Tag chip | Geist | 11.5px | 500 | — | 0 |
| Medal pill | Geist | 11px | 600 | — | 0.02em |

### Spacing

8-point base. The page uses these specific rhythm values:

| Token | px | Where |
|---|---|---|
| Page side padding | 32px desktop, 24px mobile | All sections |
| Section vertical break | 80px (between hero and first category) | `.t-cat` top |
| Hero top padding | 96px | `.t-hero` |
| Card padding | 24px | All cards |
| Card gap (column flow) | 16px | `.t-card` |
| Grid gap | 18px | Tool grid |
| Drawer body padding | `28px 32px 80px` | `.t-drawer__body` |
| Drawer head padding | `16px 24px` | `.t-drawer__head` |
| Drawer h3 margin | `32px 0 12px` | All drawer subheads |

### Radii

The Tools page is a chat-app surface and uses softer corners than the rest of the design system (which is sharp-cornered). Specifically:

- Cards: `18px`
- Buttons: `8-10px`
- AI block, pros/cons, how-to step: `10-12px`
- Drawer panel children: `10-14px`
- Logo (card): `10px`
- Logo (drawer): `14px`
- Pills (medals, tags, chips): `100px` (fully rounded)
- Icon-square brand mark: `5px`
- Compare CTA outer: `24px`

### Shadows

| Token | Value | Where |
|---|---|---|
| `--stamp-1` | `2px 2px 0 0 #0A1628` | Signal summary card |
| `--stamp-amber` | `2px 2px 0 0 #1F4FFF` | Drawer "Best for your goal" callout |
| Card hover | `0 12px 32px rgba(11, 18, 32, 0.08)` | Tool cards on hover |
| Drawer | `-16px 0 40px rgba(11, 18, 32, 0.16)` | Drawer panel left edge |

### Motion

- Easing: `cubic-bezier(0.2, 0.8, 0.2, 1)` (token: `--ease`)
- Default duration: `200ms` (token: `--dur`)
- Drawer slide-in: `280ms`
- Backdrop fade-in: `200ms`
- No bounces, no springs, no parallax. Hover *into* state is instant; only the *return* transitions.

### Layout breakpoints

| Breakpoint | Behavior |
|---|---|
| ≤ 880px | Tool grid collapses to 1 column. Hero title 72→48px. Category title 44→32px. Category head stacks. |
| ≤ 720px | Footer collapses to 1 column. |
| ≤ 600px | Drawer pros/cons collapse to 1 column. |

---

## Assets

| Asset | Location | Notes |
|---|---|---|
| `logo-mark.svg` | `design_files/assets/` | Stamped "B/S" monogram. Used for favicon. |
| Logo wordmarks | (not used on this page) | The Tools page renders the brand inline as a 24×24px square + "BuilderStack" text — see `t-nav__brand` in CSS. |
| Tool logos | Currently a single character + colored background. | **Replace with real SVG/image logos in production.** Each tool object has a `logoBg` hex that should still be honored as a fallback if the image fails. |
| Star glyph | Unicode `★` | Color `#E5B547`. Replace with a Lucide `star` icon (1.5px stroke, color `#E5B547`) for crisper rendering. The design system standardises on Lucide — see project README. |
| Arrow glyphs | Unicode `→`, `←`, `✕` | Acceptable per the design system. Can be replaced with Lucide if visual consistency demands it. |

---

## Files

In `design_files/`:

| File | Purpose |
|---|---|
| `Tools.html` | Page entry point. Loads fonts, three CSS files, and three JSX scripts. |
| `colors_and_type.css` | The full design system tokens — colors, type, spacing, radii, shadows, motion, plus base element styles, button, card, tag, form components. **The single source of truth for tokens.** |
| `theme.css` | Cobalt theme override layer that recolors the warm system into the cool premium palette this page uses. Read this *after* `colors_and_type.css`. |
| `styles.css` | The shared app styles for the BuilderStack chat experience (the Tools page rides on top of these). |
| `tools-styles.css` | Tools-page-specific component styles. ~900 lines. The bulk of the visual specification. |
| `tools-data.js` | Static `TOOLS_DATA` and `CHATS_CTX` — three categories with four tools each, three sample chat contexts. **Replace entirely with API responses in production.** |
| `tools-components.jsx` | All React components: `ToolsNav`, `ToolsHero`, `Medal`, `ToolCard`, `CategorySection`, `CompareCTA`, `DisclosureFooter`, `ToolDrawer`. ~300 lines. The structural specification. |
| `tools-app.jsx` | The `ToolsApp` shell — reads `?chat=` from the URL, looks up the matching context, and renders the page. |

### How to view the design

Open `design_files/Tools.html` in a browser. URL `?chat=crm` (default), `?chat=web`, or `?chat=ana` will show the three different sample chats and their corresponding categories.

---

## Implementation notes for the developer

### Recommended approach in Next.js

1. **Tokens first.** Open `colors_and_type.css` and `theme.css`, port every variable into `tailwind.config.ts` under `theme.extend.colors / fontFamily / spacing / borderRadius / boxShadow / transitionTimingFunction`. Keep variable names — Tailwind's arbitrary-value syntax (`bg-[var(--bone)]`) is a fine fallback for tokens you don't want to alias.
2. **Fonts.** Use `next/font/google` for Geist and JetBrains Mono. Don't inline the `<link>` tag.
3. **Page route.** `app/tools/page.tsx` (Server Component) reads the chat ID from search params, calls the recommendation API, and passes data to a client component for the interactive parts.
4. **Componentise** matching the JSX file: `<ToolsNav>`, `<ToolsHero>`, `<ToolCard>`, `<CategorySection>`, `<CompareCTA>`, `<DisclosureFooter>`, `<ToolDrawer>`. The first six can be RSC; the drawer has to be a client component because of state, focus management, and key handlers.
5. **Drawer.** Use a real headless library — Radix `Dialog` or React Aria `Modal` — not a hand-rolled overlay. The prototype handles Escape and body scroll lock; production also needs focus trap, focus restoration on close, and `aria-modal`.
6. **`<a>` vs `<Link>`.** The prototype links to `Chat.html` everywhere — replace with `next/link` to `/chat/[id]` (or whatever the chat route ends up being).
7. **The medal/badge as a primitive.** It's used in both the card and the drawer. Worth its own component with a `rank: 1 | 2 | 3 | 4 | 'sponsored'` prop.
8. **Accessibility gaps to fix.**
   - The card's nested buttons currently sit inside a clickable parent — that's an a11y antipattern. Either make the card a `<button>` and the children `<span>`s with role="button"+e.stopPropagation, or use a single anchor wrapping the card and give the action buttons their own outside-the-card position.
   - The `★` star inside the rating cell needs an `aria-label` like "Rated 4.8 out of 5".
   - The medal icon ring's text ("1", "2", "3", "$") is decorative — wrap in `aria-hidden`. The pill text "TOP PICK" / etc. is the actual a11y label.
   - Add `prefers-reduced-motion` handling to the drawer slide and any future animations.

### What's intentionally *not* in this design

- **No multi-category nav.** The page shows one category at a time, derived from the chat. The `t-nav__categories` selector exists in CSS (left over from an earlier draft) but is unused. Don't add a category switcher unless the user explicitly asks for one.
- **No filtering, sorting, or search.** The shortlist is curated by the AI; the user goes back to the chat to refine it.
- **No login / account chrome on this page.** That lives elsewhere in the app.
- **No "save to my stack" functionality** beyond the button. The drawer has the affordance; production should wire it to whatever the saved-tools API ends up being.

### Voice and copy

The full voice guide is in the project's root `README.md`. The Tools page follows it strictly:

- Sentence case for everything except medal labels (which are intentionally ALL CAPS as small overlines).
- No emoji.
- Em dashes for asides, Oxford comma always, no exclamation points.
- The disclosure footer uses matter-of-fact language ("Editorial picks #1, #2 and #3 are not for sale.") — don't soften it.
- The "for you" rationale always ends with a "because" clause when generated by the recommendation engine.
