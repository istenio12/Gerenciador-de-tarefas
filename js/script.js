console.log("Script carregado com sucesso!");

document.getElementById('btnExportar').addEventListener('click', () => {
  const dados = localStorage.getItem('loans');
  if (!dados) {
    alert('Nenhum dado encontrado com a chave "loans".');
    return;
  }

  let lista = JSON.parse(dados);

  // Monta a tabela HTML
  let tabelaHTML = '<table><tr><th>Nome</th><th>Equipamento</th><th>Data</th></tr>';
  
lista.forEach(obj => {
    tabelaHTML += `<tr>
      <td>${obj.person || ''}</td>
      <td>${obj.item || ''}</td>
      <td>${obj.date || ''}</td>
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
      const li = document.createElement('li');
      li.innerHTML = `
        <strong>${loan.item}</strong> para <em>${loan.person}</em> em ${loan.date}      
      `;
    
const button = document.createElement("button");
button.textContent = "Resolver";
button.addEventListener("click", () => returnItem(index));
li.appendChild(button)
   
      loanList.appendChild(li);
    });
  }

  function saveLoan(item, person, date) {
    const loans = JSON.parse(localStorage.getItem('loans')) || [];
    loans.push({ item, person, date });
    localStorage.setItem('loans', JSON.stringify(loans));
    console.log("salvando:", item, person, date);
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
    const date = document.getElementById('date').value;
    saveLoan(item, person, date);
    form.reset();
  });

  loadLoans();
});
