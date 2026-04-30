// ── Stats / Progress Page ─────────────────────────────────────────────────
let chartInstances = {};

function renderStatsPage() {
  const page = document.getElementById('page-stats');
  const habits = DB.getHabits();
  const last30 = DB.getLast30Days();
  const today = DB.todayKey();

  // Overall stats
  const totalDone = last30.reduce((s, d) => s + d.done, 0);
  const totalPossible = last30.reduce((s, d) => s + d.total, 0);
  const overallPct = totalPossible > 0 ? Math.round((totalDone / totalPossible) * 100) : 0;
  const bestStreak = DB.getBestOverallStreak();
  const todayProg = DB.getTodayProgress();

  // Heatmap: last 91 days (13 weeks)
  let heatmapHTML = '';
  const baseDate = new Date();
  for (let i = 90; i >= 0; i--) {
    const d = new Date(baseDate);
    d.setDate(baseDate.getDate() - i);
    const key = d.toISOString().split('T')[0];
    const comps = DB.getCompletions(key);
    const total = habits.length;
    let level = 0;
    if (total > 0 && comps.length > 0) {
      const ratio = comps.length / total;
      if (ratio <= 0.25) level = 1;
      else if (ratio <= 0.5) level = 2;
      else if (ratio < 1) level = 3;
      else level = 4;
    }
    const isToday = key === today;
    heatmapHTML += `<div class="hm-cell" data-level="${level}" title="${key}: ${comps.length}/${total} completed"
      style="${isToday ? 'outline: 1px solid var(--accent); outline-offset: 1px;' : ''}"></div>`;
  }

  page.innerHTML = `
    <div class="page-header">
      <h1>Progress</h1>
      <p>Your habit journey at a glance.</p>
    </div>

    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-value">${todayProg.done}<span style="font-size:16px;color:var(--text2)">/${todayProg.total}</span></div>
        <div class="stat-label">Today</div>
        <div class="stat-sub">${todayProg.pct}% complete</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${bestStreak}<span style="font-size:16px;color:var(--text2)">d</span></div>
        <div class="stat-label">Best Streak</div>
        <div class="stat-sub">days in a row</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${overallPct}<span style="font-size:16px;color:var(--text2)">%</span></div>
        <div class="stat-label">30-Day Rate</div>
        <div class="stat-sub">${totalDone} / ${totalPossible} completed</div>
      </div>
    </div>

    <div class="chart-card">
      <h3>Activity Heatmap — Last 13 Weeks</h3>
      <div style="display:flex;gap:4px;margin-bottom:8px;font-size:11px;color:var(--text3);align-items:center;">
        <div class="hm-cell" data-level="0" style="width:13px;height:13px;border-radius:3px;background:var(--bg4);flex-shrink:0;"></div> None
        <div class="hm-cell" data-level="1" style="width:13px;height:13px;border-radius:3px;flex-shrink:0;"></div> Some
        <div class="hm-cell" data-level="4" style="width:13px;height:13px;border-radius:3px;flex-shrink:0;"></div> All
      </div>
      <div class="heatmap">${heatmapHTML}</div>
    </div>

    <div class="chart-card">
      <h3>Daily Completion — Last 30 Days</h3>
      <canvas id="lineChart" height="120"></canvas>
    </div>

    ${habits.length > 0 ? `
    <div class="chart-card">
      <h3>Habit Breakdown</h3>
      <canvas id="barChart" height="150"></canvas>
    </div>` : ''}
  `;

  // Destroy old charts
  Object.values(chartInstances).forEach(c => c.destroy());
  chartInstances = {};

  const chartDefaults = {
    color: '#9090a8',
    font: { family: "'DM Sans', sans-serif", size: 12 },
  };

  // Line chart — daily %
  const lineCtx = document.getElementById('lineChart');
  if (lineCtx) {
    chartInstances.line = new Chart(lineCtx, {
      type: 'line',
      data: {
        labels: last30.map(d => {
          const [,m,day] = d.date.split('-');
          return `${m}/${day}`;
        }),
        datasets: [{
          data: last30.map(d => d.pct),
          borderColor: '#7c6af7',
          backgroundColor: 'rgba(124,106,247,0.1)',
          borderWidth: 2,
          pointRadius: 3,
          pointBackgroundColor: '#7c6af7',
          fill: true,
          tension: 0.4,
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false }, tooltip: { mode: 'index', intersect: false } },
        scales: {
          x: { ticks: { ...chartDefaults, maxTicksLimit: 10 }, grid: { color: 'rgba(255,255,255,0.04)' } },
          y: { min: 0, max: 100, ticks: { ...chartDefaults, callback: v => v + '%' }, grid: { color: 'rgba(255,255,255,0.04)' } },
        },
      }
    });
  }

  // Bar chart — per habit completion rate
  if (habits.length > 0) {
    const barCtx = document.getElementById('barChart');
    if (barCtx) {
      const habitStats = habits.map(h => {
        const days = Object.keys(DB.get().completions).filter(key => {
          return (DB.getCompletions(key)).includes(h.id);
        });
        return { name: h.name, days: days.length, color: h.color || '#7c6af7' };
      });

      chartInstances.bar = new Chart(barCtx, {
        type: 'bar',
        data: {
          labels: habitStats.map(h => h.name.length > 16 ? h.name.slice(0,14) + '…' : h.name),
          datasets: [{
            data: habitStats.map(h => h.days),
            backgroundColor: habitStats.map(h => h.color + 'cc'),
            borderColor: habitStats.map(h => h.color),
            borderWidth: 1,
            borderRadius: 6,
          }]
        },
        options: {
          responsive: true,
          plugins: { legend: { display: false } },
          scales: {
            x: { ticks: { ...chartDefaults }, grid: { display: false } },
            y: { ticks: { ...chartDefaults }, grid: { color: 'rgba(255,255,255,0.04)' } },
          },
        }
      });
    }
  }
}
