import { signInWithGoogle, signOutGoogle, onUserChange } from './firebase-config.js';

const DEFAULT_CATEGORIES = ['Alimentação','Transporte','Moradia','Educação','Saúde','Lazer','Assinaturas','Trabalho','Investimentos','Outros'];
const money = v => Number(v || 0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
const monthKey = () => new Date().toISOString().slice(0,7);

const state = JSON.parse(localStorage.getItem('ramalhoFinanceV4')) || {
  transactions: [],
  goals: [],
  categories: DEFAULT_CATEGORIES,
  theme: 'dark',
  closedMonths: {},
  user: null
};

let categoryChart, monthlyChart, deferredPrompt;

function save(){ localStorage.setItem('ramalhoFinanceV4', JSON.stringify(state)); render(); }
function currentItems(){ return state.transactions.filter(t => t.month === monthKey()); }
function totals(items=currentItems()){
  return items.reduce((a,t)=>{ t.type==='income' ? a.income+=t.amount : a.expense+=t.amount; return a; },{income:0,expense:0});
}

function applyRecurring(){
  const month = monthKey();
  const already = state.transactions.some(t => t.month === month && t.generatedRecurring);
  if(already) return;
  const previousRecurring = state.transactions.filter(t => t.recurring && t.month !== month);
  const unique = new Map(previousRecurring.map(t => [t.description+t.amount+t.type+t.category, t]));
  unique.forEach(t => state.transactions.push({...t, id:crypto.randomUUID(), date:new Date().toISOString(), month, generatedRecurring:true}));
  localStorage.setItem('ramalhoFinanceV4', JSON.stringify(state));
}

function render(){
  document.body.classList.toggle('light', state.theme === 'light');
  document.getElementById('monthLabel').textContent = new Date().toLocaleDateString('pt-BR',{month:'long',year:'numeric'});
  renderCategories();
  renderDashboard();
  renderTransactions();
  renderGoals();
  renderReports();
}

function renderCategories(){
  const select = document.getElementById('category');
  select.innerHTML = state.categories.map(c=>`<option>${c}</option>`).join('');
  document.getElementById('categoryTags').innerHTML = state.categories.map(c=>`<span class="tag">#${c}</span>`).join(' ');
}

function renderDashboard(){
  const items = currentItems();
  const t = totals(items);
  const balance = t.income - t.expense;
  const savingRate = t.income ? Math.round((balance/t.income)*100) : 0;
  const emergency = t.expense * 6;
  const score = Math.max(0, Math.min(100, 50 + savingRate));

  incomeTotal.textContent = money(t.income);
  expenseTotal.textContent = money(t.expense);
  heroBalance.textContent = money(balance);
  savingRateEl.textContent = `${savingRate}%`;
  emergencyFund.textContent = money(emergency);
  healthScore.textContent = score;

  const insights = [];
  if(balance < 0) insights.push('⚠️ Seus gastos estão acima das receitas neste mês.');
  if(t.expense > t.income * .7 && t.income > 0) insights.push('🚨 Mais de 70% da sua renda já foi comprometida.');
  if(balance > 0) insights.push(`✅ Você ainda tem ${money(balance)} disponível este mês.`);
  if(state.goals.length) insights.push('🎯 Continue alimentando suas metas para acompanhar seu progresso.');
  heroInsight.textContent = insights[0] || 'Cadastre movimentações para receber recomendações.';
  document.getElementById('insights').innerHTML = (insights.length?insights:['Comece adicionando uma receita e uma despesa.']).map(i=>`<div class="insight">${i}</div>`).join('');

  const byCategory = {};
  items.filter(i=>i.type==='expense').forEach(i=> byCategory[i.category]=(byCategory[i.category]||0)+i.amount);
  drawChart('categoryChart', 'doughnut', Object.keys(byCategory), Object.values(byCategory), 'category');

  const months = [...new Set(state.transactions.map(t=>t.month))].sort().slice(-6);
  const balances = months.map(m => {
    const tx = state.transactions.filter(t=>t.month===m);
    const tt = totals(tx); return tt.income - tt.expense;
  });
  drawChart('monthlyChart', 'line', months, balances, 'monthly');
}

function drawChart(id,type,labels,data,kind){
  const ctx = document.getElementById(id);
  if(kind==='category' && categoryChart) categoryChart.destroy();
  if(kind==='monthly' && monthlyChart) monthlyChart.destroy();
  const chart = new Chart(ctx,{type,data:{labels,datasets:[{label:'R$',data,borderWidth:2,tension:.35}]},options:{plugins:{legend:{display:type!=='line'}},responsive:true}});
  if(kind==='category') categoryChart = chart; else monthlyChart = chart;
}

function renderTransactions(){
  const q = search.value?.toLowerCase() || '';
  const filter = filterType.value || 'all';
  const items = currentItems().filter(t => (filter==='all'||t.type===filter) && t.description.toLowerCase().includes(q));
  transactionList.innerHTML = items.map(t => `
    <div class="row">
      <div><strong>${t.description}</strong><div class="tag">${t.category} • ${new Date(t.date).toLocaleDateString('pt-BR')} ${t.recurring?'• recorrente':''}</div></div>
      <strong class="amount ${t.type==='income'?'income':'expense'}">${t.type==='income'?'+':'-'} ${money(t.amount)}</strong>
      <button class="delete" onclick="deleteTransaction('${t.id}')">Excluir</button>
    </div>`).join('') || '<p class="tag">Nenhuma movimentação neste mês.</p>';
}

function renderGoals(){
  goalList.innerHTML = state.goals.map(g => {
    const pct = Math.min(100, Math.round((g.saved/g.target)*100));
    return `<article class="goal"><div style="width:100%"><strong>${g.name}</strong><p>${money(g.saved)} de ${money(g.target)} • ${pct}%</p><div class="progress"><span style="width:${pct}%"></span></div></div><button class="delete" onclick="deleteGoal('${g.id}')">Excluir</button></article>`;
  }).join('') || '<p class="tag">Nenhuma meta cadastrada.</p>';
  const t = totals();
  const balance = t.income - t.expense;
  const first = state.goals[0];
  goalProjection.textContent = first && balance > 0 ? `Mantendo ${money(balance)} por mês, você alcança "${first.name}" em aproximadamente ${Math.ceil((first.target-first.saved)/balance)} mês(es).` : 'Cadastre metas e mantenha saldo positivo para gerar previsão.';
}

function renderReports(){
  const years = {};
  state.transactions.forEach(t => {
    const y = t.month.slice(0,4);
    if(!years[y]) years[y] = {income:0,expense:0};
    t.type==='income' ? years[y].income+=t.amount : years[y].expense+=t.amount;
  });
  yearSummary.innerHTML = Object.entries(years).map(([y,v])=>`<div class="row"><strong>${y}</strong><span>Receitas: ${money(v.income)} • Despesas: ${money(v.expense)} • Saldo: ${money(v.income-v.expense)}</span></div>`).join('') || '<p class="tag">Sem dados ainda.</p>';
}

window.deleteTransaction = id => { state.transactions = state.transactions.filter(t=>t.id!==id); save(); }
window.deleteGoal = id => { state.goals = state.goals.filter(g=>g.id!==id); save(); }

transactionForm.addEventListener('submit', e=>{
  e.preventDefault();
  state.transactions.push({id:crypto.randomUUID(),description:description.value,amount:Number(amount.value),type:type.value,category:category.value,recurring:recurring.checked,date:new Date().toISOString(),month:monthKey()});
  transactionForm.reset(); save();
});
goalForm.addEventListener('submit', e=>{
  e.preventDefault();
  state.goals.push({id:crypto.randomUUID(),name:goalName.value,target:Number(goalTarget.value),saved:Number(goalSaved.value||0)});
  goalForm.reset(); save();
});
categoryForm.addEventListener('submit', e=>{e.preventDefault(); if(newCategory.value && !state.categories.includes(newCategory.value)){state.categories.push(newCategory.value); newCategory.value=''; save();}});
search.addEventListener('input', renderTransactions); filterType.addEventListener('change', renderTransactions);

document.querySelectorAll('.nav-btn').forEach(btn=>btn.onclick=()=>{
  document.querySelectorAll('.nav-btn,.page').forEach(x=>x.classList.remove('active'));
  btn.classList.add('active'); document.getElementById(btn.dataset.page).classList.add('active'); pageTitle.textContent=btn.textContent;
});
themeBtn.onclick=()=>{state.theme=state.theme==='dark'?'light':'dark'; save();}
closeMonthBtn.onclick=()=>{state.closedMonths[monthKey()] = totals(); alert('Mês arquivado no histórico.'); save();}
exportCsvBtn.onclick=()=>{
  const rows = ['Data,Mês,Tipo,Categoria,Descrição,Valor', ...state.transactions.map(t=>`${t.date},${t.month},${t.type},${t.category},"${t.description}",${t.amount}`)];
  download('ramalho-finance.csv', rows.join('\n'), 'text/csv');
}
exportJsonBtn.onclick=()=>download('ramalho-finance-backup.json', JSON.stringify(state,null,2), 'application/json');
importJsonInput.onchange=e=>{
  const file=e.target.files[0]; if(!file)return;
  const reader=new FileReader(); reader.onload=()=>{Object.assign(state, JSON.parse(reader.result)); save();}; reader.readAsText(file);
}
printBtn.onclick=()=>window.print();

function download(name, content, type){ const a=document.createElement('a'); a.href=URL.createObjectURL(new Blob([content],{type})); a.download=name; a.click(); }

googleLoginBtn.onclick=async()=>{ try{ await signInWithGoogle(); }catch(e){ alert('Configure o Firebase em firebase-config.js para ativar o login Google.'); } };
onUserChange(user=>{
  if(user){ userName.textContent=user.displayName||'Usuário Google'; userEmail.textContent=user.email||''; avatar.textContent=(user.displayName||'G')[0]; }
});

window.addEventListener('beforeinstallprompt', e=>{e.preventDefault(); deferredPrompt=e; installBtn.style.display='inline-block';});
installBtn.onclick=()=>deferredPrompt?.prompt();

function particles(){
  const c=document.getElementById('particles'),x=c.getContext('2d'); let w,h,pts=[];
  function resize(){w=c.width=innerWidth;h=c.height=innerHeight;pts=Array.from({length:70},()=>({x:Math.random()*w,y:Math.random()*h,vx:(Math.random()-.5)*.6,vy:(Math.random()-.5)*.6}));}
  function loop(){x.clearRect(0,0,w,h);x.fillStyle='rgba(34,211,238,.7)';pts.forEach(p=>{p.x+=p.vx;p.y+=p.vy;if(p.x<0||p.x>w)p.vx*=-1;if(p.y<0||p.y>h)p.vy*=-1;x.beginPath();x.arc(p.x,p.y,1.5,0,Math.PI*2);x.fill();});x.strokeStyle='rgba(34,211,238,.12)';for(let i=0;i<pts.length;i++)for(let j=i+1;j<pts.length;j++){let dx=pts[i].x-pts[j].x,dy=pts[i].y-pts[j].y;if(dx*dx+dy*dy<10000){x.beginPath();x.moveTo(pts[i].x,pts[i].y);x.lineTo(pts[j].x,pts[j].y);x.stroke();}}requestAnimationFrame(loop);}
  resize(); addEventListener('resize',resize); loop();
}

const savingRateEl = document.getElementById('savingRate');
applyRecurring();
particles();
render();

if('serviceWorker' in navigator) navigator.serviceWorker.register('service-worker.js');
