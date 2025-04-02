# FlowLoops Manual Build Instructions (Vanilla Version)

> A weird little timer game to trick you into tracking your time — built with **HTML, Tailwind, and JavaScript only**. No React. No Vite. No build system.

> **Note:** Refer to `.copilot\UX_UI_Description_FlowLoopsApp.md` for detailed UX/UI concepts and development guidance.

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

| Module File | Purpose |
|-------------|---------|
| `main.js` | Initializes the app and renders each panel |
| `titlePanel.js` | Injects app title + subheading |
| `buttonsPanel.js` | Renders 8 interactive buttons + Run/Pause |
| `historySidebar.js` | Logs and displays past events |
| `timerManager.js` | Handles all timing logic |
| `notificationManager.js` | Wraps Notifications API |

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
│   ├── tailwind.css (or CDN)
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

## ✨ Instructions for Development

- Use `<script type="module">` to load `scripts/main.js`
- Tailwind can be loaded via CDN or CLI-precompiled file
- Fonts can be loaded via Google Fonts or Miguel's host
- Use semantic HTML for all structure
- History panel should support scroll clipping or reverse stacking
- Follow industry-standard coding practices:
  - **JavaScript Formatting**: Use consistent indentation (2 spaces), meaningful variable names, and JSDoc comments for functions
  - **Documentation**: Add descriptive comments for complex logic and document all exported functions/modules
  - **Code Structure**: Organize code into logical modules with single responsibilities
  - **HTML/CSS**: Follow BEM naming conventions for CSS classes
  - **Linting**: While no build tools are used, maintain clean code that would pass ESLint standards

---

## 📱 PWA Integration

- Manifest defines name, icons, theme, and behavior
- Service Worker (optional) adds installability + caching
- Add meta tags to `index.html`

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

For detailed UX/UI guidelines and design concepts, refer to the `.copilot\UX_UI_Description_FlowLoopsApp.md` file, which serves as the primary concept and development guide.

---

_Crafted with weirdness, love, and focus._

