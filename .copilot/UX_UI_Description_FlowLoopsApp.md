# FlowLoops Manual Build Instructions (Vanilla Version)

> A weird little timer game to trick you into tracking your time — built with **HTML, Tailwind, and JavaScript only**. No React. No Vite. No build system.

## 🧠 Concept

**FlowLoops** is an ADHD-friendly alternative to a traditional Pomodoro timer. Unlike standard timers, FlowLoops thrives on randomness, curiosity, and user choice. There’s no visible countdown — only buttons that reroll hidden timers, offering a playful time-tracking mechanic.

This version is fully static. Everything is rendered client-side. It’s installable as a PWA, works offline, and requires no bundler, no framework, and no backend.

---

## 🔁 Core Mechanic

- On **Run**:
  - Generate 8 random times (2–21 min).
  - Choose 1 secretly to start running.
  - Show 7 buttons with times (1 is hidden).

- On **button click**:
  - Timer resets to that button’s time.
  - Button rerolls to a new interval.

- On **timer complete**:
  - Show notification with elapsed round + total time.
  - Auto-click one random button.

- On **Pause**:
  - Hide button values.
  - Disable interaction.

---

## 🧩 UI Elements (Vanilla Modules)

```
┌────────────────────┬────────────────────┬────────────────────┐
│  Title & Text      │     Buttons        │     History        │
│  Panel             │     Panel          │     Sidebar        │
│  ───────────────   │  ───────────────   │  ───────────────   │
└────────────────────┴────────────────────┴────────────────────┘
          ↑ Background Layer: AnimatedBackground.jsx + animations.css
```

| Module File              | Purpose                                    |
| ------------------------ | ------------------------------------------ |
| `main.js`                | Initializes the app and renders each panel |
| `titlePanel.js`          | Injects app title + subheading             |
| `buttonsPanel.js`        | Renders 8 interactive buttons + Run/Pause  |
| `historySidebar.js`      | Logs and displays past events              |
| `timerManager.js`        | Handles all timing logic                   |
| `notificationManager.js` | Wraps Notifications API                    |

---

## 🎨 Aesthetic + Layout

- **Fonts**: `MontaguSlap` (title), `Lexend Deca` (text)
- **Colors**: Tailwind's `teal-600` background + `red-400` animated blobs
- **Panels**: 3-column grid
  - Left: title + motivational text
  - Center: button grid + control
  - Right: history log (sticky on desktop, compact bar on mobile)
- **Animated Background**:
  - 2 drifting red blur blobs
  - Behind all content
  - Styled in `animations.css`

### 📋 Title & Text Panel (Left)

- Role: Displays the app title, phase-specific messages, and motivational blurbs. Sets the tone for each session.

#### 🧩 Design Spec
- Title uses `MontaguSlap`, styled with Tailwind class `font-title`
- Subheadings and text use `Lexend Deca`, styled with `font-sans`
- Panel is vertically centered, with left/right padding
- Rounded edges, fits inside a column container (with `rounded-2xl`, `p-4`, etc.)

```text
┌────────────────────────────────────┐
│   "FlowLoops"                     │   ← Large title (MontaguSlap)
│   "Time is a game. Play it."      │   ← Subheading (Lexend Deca)
└────────────────────────────────────┘
```

---

### 🎛️ Buttons Panel (Center)

- Role: Main interactive zone with 8 mystery buttons. One is active (secret timer); others are clickable for timer resets. Central Run/Pause control included.

#### 🧩 Design Spec
- All buttons are stacked vertically like an always-open **combo box**
- Uses `flex-col`-like and equal spacing
- Each button styled with `.mystery-button`, rounded, interactive hover/active states
- Layout is fully centered and responsive

```text
┌────────────────────────────┐
│ [ Button 1 ]               │
│ [ Button 2 ]               │
│ [ Button 3 ]               │
│ [ Button 4 ]               │
│ [ Button 5 ]               │
│ [ Button 6 ]               │
│ [ Button 7 ]               │
│───────────────────────────│
│ [ Run / Pause Button ]     │
└────────────────────────────┘
```

---

### 📈 History Sidebar (Right)

- Role: Displays session history (button clicks, timer triggers, total time). 

#### 🧭 Responsive Behavior
| Device | Visibility | Position | Content |
|--------|------------|----------|---------|
| **Desktop** | Always visible | Right Panel | Full history log (bottom-aligned), total time at the bottom |
| **Mobile** | Compact bar | Bottom nav-like element | Only shows total time + last entry summary |

- Background color: same red tone as metaballs (`red-400`), blended softly
- Layout: No scroll — content must **fit or clip**, always within `overflow-hidden`

```text
Desktop Layout:
┌──────────────┐
│ History Log  │   ← scrollable div (flex-col-reverse)
│  ...         │
│  Session #3  │
│──────────────│
│ Total Time:  │   ← fixed at bottom
└──────────────┘

Mobile Layout:
┌────────────────────────── Bottom Bar ──────────────────────────┐
│  Total Time: XX:XX  |  Last Event: "Paused at 11:42"           │
└────────────────────────────────────────────────────────────────┘
```


---

## ⚙️ Tech Stack

- `HTML` (index.html layout)
- `TailwindCSS` (via CDN or local build)
- `JavaScript` (ES6 modules)
- `Notifications API`
- `Web Manifest` + (optional) `Service Worker`

---

## 🚫 Not Included

- No React
- No build tools
- No state library
- No routing or SSR
- No external dependencies

---

## 📁 Folder Structure

```
flowloops-vanilla/
├── index.html
├── styles/
│   ├── tailwind.css
│   ├── animations.css
│   └── main.css
├── scripts/
│   ├── main.js
│   ├── timerManager.js
│   ├── notificationManager.js
│   └── panels/
│       ├── titlePanel.js
│       ├── buttonsPanel.js
│       └── historySidebar.js
├── sounds/
│   └── click.mp3
├── icons/
│   ├── icon-192.png
│   └── icon-512.png
├── manifest.json
└── service-worker.js
```

---

## 📋 File Overview

| File | Role | Location | Type | Depends On |
|------|------|----------|------|------------|
| `index.html` | HTML structure & root layout | `/` | Static | styles, scripts |
| `tailwind.css` | Utility-first styling | `styles/` | CSS | Tailwind CDN or CLI |
| `animations.css` | Blob motion & blur styles | `styles/` | CSS | None |
| `main.js` | App entry point | `scripts/` | JS module | all panels + timer |
| `titlePanel.js` | Title text renderer | `scripts/panels/` | JS | DOM |
| `buttonsPanel.js` | Renders button grid + Run/Pause | `scripts/panels/` | JS | timer, DOM |
| `historySidebar.js` | Logs & displays session history | `scripts/panels/` | JS | DOM |
| `timerManager.js` | Timer control logic | `scripts/` | JS | Date/time APIs |
| `notificationManager.js` | Triggers system notifications | `scripts/` | JS | Notification API |
| `manifest.json` | Metadata for PWA installability | `/` | JSON | Icons, theme |
| `service-worker.js` | (Optional) offline caching | `/` | JS | Web APIs |

---

## 🔨 Development Phases

### ✅ Phase 1: Scaffold & Setup
- Create folder + file structure ✔️
- Add CDN Tailwind to `index.html` ✔️
- Create `scripts/main.js` + empty modules ✔️

### 🎨 Phase 2: Visual Layer
- Implement `index.html` with layout grid ✔️
- Add procedural `animations.css` blobs ✔️
- Mount empty panels in HTML ✔️

### 🧩 Phase 3: Core Panels
- `titlePanel.js`: render headings ✔️
- `buttonsPanel.js`: grid logic + sound + timer interaction ✔️
- `historySidebar.js`: log + reverse stacking ✔️
### ⏱️ Phase 4: Logic Engine
- `timerManager.js`: start/pause/reset, random interval ✔️
- `notificationManager.js`: permission + alerts ✔️

### 📲 Phase 5: PWA Support
- Add `manifest.json` and icons ✔️
- Add basic `service-worker.js` ✔️

### 🧪 Phase 6: Polish & Feedback
- Confirm mobile layout
- Clip overflow content in history
- Trigger audio feedback on buttons

---

## 📱 PWA Integration

```html
<link rel="manifest" href="/manifest.json">
<script>
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js');
  }
</script>
```

---

## 🧩 Development Philosophy

This project is meant to feel **playful and lightweight**, like a toy. The randomness, minimal UI, and mystery create a sense of flow without strict rules. It’s intentionally ambiguous — it’s not meant to tell you what to do, just to keep you gently moving forward.

No productivity guilt. No clock stress. Just loops.

---

_Crafted with weirdness, love, and focus._

