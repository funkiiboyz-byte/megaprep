const form = document.getElementById('resultForm');
const batchSelect = document.getElementById('batch');
const examSelect = document.getElementById('exam');
const loading = document.getElementById('loading');
const resultCard = document.getElementById('resultCard');
const printArea = document.getElementById('printArea');

async function loadOptions() {
  const [batches, exams] = await Promise.all([
    fetch('/api/batches').then((res) => res.json()),
    fetch('/api/exams').then((res) => res.json())
  ]);

  batchSelect.innerHTML = '<option value="">Select batch</option>' + batches.map((b) => `<option value="${b.id}">${b.name}</option>`).join('');
  examSelect.innerHTML = '<option value="">Select exam</option>' + exams.map((e) => `<option value="${e.id}">${e.exam_name}</option>`).join('');
}

function renderResult(data) {
  printArea.innerHTML = `
    <h3 class="h5">Result Sheet - ${data.exam_name} (${data.session_name})</h3>
    <p><strong>Name:</strong> ${data.full_name}</p>
    <p><strong>Roll:</strong> ${data.roll_number} | <strong>Registration:</strong> ${data.registration_number}</p>
    <p><strong>Batch:</strong> ${data.batch_name} | <strong>Group:</strong> ${data.student_group}</p>
    <p><strong>Institute:</strong> ${data.institute_name}</p>
    <table class="table table-bordered result-table">
      <thead><tr><th>Subject</th><th>Marks</th></tr></thead>
      <tbody>
        <tr><td>Physics</td><td>${data.physics}</td></tr>
        <tr><td>Chemistry</td><td>${data.chemistry}</td></tr>
        <tr><td>Math</td><td>${data.math}</td></tr>
        <tr><td>Biology / ICT</td><td>${data.biology_ict ?? '-'}</td></tr>
      </tbody>
    </table>
    <p><strong>Total:</strong> ${data.total_marks} | <strong>GPA/Percentage:</strong> ${data.gpa_percentage}</p>
    <p><strong>Grade:</strong> ${data.grade} | <strong>Merit:</strong> ${data.merit_position ?? 'N/A'}</p>
    <p><strong>Status:</strong> <span class="badge ${data.status === 'Pass' ? 'text-bg-success' : 'text-bg-danger'}">${data.status}</span></p>
  `;
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  loading.classList.remove('d-none');
  resultCard.classList.add('d-none');
  try {
    const payload = {
      roll: document.getElementById('roll').value.trim(),
      batchId: batchSelect.value,
      examId: examSelect.value
    };

    const response = await fetch('/api/result/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || 'Result not found');

    renderResult(data);
    resultCard.classList.remove('d-none');
  } catch (error) {
    alert(error.message);
  } finally {
    loading.classList.add('d-none');
  }
});

document.getElementById('downloadPdf').addEventListener('click', async () => {
  const canvas = await html2canvas(printArea);
  const imgData = canvas.toDataURL('image/png');
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF('p', 'mm', 'a4');
  const pageWidth = 210;
  const height = (canvas.height * pageWidth) / canvas.width;
  pdf.addImage(imgData, 'PNG', 0, 0, pageWidth, height);
  pdf.save('megaprep-result.pdf');
});

loadOptions();
