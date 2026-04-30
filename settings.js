// ── Settings Page ─────────────────────────────────────────────────────────
function renderSettingsPage() {
  const page = document.getElementById('page-settings');
  const settings = DB.getSettings();

  page.innerHTML = `
    <div class="page-header">
      <h1>Settings</h1>
      <p>Customize your HabitFlow experience.</p>
    </div>

    <div class="settings-section">
      <h3>Daily Reminders</h3>

      <div class="setting-row">
        <div class="setting-info">
          <h4>Enable Reminders</h4>
          <p>Get a daily notification to check in on your habits</p>
        </div>
        <button class="toggle ${settings.reminderEnabled ? 'on' : ''}" id="toggleReminder"
                onclick="toggleSetting('reminderEnabled')"></button>
      </div>

      <div class="setting-row">
        <div class="setting-info">
          <h4>Reminder Time</h4>
          <p>When to send your daily check-in notification</p>
        </div>
        <input type="time" class="form-input" id="reminderTime"
               value="${settings.reminderTime || '08:00'}"
               style="width:130px;"
               onchange="saveSetting('reminderTime', this.value)" />
      </div>
    </div>

    <div class="settings-section">
      <h3>Data</h3>

      <div class="setting-row">
        <div class="setting-info">
          <h4>Export Data</h4>
          <p>Download all your habit data as JSON</p>
        </div>
        <button class="btn btn-ghost" onclick="exportData()">Export JSON</button>
      </div>

      <div class="setting-row">
        <div class="setting-info">
          <h4>Danger Zone</h4>
          <p>Permanently delete all habits and history</p>
        </div>
        <button class="btn btn-danger" onclick="clearAllData()">Clear All Data</button>
      </div>
    </div>

    <div class="settings-section">
      <h3>About</h3>
      <div class="setting-row">
        <div class="setting-info">
          <h4>HabitFlow</h4>
          <p>Version 1.0.0 · Built with Electron · Open Source</p>
        </div>
        <button class="btn btn-ghost" onclick="window.habitAPI.openExternal('https://github.com')">GitHub ↗</button>
      </div>
    </div>
  `;
}

async function toggleSetting(key) {
  const settings = DB.getSettings();
  settings[key] = !settings[key];
  await DB.saveSettings(settings);
  const btn = document.getElementById('toggleReminder');
  if (btn) btn.classList.toggle('on', settings[key]);
  showToast(`Reminders ${settings[key] ? 'enabled' : 'disabled'}`);
}

async function saveSetting(key, value) {
  const settings = DB.getSettings();
  settings[key] = value;
  await DB.saveSettings(settings);
  showToast('✅ Settings saved');
}

function exportData() {
  const data = DB.get();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'habitflow-export.json';
  a.click(); URL.revokeObjectURL(url);
  showToast('📦 Data exported!');
}

async function clearAllData() {
  if (!confirm('⚠️ This will permanently delete ALL habits and history. Are you sure?')) return;
  if (!confirm('This cannot be undone. Confirm again to proceed.')) return;
  await window.habitAPI.writeDB({ habits: [], completions: {}, settings: DB.getSettings() });
  await DB.load();
  showToast('🗑 All data cleared');
  renderTodayPage();
  renderHabitsPage();
  renderStatsPage();
}
