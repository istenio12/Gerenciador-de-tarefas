// Gerenciador de Tarefas - lógica principal

const form = document.getElementById('loanForm');
const itemInput = document.getElementById('item');
const personInput = document.getElementById('person');
const urgencyInput = document.getElementById('urgency');
const startDateInput = document.getElementById('startDate');
const endDateInput = document.getElementById('endDate');
const list = document.getElementById('loanList');
const emptyState = document.getElementById('emptyState');
const btnExportar = document.getElementById('btnExportar');

const STORAGE_KEY = 'tarefas';

const URGENCY_LABELS = {
  'sem-pressa': 'Sem pressa',
  'medio': 'Médio',
  'urgente': 'Urgente'
};

function loadTasks() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

function saveTasks(tasks) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

function formatDate(isoDate) {
  if (!isoDate) return '';
  const [y, m, d] = isoDate.split('-');
  return `${d}/${m}/${y}`;
}

function isLate(endDateIso) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const end = new Date(endDateIso + 'T00:00:00');
  return end < today;
}

function render() {
  const tasks = loadTasks();
  list.innerHTML = '';

  if (tasks.length === 0) {
    emptyState.classList.add('show');
  } else {
    emptyState.classList.remove('show');
  }

  tasks.forEach((task) => {
    const late = isLate(task.endDate);

    const li = document.createElement('li');
    li.className = 'task-card';
    li.dataset.id = task.id;

    li.innerHTML = `
      <div class="task-title-row">
        <span class="task-title">${escapeHtml(task.item)}</span>
        <span class="badge badge-urgencia ${task.urgency}">${URGENCY_LABELS[task.urgency] || ''}</span>
      </div>
      <p class="task-person">${escapeHtml(task.person)}</p>
      <p class="task-dates">Início: ${formatDate(task.startDate)} · Prazo: ${formatDate(task.endDate)}</p>
      <div class="task-actions">
        <span class="status-btn ${late ? 'status-vermelho' : 'status-verde'}">${late ? 'Atrasado' : 'No prazo'}</span>
        <button type="button" class="btn-resolver">Resolver</button>
      </div>
    `;

    li.querySelector('.btn-resolver').addEventListener('click', () => {
      resolveTask(task.id);
    });

    list.appendChild(li);
  });
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function resolveTask(id) {
  const tasks = loadTasks().filter((t) => t.id !== id);
  saveTasks(tasks);
  render();
}

form.addEventListener('submit', (e) => {
  e.preventDefault();

  if (endDateInput.value < startDateInput.value) {
    alert('O prazo não pode ser antes da data de início.');
    return;
  }

  const tasks = loadTasks();
  tasks.push({
    id: Date.now().toString(),
    item: itemInput.value.trim(),
    person: personInput.value.trim(),
    urgency: urgencyInput.value,
    startDate: startDateInput.value,
    endDate: endDateInput.value
  });
  saveTasks(tasks);
  render();
  form.reset();
  itemInput.focus();
});

btnExportar.addEventListener('click', () => {
  const tasks = loadTasks();

  if (tasks.length === 0) {
    alert('Não há tarefas para gerar relatório.');
    return;
  }

  let report = 'RELATÓRIO DE TAREFAS\n';
  report += `Gerado em: ${new Date().toLocaleString('pt-BR')}\n`;
  report += '='.repeat(40) + '\n\n';

  tasks.forEach((task, i) => {
    const late = isLate(task.endDate);
    report += `${i + 1}. ${task.item}\n`;
    report += `   Atividade: ${task.person}\n`;
    report += `   Urgência: ${URGENCY_LABELS[task.urgency] || ''}\n`;
    report += `   Início: ${formatDate(task.startDate)}\n`;
    report += `   Prazo: ${formatDate(task.endDate)}\n`;
    report += `   Status: ${late ? 'Atrasado' : 'No prazo'}\n\n`;
  });

  const blob = new Blob([report], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `relatorio-tarefas-${new Date().toISOString().slice(0, 10)}.txt`;
  a.click();
  URL.revokeObjectURL(url);
});

render();
