// ── Database Layer ─────────────────────────────────────────────────────────
// All data lives in Electron's userData folder as JSON.
// Access via window.habitAPI (preload bridge).

const DB = {
  _cache: null,

  async load() {
    this._cache = await window.habitAPI.readDB();
    if (!this._cache.habits) this._cache.habits = [];
    if (!this._cache.completions) this._cache.completions = {};
    if (!this._cache.settings) this._cache.settings = { reminderTime: '08:00', reminderEnabled: true };
    return this._cache;
  },

  get() { return this._cache; },

  async save() {
    await window.habitAPI.writeDB(this._cache);
  },

  // ── Habits ──────────────────────────────────────────────────────────────
  getHabits() { return this._cache.habits || []; },

  async addHabit(habit) {
    habit.id = 'h_' + Date.now();
    habit.createdAt = new Date().toISOString();
    this._cache.habits.push(habit);
    await this.save();
    return habit;
  },

  async updateHabit(id, updates) {
    const idx = this._cache.habits.findIndex(h => h.id === id);
    if (idx >= 0) {
      this._cache.habits[idx] = { ...this._cache.habits[idx], ...updates };
      await this.save();
    }
  },

  async deleteHabit(id) {
    this._cache.habits = this._cache.habits.filter(h => h.id !== id);
    // Remove completions for deleted habit
    for (const date in this._cache.completions) {
      this._cache.completions[date] = this._cache.completions[date].filter(hid => hid !== id);
    }
    await this.save();
  },

  // ── Completions ──────────────────────────────────────────────────────────
  todayKey() { return new Date().toISOString().split('T')[0]; },

  getCompletions(dateKey) {
    return this._cache.completions[dateKey] || [];
  },

  isCompleted(habitId, dateKey) {
    return (this._cache.completions[dateKey || this.todayKey()] || []).includes(habitId);
  },

  async toggleCompletion(habitId) {
    const key = this.todayKey();
    if (!this._cache.completions[key]) this._cache.completions[key] = [];
    const list = this._cache.completions[key];
    const idx = list.indexOf(habitId);
    if (idx >= 0) {
      list.splice(idx, 1);
    } else {
      list.push(habitId);
    }
    await this.save();
    return idx < 0; // true = just completed
  },

  // ── Streak calculation ───────────────────────────────────────────────────
  getStreak(habitId) {
    let streak = 0;
    const today = new Date();
    for (let i = 0; i < 365; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const key = d.toISOString().split('T')[0];
      if ((this._cache.completions[key] || []).includes(habitId)) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  },

  getLongestStreak(habitId) {
    let longest = 0; let current = 0;
    const dates = Object.keys(this._cache.completions).sort();
    for (const date of dates) {
      if ((this._cache.completions[date] || []).includes(habitId)) {
        current++;
        longest = Math.max(longest, current);
      } else {
        current = 0;
      }
    }
    return longest;
  },

  getBestOverallStreak() {
    let longest = 0; let current = 0;
    const today = new Date();
    for (let i = 364; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const key = d.toISOString().split('T')[0];
      const completions = this._cache.completions[key] || [];
      const habits = this._cache.habits || [];
      if (habits.length > 0 && completions.length > 0) {
        current++;
        longest = Math.max(longest, current);
      } else {
        current = 0;
      }
    }
    return longest;
  },

  // ── Stats helpers ────────────────────────────────────────────────────────
  getLast30Days() {
    const result = [];
    const today = new Date();
    for (let i = 29; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const key = d.toISOString().split('T')[0];
      const done = (this._cache.completions[key] || []).length;
      const total = this._cache.habits.length;
      result.push({ date: key, done, total, pct: total > 0 ? Math.round((done / total) * 100) : 0 });
    }
    return result;
  },

  getTodayProgress() {
    const key = this.todayKey();
    const done = (this._cache.completions[key] || []).length;
    const total = this._cache.habits.length;
    return { done, total, pct: total > 0 ? Math.round((done / total) * 100) : 0 };
  },

  getSettings() { return this._cache.settings; },

  async saveSettings(settings) {
    this._cache.settings = { ...this._cache.settings, ...settings };
    await this.save();
  },
};
