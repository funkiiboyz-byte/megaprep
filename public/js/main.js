const batchEl = document.getElementById('batch');
const examEl = document.getElementById('exam');
const resultForm = document.getElementById('resultForm');
const resultSection = document.getElementById('resultSection');
const resultContent = document.getElementById('resultContent');
const loadingOverlay = document.getElementById('loadingOverlay');

function showLoading(show) {
  loadingOverlay.classList.toggle('active', show);
}

async function loadFilters() {
  try {
    const res = await fetch('/api/public/filters');
    const { batches, exams } = await res.json();
    batchEl.innerHTML = '<option value="">Select batch</option>' + batches.map((b) => `<option value="${b.id}">${b.name}</option>`).join('');
    examEl.innerHTML = '<option value="">Select exam</option>' + exams.map((e) => `<option value="${e.id}">${e.name}</option>`).join('');
  } catch {
    batchEl.innerHTML = '<option>Failed to load</option>';
    examEl.innerHTML = '<option>Failed to load</option>';
  }
}

resultForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  showLoading(true);

  const payload = {
    roll: document.getElementById('roll').value.trim(),
    batchId: batchEl.value,
    examId: examEl.value
  };

  try {
    const res = await fetch('/api/public/result', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Result not found');

    resultSection.classList.remove('d-none');
    resultContent.innerHTML = `
      <p><strong>Name:</strong> ${data.full_name}</p>
      <p><strong>Roll:</strong> ${data.roll} | <strong>Registration:</strong> ${data.registration_number}</p>
      <p><strong>Institute:</strong> ${data.institute_name}</p>
      <p><strong>Batch:</strong> ${data.batch_name} | <strong>Group:</strong> ${data.group_name}</p>
      <table class="table table-bordered">
        <tr><th>Physics</th><td>${data.physics}</td></tr>
        <tr><th>Chemistry</th><td>${data.chemistry}</td></tr>
        <tr><th>Math</th><td>${data.math}</td></tr>
        <tr><th>Biology / ICT</th><td>${data.biology_ict}</td></tr>
        <tr><th>Total Marks</th><td>${data.total_marks}</td></tr>
        <tr><th>GPA / Percentage</th><td>${data.gpa} / ${data.percentage}%</td></tr>
        <tr><th>Merit Position</th><td>${data.merit_position || 'N/A'}</td></tr>
        <tr><th>Status</th><td><span class="badge ${data.status === 'Pass' ? 'text-bg-success' : 'text-bg-danger'}">${data.status}</span></td></tr>
      </table>
      <button class="btn btn-outline-secondary" onclick="window.print()">Download / Print PDF</button>
    `;
  } catch (error) {
    resultSection.classList.remove('d-none');
    resultContent.innerHTML = `<div class="alert alert-danger">${error.message}</div>`;
  } finally {
    showLoading(false);
  }
});

loadFilters();
