<p align="center">
  <img src="icons/icon128.png" width="128" height="128" alt="FocusFlow Logo">
</p>

# 🎯 FocusFlow — Focus & Digital Detox Chrome Extension

<p align="center">
  <img src="https://img.shields.io/github/license/eldarshiraliyev/FocusFlow?style=flat-square&color=5672cd" alt="License">
  <img src="https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square" alt="PRs Welcome">
  <img src="https://img.shields.io/badge/Manifest-V3-orange.svg?style=flat-square" alt="Manifest V3">
</p>

<p align="center">
  <b>Mobile-style app timers for websites.</b><br>
  Take control of your digital habits with smart limits, distraction blocking, and a privacy-first approach.
</p>

---

## 🌐 Overview

**FocusFlow** is a lightweight, open-source Chrome extension designed to help users reduce digital distractions and build healthier browsing habits.

Unlike traditional website blockers, FocusFlow works like **mobile screen time limits**:

- Track your total daily time on distracting websites
- Set custom limits for each platform
- Block access when your time runs out
- Keep all data stored locally

No accounts. No external servers. No tracking.

---

## ✨ Features

### ⏱️ Mobile-Style Website Timers
Set daily limits for websites just like app timers on your phone.
Example:
YouTube    → 30 minutes/day
Instagram  → 15 minutes/day
TikTok     → 20 minutes/day

Your usage tracking continues smoothly across page refreshes, tab changes, and Single Page Application (SPA) navigations.

### 🚫 Strict Distraction Blocking
When your daily limit is reached:
- The page content is completely restricted.
- Scrolling, interaction, and browsing are dynamically interrupted.
- Access stays blocked until the daily reset to break endless scrolling loops.

### 📊 Live Usage Dashboard
Track your browsing habits in real time via a minimal popup:
- Today's total platform usage.
- Dynamically calculated remaining time.
- Current active website status.
- Highlights your most distracting platform.

### ⚡ Quick Website Presets
Add popular distraction platforms instantly with optimized, pre-configured shortcuts for YouTube, Instagram, TikTok, or easily register your own custom domains.

### 🎨 Modern Interface
Built with a clean, dark-mode inspired cyber aesthetic:
- Minimalist, distraction-free dashboard.
- Responsive, pixel-perfect popup design.
- Custom-crafted geometric SVG vectors.
- Ultra-fast, lightweight interactions.

### 🔒 Privacy First
FocusFlow is engineered from the ground up with data security and privacy in mind:
- **Zero External APIs:** No cloud or third-party connections.
- **Zero Analytics:** No background data collection or behavior tracking.
- **No Accounts:** No login or personal information required.

All configuration states and usage counters are processed and securely stored 100% locally on your machine using:
```javascript
chrome.storage.sync // or chrome.storage.local
🛠️ Tech Stack
Frontend
HTML5 & CSS3

Modern Flexbox & Grid layouts

Dynamic CSS Variables (Design Tokens)

Extension Architecture
Vanilla JavaScript (ES6+)

Chrome Extension APIs (Manifest V3)

Background Service Workers

Content Scripts & UI Injectors

MutationObserver API for persistent DOM restriction

📂 Project Structure
FocusFlow/
│
├── manifest.json
├── popup.html
├── popup.css
├── popup.js
│
├── background.js
├── content.js
│
├── icons/
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
│
└── README.md
🚀 Installation (Developer Mode)
1. Clone the repository
Bash
git clone [https://github.com/eldarshiraliyev/FocusFlow.git](https://github.com/eldarshiraliyev/FocusFlow.git)
2. Open Chrome Extensions
Open Google Chrome and navigate to: chrome://extensions/

3. Enable Developer Mode
Toggle the Developer mode switch in the top-right corner.

4. Load Unpacked Extension
Click the Load unpacked button in the top-left corner and select the root FocusFlow project folder.

🧪 Development & Testing
If you want to modify or contribute to the extension:

Make your changes in the source files.

Open chrome://extensions/ and click the Reload (circular arrow) icon on the FocusFlow card.

Test your changes instantly on the target platforms.

🗺️ Roadmap
Future improvements and upcoming milestones:

[ ] Advanced usage statistics & analytical graphs

[ ] Weekly focus reports & habit change tracking

[ ] Expanded list of quick website presets

[ ] Customizable blocking dashboard screens

[ ] Cross-device encrypted sync options

[ ] Firefox Extension Ecosystem support

🤝 Contributing
Contributions make the open-source community an amazing place to learn, inspire, and create. Any contributions you make are greatly appreciated.

Feel free to:

Open issues for bug reports.

Suggest new feature ideas.

Submit Pull Requests to optimize the code or UI.

📜 License
Distributed under the MIT License. See LICENSE for more information.

⭐ Support
If FocusFlow helps you regain your deep focus and optimize your workflow, consider giving this repository a star! Your support keeps the project growing 🚀