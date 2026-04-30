# 🌱 HabitFlow

A beautiful, lightweight **desktop habit tracker** built with Electron. Track your daily habits, maintain streaks, visualize your progress, and get daily reminders — all stored locally on your computer.



---

## ✨ Features

- ✅ **Daily habit check-ins** with progress ring
- 🔥 **Streak tracking** — current & longest streaks per habit
- 📊 **Progress charts** — 30-day line chart, activity heatmap, per-habit breakdown
- 🏷️ **Categories & colors** — organize habits by type
- 🔔 **Daily reminders** — desktop notification at your chosen time
- 💾 **100% local** — data stored on your device, no account needed
- 📦 **Export data** as JSON anytime

---

## 🚀 Quick Start

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or later)
- [Git](https://git-scm.com/)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/YOUR_USERNAME/habitflow.git
cd habitflow

# 2. Install dependencies
npm install

# 3. Run the app
npm start
```

That's it! HabitFlow will open as a desktop window.

---

## 🏗️ Build for Distribution

Create a distributable installer for your platform:

```bash
# Build for your current OS
npm run build

# Build for specific platforms
npm run build:win    # Windows (.exe installer)
npm run build:mac    # macOS (.dmg)
npm run build:linux  # Linux (.AppImage)
```

Built files appear in the `dist/` folder.

---

## 📁 Project Structure

```
habitflow/
├── main.js          # Electron main process (window, notifications, data)
├── preload.js       # Secure bridge between app and system
├── package.json     # Dependencies and build config
├── src/
│   ├── index.html   # App shell
│   ├── css/
│   │   └── style.css
│   └── js/
│       ├── app.js       # Router & utilities
│       ├── db.js        # Data layer (read/write JSON)
│       ├── today.js     # Today's habits view
│       ├── habits.js    # Habit management
│       ├── stats.js     # Progress charts
│       └── settings.js  # App settings
└── assets/
    └── icons/       # App icons
```

---

## 🖱️ Windows — Launch Without PowerShell (Double-click Shortcut)

Instead of opening PowerShell every time, you can create a shortcut on your Desktop:

**Step 1** — Open Notepad and paste this:
```
@echo off
cd /d "D:\habitflow\habitflow"
npm start
```
> ⚠️ Change `D:\habitflow\habitflow` to the actual path where your habitflow folder is located.

**Step 2** — Save the file:
- Click **File → Save As**
- Change **"Save as type"** to **All Files**
- Name it: `HabitFlow.bat`
- Save to your **Desktop**

**Step 3** — Double-click `HabitFlow.bat` to launch the app anytime! 🎉

**Optional — Hide the black window:**
1. Right-click `HabitFlow.bat` → **Create shortcut**
2. Right-click the shortcut → **Properties**
3. Change **Run** dropdown to `Minimized`
4. Click **OK**

Now the app opens cleanly with no Command Prompt window showing.

---

## 🔧 Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl/Cmd + N` | Add new habit |
| `Escape` | Close modal |

---

## 🤝 Contributing

1. Fork the repo
2. Create a branch: `git checkout -b feature/your-feature`
3. Commit changes: `git commit -m 'Add some feature'`
4. Push: `git push origin feature/your-feature`
5. Open a Pull Request

---

## 📄 License

MIT License — free to use, modify, and distribute.

---

## 💡 Roadmap

- [ ] Weekly/monthly habit scheduling
- [ ] Multiple reminder times
- [ ] Import data
- [ ] Habit templates
- [ ] Dark/light theme toggle
