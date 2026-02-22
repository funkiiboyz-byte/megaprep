const token = localStorage.getItem('adminToken');
if (!token) {
  window.location.href = '/admin';
}

const headers = {
  'Content-Type': 'application/json',
  Authorization: `Bearer ${token}`
};

async function loadStats() {
  const response = await fetch('/api/admin/dashboard-stats', { headers });
  if (!response.ok) return;
  const data = await response.json();

  document.getElementById('totalStudents').innerText = data.totalStudents;
  document.getElementById('totalResults').innerText = data.totalResults;
  document.getElementById('passRate').innerText = `${data.passRate}%`;
}

const form = document.getElementById('resultForm');
form.addEventListener('submit', async (event) => {
  event.preventDefault();

  const payload = {
    studentId: document.getElementById('studentId').value,
    examId: document.getElementById('examId').value,
    batchId: document.getElementById('batchId').value,
    totalMarks: document.getElementById('totalMarks').value,
    gpa: document.getElementById('gpa').value,
    status: document.getElementById('status').value
  };

  const response = await fetch('/api/admin/results', {
    method: 'POST',
    headers,
    body: JSON.stringify(payload)
  });

  alert(response.ok ? 'Result saved successfully.' : 'Failed to save result.');
});

const uploadForm = document.getElementById('uploadForm');
uploadForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const file = document.getElementById('csvFile').files[0];
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch('/api/admin/results/upload-csv', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData
  });

  alert(response.ok ? 'CSV uploaded successfully.' : 'Upload failed.');
});

function logout() {
  localStorage.removeItem('adminToken');
  window.location.href = '/admin';
}

window.logout = logout;
loadStats();
