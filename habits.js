// ── Habits Management Page ────────────────────────────────────────────────
function renderHabitsPage() {
  const page = document.getElementById('page-habits');
  const habits = DB.getHabits();

  page.innerHTML = `
    <div class="page-header">
      <h1>My Habits</h1>
      <p>Manage your daily habits and routines.</p>
    </div>
    <div class="section-header">
      <span class="section-title">${habits.length} habit${habits.length !== 1 ? 's' : ''}</span>
      <button class="btn btn-primary" onclick="openAddHabit()">+ Add Habit</button>
    </div>
    <div class="habits-grid" id="habitsGrid"></div>
  `;

  renderHabitsGrid();
}

function renderHabitsGrid() {
  const grid = document.getElementById('habitsGrid');
  if (!grid) return;
  const habits = DB.getHabits();

  if (habits.length === 0) {
    grid.innerHTML = `<div class="empty">
      <div class="empty-icon">✨</div>
      <h3>Build your first habit</h3>
      <p>Start small — even 5 minutes a day compounds over time.</p>
      <button class="btn btn-primary" onclick="openAddHabit()">+ Add Habit</button>
    </div>`;
    return;
  }

  grid.innerHTML = habits.map(h => {
    const streak = DB.getStreak(h.id);
    const longest = DB.getLongestStreak(h.id);
    return `
      <div class="manage-habit-card" style="--color: ${h.color || 'var(--accent)'}">
        <div class="habit-info">
          <div class="habit-name">${escapeHtml(h.name)}</div>
          <div class="habit-meta" style="margin-top:4px;">
            <span class="cat-tag">${escapeHtml(h.category || 'Other')}</span>
            &nbsp;·&nbsp; 🔥 ${streak} current &nbsp;·&nbsp; ⭐ ${longest} best
            ${h.description ? `<br><span style="color:var(--text2);font-size:12px;margin-top:2px;">${escapeHtml(h.description)}</span>` : ''}
          </div>
        </div>
        <div class="manage-habit-actions">
          <button class="btn-icon" onclick="openEditHabit('${h.id}')" title="Edit">✏</button>
          <button class="btn-icon del" onclick="deleteHabit('${h.id}')" title="Delete">✕</button>
        </div>
      </div>
    `;
  }).join('');
}

// ── Add / Edit Modal ─────────────────────────────────────────────────────
function openAddHabit() {
  showHabitModal(null);
}

function openEditHabit(id) {
  const habit = DB.getHabits().find(h => h.id === id);
  if (habit) showHabitModal(habit);
}

function showHabitModal(habit) {
  const isEdit = !!habit;
  const colorSwatches = COLORS.map(c => `
    <div class="color-swatch ${habit?.color === c || (!habit && c === COLORS[0]) ? 'selected' : ''}"
         style="background:${c}" onclick="selectColor('${c}')" data-color="${c}"></div>
  `).join('');

  const catOptions = CATEGORIES.map(c =>
    `<option value="${c}" ${(habit?.category || 'Health') === c ? 'selected' : ''}>${c}</option>`
  ).join('');

  document.getElementById('modalContent').innerHTML = `
    <h2>${isEdit ? 'Edit Habit' : 'New Habit'}</h2>
    <div class="form-group">
      <label class="form-label">Habit Name *</label>
      <input class="form-input" id="hName" placeholder="e.g. Morning meditation" maxlength="60"
             value="${escapeHtml(habit?.name || '')}" />
    </div>
    <div class="form-group">
      <label class="form-label">Description</label>
      <textarea class="form-textarea" id="hDesc" placeholder="Optional note...">${escapeHtml(habit?.description || '')}</textarea>
    </div>
    <div class="form-group">
      <label class="form-label">Category</label>
      <select class="form-select" id="hCat">${catOptions}</select>
    </div>
    <div class="form-group">
      <label class="form-label">Color</label>
      <div class="color-row" id="colorRow">${colorSwatches}</div>
      <input type="hidden" id="hColor" value="${habit?.color || COLORS[0]}" />
    </div>
    <div class="form-actions">
      <button class="btn btn-ghost" onclick="closeModal()">Cancel</button>
      <button class="btn btn-primary" onclick="saveHabit('${habit?.id || ''}')">
        ${isEdit ? 'Save Changes' : 'Create Habit'}
      </button>
    </div>
  `;
  openModal();
}

function selectColor(color) {
  document.querySelectorAll('.color-swatch').forEach(s => s.classList.toggle('selected', s.dataset.color === color));
  document.getElementById('hColor').value = color;
}

async function saveHabit(editId) {
  const name = document.getElementById('hName').value.trim();
  if (!name) { document.getElementById('hName').focus(); return; }

  const data = {
    name,
    description: document.getElementById('hDesc').value.trim(),
    category: document.getElementById('hCat').value,
    color: document.getElementById('hColor').value,
  };

  if (editId) {
    await DB.updateHabit(editId, data);
    showToast('✅ Habit updated!');
  } else {
    await DB.addHabit(data);
    showToast('🌱 New habit created!');
  }

  closeModal();
  renderHabitsPage();
  renderTodayPage();
}

async function deleteHabit(id) {
  const habit = DB.getHabits().find(h => h.id === id);
  if (!confirm(`Delete "${habit?.name}"? This will also remove all its completion history.`)) return;
  await DB.deleteHabit(id);
  showToast('🗑 Habit deleted');
  renderHabitsPage();
  renderTodayPage();
  renderStatsPage();
}
