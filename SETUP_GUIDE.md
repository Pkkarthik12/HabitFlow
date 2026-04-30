# 🛠️ Complete Setup Guide (Beginner-Friendly)

This guide walks you through running HabitFlow and pushing it to GitHub — step by step.

---

## Step 1 — Install Required Tools

### Install Node.js
1. Go to https://nodejs.org/
2. Download the **LTS** version (green button)
3. Run the installer, click Next through everything
4. To verify: open Terminal (Mac) or Command Prompt (Windows) and type:
   ```
   node --version
   ```
   You should see something like `v20.11.0`

### Install Git
1. Go to https://git-scm.com/downloads
2. Download and install for your OS
3. To verify:
   ```
   git --version
   ```

---

## Step 2 — Run the App Locally

Open Terminal / Command Prompt in the `habitflow` folder:

```bash
# Install all packages (only need to do this once)
npm install

# Start the app
npm start
```

A desktop window will open — that's HabitFlow! 🎉

---

## Step 3 — Push to GitHub

### Create a GitHub Account
If you don't have one: https://github.com/signup (it's free)

### Create a New Repository
1. Go to https://github.com/new
2. Repository name: `habitflow`
3. Description: `A beautiful desktop habit tracker built with Electron`
4. Set to **Public** (so others can download it)
5. Do NOT check "Initialize with README" (we already have one)
6. Click **Create repository**

### Push Your Code
In Terminal, inside the `habitflow` folder, run these commands one by one:

```bash
git init
git add .
git commit -m "Initial commit: HabitFlow desktop habit tracker"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/habitflow.git
git push -u origin main
```

Replace `YOUR_USERNAME` with your actual GitHub username!

### Done! 🎉
Your app is now on GitHub. Share the link with anyone and they can:
1. Clone it
2. Run `npm install`
3. Run `npm start`

---

## Step 4 — Build an Installer (Optional)

Want to share a `.exe` or `.dmg` file people can just double-click?

```bash
npm install --save-dev electron-builder
npm run build
```

Find the installer in the `dist/` folder.

---

## Updating Your Code on GitHub

After making changes, run:

```bash
git add .
git commit -m "Describe what you changed"
git push
```

---

## Common Issues

**"npm: command not found"** → Node.js isn't installed, go back to Step 1

**"electron: command not found"** → Run `npm install` first

**App opens but looks blank** → Open DevTools with `Ctrl+Shift+I` and check the Console tab for errors

**Notification doesn't appear** → Check your OS notification settings allow the app
