# <img src="https://migueldilalla.github.io/assets/branding-elements/flowloops-medium.png" alt="FlowLoops Logo" width="200" height="200" style="vertical-align: middle; margin-right: 10px;"> FlowLoops ⏱️🌐

> A weird little progressive web app to trick you into tracking time — by hiding it.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT) [![PWA Ready](https://img.shields.io/badge/PWA-Ready-blue)](https://migueldilalla.github.io/not-pomodoro-app/) [![GitHub Pages](https://img.shields.io/badge/GitHub%20Pages-Deployed-brightgreen)](https://migueldilalla.github.io/not-pomodoro-app/) [![Vanilla JS](https://img.shields.io/badge/Vanilla-JS-yellow)](http://vanilla-js.com/) [![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML) [![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS) [![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/) [![ES Modules](https://img.shields.io/badge/ES-Modules-F7DF1E)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules) [![Works Offline](https://img.shields.io/badge/Works-Offline-green)](https://migueldilalla.github.io/not-pomodoro-app/) [![No Dependencies](https://img.shields.io/badge/Dependencies-None-brightgreen)](https://migueldilalla.github.io/not-pomodoro-app/)

## 🌀 What is FlowLoops?

FlowLoops is a minimalist, installable time tracker that hides the passage of time behind a playful interface. It’s perfect for folks who:

- Feel pressured or distracted by visible timers
- Crave novelty, randomness, or sensory simplicity
- Want to build focus through gentle structure — not rigid discipline
- Love the idea of gamifying attention

Instead of showing a countdown, FlowLoops presents you with 7 mysterious buttons. Each triggers a timer between 2 and 21 minutes, but you’ll never know exactly how long it is. When time’s up, you’ll get a subtle nudge and an optional visual history of your flow.

---

## ✨ Features

### 🎮 Core Experience
- **Hidden Timer Engine** — No visible countdown, no pressure
- **Randomized Button Grid** — 7 clickable options that each start a timer
- **Auto-Chaining Mode** — New timers can start automatically after one ends
- **Session History** — Track completed loops and total focused time

### 🌈 Design
- **Minimalist Two-Panel UI** — One side welcomes you, the other lets you interact
- **Animated Background** — Gentle metaball-inspired visuals respond to flow
- **Teal & Red Theme** — High-focus but warm color palette
- **MontaguSlap + Lexend Deca Fonts** — Quirky and legible

### 🔧 Technical
- **Installable PWA** — Add FlowLoops to your phone or desktop
- **Fully Offline Ready** — Cached via service worker and `offline.html` fallback
- **Browser Notifications** — Get a ping when your loop ends
- **Vanilla JS with ES Modules** — No React, no build tools required
- **Modular Architecture** — Logic is organized by functional panels and services
- **No Logins, No Servers** — 100% client-side, private by design

---

## 🚀 How to Start Using It

1. Visit: [FlowLoops App](https://MiguelDiLalla.github.io/not-pomodoro-app/)
2. Press **Run** to begin a session
3. Click any of the 7 mystery buttons
4. When the timer ends, you’ll get a notification
5. Repeat or select a new button to reset the flow

> 💡 Bonus: Install FlowLoops to your home screen for a full app experience.

---

## 📴 Works Even When You're Offline

FlowLoops includes a themed offline screen and continues to function with limited features if your internet drops. Timers still run. History is preserved locally. You’ll be nudged to reconnect — but your focus doesn’t have to break.

---

## 🧑‍💻 For Developers & Hackers

```bash
# Clone the repo
git clone https://github.com/MiguelDiLalla/not-pomodoro-app.git
```

> ⚠️ This version is built with **vanilla JavaScript**, ES modules, and plain HTML/CSS. It requires **no compilation, no frameworks, and no build system**.

### 📁 Folder Highlights
- `/scripts/` contains core logic split into panels and services
- `/styles/` holds modular CSS files with no preprocessor
- `service-worker.js` handles offline + notification logic

You can open and run the app directly by launching `index.html` in a browser or deploying to GitHub Pages.

---

## 🪪 License

MIT © Miguel Di Lalla

---

Crafted with patience, weirdness, and care — for anyone who wants to playfully reclaim their time. ✨

