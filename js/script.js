console.log("Script carregado com sucesso!");

document.getElementById('btnExportar').addEventListener('click', () => {
  const dados = localStorage.getItem('loans');
  if (!dados) {
    alert('Nenhum dado encontrado com a chave "loans".');
    return;
  }

  let lista = JSON.parse(dados);

  // Monta a tabela HTML
  let tabelaHTML = '<table border="1"><tr><th>Nome</th><th>Tarefa</th><th>Inicio</th><th>Prazo</th><th>Status</th></tr>';
  
lista.forEach(obj => {
    const hoje = new Date();
    const inicio = new Date(obj.startDate);
    const prazo = new Date(obj.endDate);
    let status = '';

    if(inicio) {
      status = 'Nao iniciado';
    }else if (hoje <= prazo){
      status = 'Em andamento';
    }else{
      status = 'Atrasado';
    }
        tabelaHTML += `<tr>
      <td>${obj.person || ''}</td>
      <td>${obj.item || ''}</td>
      <td>${obj.startDate || ''}</td>
      <td>${obj.endDate || ''}</td>
      <td>${status}</td>
    </tr>`;
  });

  tabelaHTML += '</table>';

  // Cria o arquivo Excel
  const blob = new Blob([tabelaHTML], { type: 'application/vnd.ms-excel' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `relatorio_loans_${new Date().toISOString().split('T')[0]}.xls`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
});

document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById('loanForm');
  const loanList = document.getElementById('loanList');

  
function loadLoans() {
  const loans = JSON.parse(localStorage.getItem('loans')) || [];
  loanList.innerHTML = '';
  loans.forEach((loan, index) => {
    const hoje = new Date();
    const inicio = new Date(loan.startDate);
    const prazo = new Date(loan.endDate);

    let statusTexto = '';
    let statusClasse = '';

    if (hoje < inicio) {
      statusTexto = 'Nao iniciado';
      statusClasse = 'status-verde';
    } else if (hoje <= prazo) {
      statusTexto = 'Em andamento';
      statusClasse = 'status-verde';
    } else {
      statusTexto = 'Atrasado';
      statusClasse = 'status-vermelho';
    }
    
    const li = document.createElement('li');

      li.innerHTML = `
        
<strong>${loan.item}</strong> para <em>${loan.person}</em>
      (Início: ${loan.startDate}, Prazo: ${loan.endDate})
      <span class="status-btn
      ${statusClasse}">${statusTexto}</span>
    `;

    const button = document.createElement("button");
    button.textContent = "Resolver";
    button.addEventListener("click", () => returnItem(index));

li.appendChild(button)
   
      loanList.appendChild(li);
    });
  }

  function saveLoan(item, person, startDate, endDate) {
    const loans = JSON.parse(localStorage.getItem('loans')) || [];
    loans.push({ item, person, startDate, endDate });
    localStorage.setItem('loans', JSON.stringify(loans));
    console.log("salvando:", item, person, startDate, endDate);
    loadLoans();
  }

  function returnItem(index) {
    const loans = JSON.parse(localStorage.getItem('loans')) || [];
    loans.splice(index, 1);
    localStorage.setItem('loans', JSON.stringify(loans));
    loadLoans();
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    console.log("formulario enviado!");
    const item = document.getElementById('item').value;
    const person = document.getElementById('person').value;
    const startDateDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    saveLoan(item, person, startDateDate, endDate);
    form.reset();
  });

  loadLoans();
});
