async function requireAuth() {
  const res = await fetch('/api/auth/me');
  if (!res.ok) {
    window.location.href = '/admin/login.html';
  }
}

function statCard(title, value) {
  return `<div class="col-md-4"><div class="card"><div class="card-body"><h3 class="h6 text-muted">${title}</h3><p class="h4 mb-0">${value}</p></div></div></div>`;
}

async function loadStats() {
  const data = await fetch('/api/admin/stats').then((r) => r.json());
  document.getElementById('stats').innerHTML =
    statCard('Total Students', data.totalStudents) +
    statCard('Pass Rate', `${data.passRate}%`) +
    statCard('Top Score', data.topScorers?.[0]?.total_marks || '-');
}

async function loadResults(roll = '') {
  const data = await fetch(`/api/admin/results${roll ? `?roll=${encodeURIComponent(roll)}` : ''}`).then((r) => r.json());
  const tbody = document.querySelector('#resultTable tbody');
  tbody.innerHTML = data.map((row) => `
    <tr>
      <td>${row.id}</td><td>${row.full_name}</td><td>${row.roll_number}</td><td>${row.batch_name}</td>
      <td>${row.exam_name}</td><td>${row.total_marks}</td><td>${row.gpa_percentage}</td><td>${row.status}</td>
      <td><button class="btn btn-sm btn-danger" onclick="deleteResult(${row.id})">Delete</button></td>
    </tr>
  `).join('');
}

async function deleteResult(id) {
  if (!confirm('Delete this result?')) return;
  const res = await fetch(`/api/admin/results/${id}`, { method: 'DELETE' });
  const data = await res.json();
  alert(data.message);
  loadResults();
}

window.deleteResult = deleteResult;

document.getElementById('addResultForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const formData = new FormData(e.target);
  const payload = Object.fromEntries(formData.entries());
  const res = await fetch('/api/admin/results', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  alert(data.message || 'Saved');
  e.target.reset();
  loadResults();
});

document.getElementById('uploadForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const fd = new FormData();
  fd.append('file', document.getElementById('resultFile').files[0]);
  const res = await fetch('/api/admin/results/upload', { method: 'POST', body: fd });
  const data = await res.json();
  alert(data.message || 'Uploaded');
  loadResults();
  loadStats();
});

document.getElementById('searchRoll').addEventListener('input', (e) => loadResults(e.target.value.trim()));

document.getElementById('logoutBtn').addEventListener('click', async () => {
  await fetch('/api/auth/logout', { method: 'POST' });
  window.location.href = '/admin/login.html';
});

(async function init() {
  await requireAuth();
  await loadStats();
  await loadResults();
})();
