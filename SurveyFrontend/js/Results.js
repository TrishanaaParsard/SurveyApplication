/* 
   js/results.js  —  Survey Results page logic
   Fetches all submissions from the API and renders them in a table
*/

const API_BASE = 'https://localhost:7091/api/Survey';
const tableBody = document.getElementById('tableBody');
const statsBar = document.getElementById('statsBar');

let allSubmissions = [];   // cache for client-side filtering

// 1. LOAD ALL SUBMISSIONS  —  GET /api/survey/submissions
fetch(`${API_BASE}/submissions`)
    .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
    })
    .then(submissions => {
        allSubmissions = submissions;
        renderTable(submissions);

        // Update stats
        document.getElementById('totalCount').textContent =
            submissions.length;
        document.getElementById('lastDate').textContent =
            submissions.length ? submissions[0].submittedAt : '—';
        statsBar.style.display = 'flex';
    })
    .catch(err => {
        tableBody.innerHTML = `
      <tr><td colspan="5">
        <div class="state-msg">
          <span class="state-icon">⚠️</span>
          Could not load submissions. Is the API running?<br>
          <small style="color:#e63946">${err.message}</small>
        </div>
      </td></tr>`;
        console.error('loadSubmissions error:', err);
    });

// 2. RENDER TABLE ROWS
function renderTable(submissions) {
    if (!submissions.length) {
        tableBody.innerHTML = `
      <tr><td colspan="5">
        <div class="state-msg">
          <span class="state-icon">📭</span>
          No submissions yet. Complete the survey to see results here.
        </div>
      </td></tr>`;
        return;
    }

    tableBody.innerHTML = submissions.map((s, i) => {
        const answersHtml = s.answers.map(a => `
      <div class="answer-row">
        <span class="answer-q">${escHtml(a.question)}</span>
        <span class="answer-a">${escHtml(a.answer)}</span>
      </div>`).join('');

        return `
      <tr data-email="${escAttr(s.email)}" data-idnumber="${escAttr(s.idNumber)}">
        <td>${submissions.length - i}</td>
        <td>${escHtml(s.submittedAt)}</td>
        <td>
          ${escHtml(s.email)}
          <div class="id-badge">${escHtml(s.id)}</div>
        </td>
        <td>${escHtml(s.idNumber)}</td>
        <td>
          <button class="toggle-btn" onclick="toggleAnswers(this)">
            Show ${s.answers.length} answers ▾
          </button>
          <div class="answers-panel">${answersHtml}</div>
        </td>
      </tr>`;
    }).join('');
}

// 3. TOGGLE ANSWER PANEL
function toggleAnswers(btn) {
    const panel = btn.nextElementSibling;
    const isOpen = panel.classList.toggle('open');
    btn.textContent = isOpen
        ? btn.textContent.replace('Show', 'Hide').replace('▾', '▴')
        : btn.textContent.replace('Hide', 'Show').replace('▴', '▾');
}

// 4. CLIENT-SIDE FILTER
function filterTable() {
    const q = document.getElementById('searchInput').value.trim().toLowerCase();
    const filtered = q
        ? allSubmissions.filter(s =>
            s.email.toLowerCase().includes(q) ||
            s.idNumber.toLowerCase().includes(q))
        : allSubmissions;
    renderTable(filtered);
}

// UTILS
function escHtml(s = '') {
    return String(s)
        .replace(/&/g, '&amp;').replace(/</g, '&lt;')
        .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
function escAttr(s = '') {
    return String(s).replace(/"/g, '&quot;');
}