console.log("Script carregado com sucesso!");
//botão para gerar relatorio
document.getElementById('btnExportar').addEventListener('click', () => {
  const ativos = JSON.parse(localStorage.getItem('loans')) || [];
  const historico = JSON.parse(localStorage.getItem('historico')) || [];

if (ativos.length === 0 && historico.length === 0) {
    alert('Nenhum dado encontrado.');
    return;
  }

  // Monta a tabela HTML
  let tabelaHTML = `
  <meta charset="UTF-8">
  <table border="1" style="border-collapse: collapse;">
  <tr style="background-color:#333;color:#fff;">
  <tr><th>Nome</th><th>Tarefa</th><th>Inicio</th><th>Prazo</th><th>Status</th><th>Encerrado em</th></tr>`;
  //ativos
  ativos.forEach(obj => {
    const hoje = new Date();
    const inicio = new Date(obj.startDate);
    const prazo = new Date(obj.endDate);
    let status = hoje < inicio ? 'nao iniciado' : hoje <= prazo ? 'Em andamento' : 'Atrasado';
    let cor = status === 'Atrasado' ? '#dc3545' : '#28a745';


    tabelaHTML += `<tr>
      <td>${obj.person || ''}</td>
      <td>${obj.item || ''}</td>
      <td>${obj.startDate || ''}</td>
      <td>${obj.endDate || ''}</td>
      <td style="color:${cor};font-weight:bold;">${status}</td>
      <td>-</td>
    </tr>`;
  });

  //Historico
  historico.forEach(obj => {
    tabelaHTML += `<tr>
      <td>${obj.person}</td>
      <td>${obj.item}</td>
      <td>${obj.startDate}</td>
      <td>${obj.endDate}</td>
      <td style="color:#6c757d;font-weight:bold;">Encerrado</td>
      <td>${obj.encerradoEm}</td>
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
      //Botão para finalizar a tarefa
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
    const historico = JSON.parse(localStorage.getItem('historico')) || [];

    // Remove do ativo e adiciona ao histórico
  const tarefaEncerrada = loans.splice(index, 1)[0];
  historico.push({ ...tarefaEncerrada, encerradoEm: new Date().toISOString().split('T')[0] });
  
    localStorage.setItem('loans', JSON.stringify(loans));
    localStorage.setItem('historico', JSON.stringify(historico));
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
