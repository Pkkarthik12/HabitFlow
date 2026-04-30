const { app, BrowserWindow, ipcMain, Notification, shell } = require('electron');
const path = require('path');
const fs = require('fs');

// ─── Data Storage (plain JSON, no extra deps needed) ───────────────────────
const userDataPath = app.getPath('userData');
const dbPath = path.join(userDataPath, 'habitflow-data.json');

function readDB() {
  try {
    if (fs.existsSync(dbPath)) {
      return JSON.parse(fs.readFileSync(dbPath, 'utf8'));
    }
  } catch (e) { console.error('DB read error:', e); }
  return { habits: [], completions: {}, settings: { reminderTime: '08:00', reminderEnabled: true, theme: 'dark' } };
}

function writeDB(data) {
  try {
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf8');
  } catch (e) { console.error('DB write error:', e); }
}

// ─── Window ─────────────────────────────────────────────────────────────────
let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    titleBarStyle: process.platform === 'darwin' ? 'hiddenInset' : 'default',
    frame: process.platform !== 'darwin',
    backgroundColor: '#0f0f13',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    icon: path.join(__dirname, 'assets', 'icons', 'icon.png'),
  });

  mainWindow.loadFile(path.join(__dirname, 'src', 'index.html'));

  if (process.argv.includes('--dev')) {
    mainWindow.webContents.openDevTools();
  }
}

// ─── IPC Handlers ────────────────────────────────────────────────────────────
ipcMain.handle('db:read', () => readDB());

ipcMain.handle('db:write', (_, data) => {
  writeDB(data);
  return true;
});

ipcMain.handle('notify', (_, { title, body }) => {
  if (Notification.isSupported()) {
    new Notification({ title, body, silent: false }).show();
  }
});

ipcMain.handle('open-external', (_, url) => shell.openExternal(url));

// ─── Daily Reminder Scheduler ────────────────────────────────────────────────
function scheduleReminder() {
  const db = readDB();
  if (!db.settings.reminderEnabled) return;

  const [hours, minutes] = (db.settings.reminderTime || '08:00').split(':').map(Number);
  const now = new Date();
  const target = new Date();
  target.setHours(hours, minutes, 0, 0);

  if (target <= now) target.setDate(target.getDate() + 1); // tomorrow

  const msUntil = target - now;

  setTimeout(() => {
    const data = readDB();
    const today = new Date().toISOString().split('T')[0];
    const incomplete = (data.habits || []).filter(h => {
      return !(data.completions[today] || []).includes(h.id);
    });

    if (incomplete.length > 0) {
      new Notification({
        title: '🌱 HabitFlow Reminder',
        body: `You have ${incomplete.length} habit${incomplete.length > 1 ? 's' : ''} left today. Keep your streak alive!`,
      }).show();
    }

    scheduleReminder(); // reschedule for next day
  }, msUntil);
}

// ─── App Lifecycle ────────────────────────────────────────────────────────────
app.whenReady().then(() => {
  createWindow();
  scheduleReminder();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
