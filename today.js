// ── Today Page ────────────────────────────────────────────────────────────
const COLORS = ['#7c6af7','#34d399','#f87171','#fbbf24','#60a5fa','#f472b6','#a3e635','#fb923c'];
const CATEGORIES = ['Health', 'Fitness', 'Learning', 'Mindfulness', 'Work', 'Social', 'Finance', 'Other'];

function formatDate(d) {
  return d.toLocaleDateString('en-US', { weekday:'long', year:'numeric', month:'long', day:'numeric' });
}

function renderTodayPage() {
  const page = document.getElementById('page-today');
  const data = DB.get();
  const { done, total, pct } = DB.getTodayProgress();
  const today = new Date();
  const circumference = 283;
  const offset = circumference - (pct / 100) * circumference;

  // Build week strip
  const weekDays = ['S','M','T','W','T','F','S'];
  let weekHTML = '<div class="week-grid">';
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = d.toISOString().split('T')[0];
    const isToday = i === 0;
    const comps = DB.getCompletions(key);
    const dayTotal = data.habits.length;
    let cls = '';
    if (comps.length === 0) cls = '';
    else if (comps.length >= dayTotal && dayTotal > 0) cls = 'done';
    else cls = 'partial';
    if (isToday) cls += ' today';
    weekHTML += `<div class="week-day">
      <div class="week-day-label">${weekDays[d.getDay()]}</div>
      <div class="week-dot ${cls}">${isToday ? '·' : ''}</div>
    </div>`;
  }
  weekHTML += '</div>';

  let greetingMsg = done === total && total > 0
    ? "All done for today! Amazing work 🎉"
    : `${done} of ${total} completed`;

  page.innerHTML = `
    <div class="page-header">
      <h1>Today</h1>
      <p class="today-date">${formatDate(today)}</p>
    </div>

    <div class="today-hero">
      <div class="ring-wrap">
        <svg width="100" height="100" viewBox="0 0 100 100">
          <circle class="ring-bg" cx="50" cy="50" r="45"/>
          <circle class="ring-fill" cx="50" cy="50" r="45"
            style="stroke-dashoffset: ${offset}; stroke: ${pct === 100 ? 'var(--green)' : 'var(--accent)'}"/>
        </svg>
        <div class="ring-text">
          <span class="ring-pct">${pct}%</span>
          <span class="ring-label">done</span>
        </div>
      </div>
      <div class="today-info">
        <h2>${greetingMsg}</h2>
        <p>${total === 0 ? 'Add your first habit to get started.' : `Keep going — every habit counts!`}</p>
        <div style="margin-top: 16px;">${weekHTML}</div>
      </div>
    </div>

    <div class="section-header">
      <span class="section-title">My Habits</span>
    </div>

    <div class="habit-list" id="todayHabitList"></div>
  `;

  renderTodayHabits();
  updateGlobalStreak();
}

function renderTodayHabits() {
  const list = document.getElementById('todayHabitList');
  if (!list) return;
  const habits = DB.getHabits();
  const today = DB.todayKey();

  if (habits.length === 0) {
    list.innerHTML = `<div class="empty">
      <div class="empty-icon">🌱</div>
      <h3>No habits yet</h3>
      <p>Go to "My Habits" to create your first habit and start building your routine.</p>
      <button class="btn btn-primary" onclick="navigate('habits')">Create a Habit</button>
    </div>`;
    return;
  }

  // Sort: incomplete first
  const sorted = [...habits].sort((a, b) => {
    const aDone = DB.isCompleted(a.id, today);
    const bDone = DB.isCompleted(b.id, today);
    return aDone - bDone;
  });

  list.innerHTML = sorted.map(habit => {
    const done = DB.isCompleted(habit.id, today);
    const streak = DB.getStreak(habit.id);
    return `
      <div class="habit-card ${done ? 'done' : ''}" style="--color: ${habit.color || 'var(--accent)'}"
           onclick="toggleHabit('${habit.id}')">
        <div class="habit-check">${done ? '✓' : ''}</div>
        <div class="habit-info">
          <div class="habit-name">${escapeHtml(habit.name)}</div>
          <div class="habit-meta">
            <span class="cat-tag">${escapeHtml(habit.category || 'Other')}</span>
            ${habit.description ? ` · ${escapeHtml(habit.description)}` : ''}
          </div>
        </div>
        ${streak > 0 ? `<div class="habit-streak">🔥 ${streak}</div>` : ''}
      </div>
    `;
  }).join('');
}

async function toggleHabit(id) {
  const justCompleted = await DB.toggleCompletion(id);
  const habit = DB.getHabits().find(h => h.id === id);
  if (justCompleted && habit) {
    const streak = DB.getStreak(id);
    showToast(`✅ "${habit.name}" done! ${streak > 1 ? `🔥 ${streak} day streak!` : ''}`);
    window.habitAPI.notify('HabitFlow', `"${habit.name}" completed! ${streak > 1 ? `${streak} day streak 🔥` : '🎉 Great job!'}`);
  }
  renderTodayPage();
}

function updateGlobalStreak() {
  const streak = DB.getBestOverallStreak();
  document.getElementById('bestStreakLabel').textContent = `${streak} day streak`;
}
