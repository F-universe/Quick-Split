let people = JSON.parse(localStorage.getItem('qs_people')||'[]');
let expenses = JSON.parse(localStorage.getItem('qs_expenses')||'[]');

function save() {
  localStorage.setItem('qs_people', JSON.stringify(people));
  localStorage.setItem('qs_expenses', JSON.stringify(expenses));
}

function addPerson() {
  const input = document.getElementById('personInput');
  const name = input.value.trim();
  if(name && !people.includes(name)) {
    people.push(name);
    input.value = '';
    save();
    renderPeople();
    renderExpenseSelects();
  }
}
function delPerson(name) {
  people = people.filter(p => p!==name);
  expenses = expenses.filter(e => e.payer!==name && !e.participants.includes(name));
  save();
  renderPeople();
  renderExpenseSelects();
  renderExpenses();
}

function renderPeople() {
  document.getElementById('people').innerHTML =
    people.map(p => `<span class="person">${p} <button onclick="delPerson('${p}')">x</button></span>`).join('');
}
function renderExpenseSelects() {
  const sel = document.getElementById('expensePayer');
  sel.innerHTML = `<option value="">Paid by...</option>` + people.map(p => `<option>${p}</option>`).join('');
  const container = document.getElementById('expenseParticipants');
  container.innerHTML = people.map(p =>
    `<label class="participant-chk"><input type="checkbox" value="${p}">${p}</label>`
  ).join('');
}

function addExpense() {
  const name = document.getElementById('expenseName').value.trim();
  const amount = parseFloat(document.getElementById('expenseAmount').value);
  const payer = document.getElementById('expensePayer').value;
  const participantChecks = document.querySelectorAll('#expenseParticipants input[type=checkbox]:checked');
  const participants = Array.from(participantChecks).map(c=>c.value);
  if(!name || !amount || !payer || participants.length<1) return alert('Fill all fields!');
  expenses.push({name, amount, payer, participants});
  document.getElementById('expenseName').value = '';
  document.getElementById('expenseAmount').value = '';
  document.getElementById('expensePayer').value = '';
  renderExpenseSelects();
  save();
  renderExpenses();
}
function delExpense(i) {
  expenses.splice(i,1);
  save();
  renderExpenses();
}

function renderExpenses() {
  document.getElementById('expenses').innerHTML = expenses.map((e,i) =>
    `<div class="expense">${e.name} - €${e.amount.toFixed(2)} <small>(paid by ${e.payer}, participants: ${e.participants.join(', ')})</small> <button onclick="delExpense(${i})">x</button></div>`
  ).join('');
}

function calculate() {
  let balances = Object.fromEntries(people.map(p=>[p,0]));
  expenses.forEach(e => {
    const share = e.amount / e.participants.length;
    e.participants.forEach(p => balances[p] -= share);
    balances[e.payer] += e.amount;
  });
  let resultArr = [];
  people.forEach(p => {
    if(Math.abs(balances[p])>0.01)
      resultArr.push(`${p}: ${balances[p]>0 ? 'should receive' : 'should pay'} €${Math.abs(balances[p]).toFixed(2)}`);
    else
      resultArr.push(`${p}: settled up!`);
  });
  document.getElementById('result').innerHTML = resultArr.join('<br>');
}

function toggleTheme() {
  document.body.classList.toggle('dark');
  localStorage.setItem('qs_theme', document.body.classList.contains('dark')?'dark':'');
}

window.onload = () => {
  if(localStorage.getItem('qs_theme')==='dark') document.body.classList.add('dark');
  renderPeople();
  renderExpenseSelects();
  renderExpenses();
};
