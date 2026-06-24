const DEFAULT_CATEGORIES = ['Alimentação','Transporte','Moradia','Educação','Saúde','Lazer','Assinaturas','Trabalho','Investimentos','Outros'];
const BRL = v => Number(v||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
const monthKey = () => new Date().toISOString().slice(0,7);
const $ = id => document.getElementById(id);

let chartCategory = null;
let chartMonth = null;
let deferredPrompt = null;

const state = JSON.parse(localStorage.getItem('ramalhoFinanceV5')) || {
  transactions: [],
  goals: [],
  categories: DEFAULT_CATEGORIES,
  theme: 'dark',
  logged: false,
  user: {name:'Usuário local', email:'dados neste dispositivo'}
};

function save(){ localStorage.setItem('ramalhoFinanceV5', JSON.stringify(state)); render(); }
function currentItems(){ return state.transactions.filter(t => t.month === monthKey()); }
function totals(items=currentItems()){
  return items.reduce((a,t)=>{t.type==='income'?a.income+=t.amount:a.expense+=t.amount;return a},{income:0,expense:0});
}

function startApp(user){
  state.logged = true;
  if(user) state.user = user;
  localStorage.setItem('ramalhoFinanceV5', JSON.stringify(state));
  $('loginScreen').classList.add('hidden');
  $('app').classList.remove('hidden');
  applyRecurring();
  render();
}

function logout(){
  state.logged = false;
  save();
  $('loginScreen').classList.remove('hidden');
  $('app').classList.add('hidden');
}

function applyRecurring(){
  const current = monthKey();
  const exists = state.transactions.some(t => t.month === current && t.generatedRecurring);
  if(exists) return;
  const recurring = state.transactions.filter(t => t.recurring && t.month !== current);
  const unique = new Map(recurring.map(t => [t.description+t.amount+t.type+t.category, t]));
  unique.forEach(t => state.transactions.push({...t, id:crypto.randomUUID(), month:current, date:new Date().toISOString(), generatedRecurring:true}));
  localStorage.setItem('ramalhoFinanceV5', JSON.stringify(state));
}

function render(){
  document.body.classList.toggle('light', state.theme === 'light');
  $('dateLabel').textContent = new Date().toLocaleDateString('pt-BR',{weekday:'long',day:'2-digit',month:'long',year:'numeric'});
  $('profileName').textContent = state.user?.name || 'Usuário local';
  $('profileEmail').textContent = state.user?.email || 'dados neste dispositivo';
  $('avatar').textContent = (state.user?.name || 'R')[0].toUpperCase();
  renderCategorySelect();
  renderDashboard();
  renderTransactions();
  renderRecurring();
  renderGoals();
  renderReports();
}

function renderCategorySelect(){
  $('category').innerHTML = state.categories.map(c=>`<option>${c}</option>`).join('');
  $('categoryTags').innerHTML = state.categories.map(c=>`<span>#${c}</span>`).join('');
}

function renderDashboard(){
  const items = currentItems();
  const t = totals(items);
  const balance = t.income - t.expense;
  const saving = t.income ? Math.round((balance/t.income)*100) : 0;
  const score = Math.max(0, Math.min(100, 50 + saving));
  $('incomeTotal').textContent = BRL(t.income);
  $('expenseTotal').textContent = BRL(t.expense);
  $('balanceHero').textContent = BRL(balance);
  $('savingRate').textContent = `${saving}%`;
  $('emergencyFund').textContent = BRL(t.expense * 6);
  $('futureProjection').textContent = BRL(balance * 3);
  $('score').textContent = score;

  const byCat = {};
  items.filter(i=>i.type==='expense').forEach(i=>byCat[i.category]=(byCat[i.category]||0)+i.amount);
  const top = Object.entries(byCat).sort((a,b)=>b[1]-a[1])[0];
  $('topCategory').textContent = top ? top[0] : '---';

  const insights = makeInsights(t, balance, saving, top);
  $('mainInsight').textContent = insights[0] || 'Cadastre dados para gerar análises.';
  $('insights').innerHTML = insights.map(i=>`<div class="insight">${i}</div>`).join('');

  drawCharts(byCat);
}

function makeInsights(t,balance,saving,top){
  const arr = [];
  if(t.income === 0) arr.push('💡 Cadastre sua renda mensal para o sistema calcular seu desempenho.');
  if(balance < 0) arr.push('⚠️ Seus gastos ultrapassaram suas receitas. Reduza despesas variáveis.');
  if(saving >= 30) arr.push('🚀 Excelente! Você economizou 30% ou mais da sua renda.');
  if(saving > 0 && saving < 20) arr.push('📈 Você está positivo, mas tente buscar pelo menos 20% de economia.');
  if(top) arr.push(`🔎 Sua maior categoria de gasto é ${top[0]} com ${BRL(top[1])}.`);
  if(t.expense > t.income * .7 && t.income > 0) arr.push('🚨 Atenção: mais de 70% da renda foi comprometida.');
  if(state.goals.length) arr.push('🎯 Você possui metas ativas. Atualize o valor guardado com frequência.');
  if(!arr.length) arr.push('✅ Situação equilibrada. Continue acompanhando seus gastos.');
  return arr;
}

function drawCharts(byCat){
  const labels = Object.keys(byCat);
  const values = Object.values(byCat);

  if(window.Chart){
    if(chartCategory) chartCategory.destroy();
    chartCategory = new Chart($('categoryChart'), {
      type:'doughnut',
      data:{labels,datasets:[{data:values,borderWidth:1}]},
      options:{responsive:true,plugins:{legend:{position:'bottom'}}}
    });

    const months = [...new Set(state.transactions.map(t=>t.month))].sort().slice(-6);
    const balances = months.map(m => {
      const tx = state.transactions.filter(t=>t.month===m);
      const tt = totals(tx);
      return tt.income - tt.expense;
    });
    if(chartMonth) chartMonth.destroy();
    chartMonth = new Chart($('monthChart'), {
      type:'line',
      data:{labels:months,datasets:[{label:'Saldo',data:balances,tension:.35,borderWidth:3}]},
      options:{responsive:true}
    });
    return;
  }

  $('categoryFallback').style.display = 'block';
  $('categoryFallback').innerHTML = labels.map((l,i)=>`<p>${l} - ${BRL(values[i])}</p><div class="bar"><span style="width:${Math.min(100,values[i]/Math.max(...values)*100)}%"></span></div>`).join('');
}

function renderTransactions(){
  const q = ($('search').value || '').toLowerCase();
  const f = $('filterType').value || 'all';
  const items = currentItems().filter(t => (f==='all'||t.type===f) && t.description.toLowerCase().includes(q));
  $('transactionList').innerHTML = items.map(t=>`
    <div class="row">
      <div><strong>${t.description}</strong><div class="tag">${t.category} • ${new Date(t.date).toLocaleDateString('pt-BR')} ${t.recurring?'• recorrente':''}</div></div>
      <strong class="amount ${t.type==='income'?'income':'expense'}">${t.type==='income'?'+':'-'} ${BRL(t.amount)}</strong>
      <button class="delete" onclick="deleteTransaction('${t.id}')">Excluir</button>
    </div>
  `).join('') || '<p class="tag">Nenhuma movimentação neste mês.</p>';
}

function renderRecurring(){
  const recurring = state.transactions.filter(t=>t.recurring);
  $('recurringList').innerHTML = recurring.map(t=>`
    <div class="row"><div><strong>${t.description}</strong><div class="tag">${t.category}</div></div><strong>${BRL(t.amount)}</strong></div>
  `).join('') || '<p class="tag">Nenhuma recorrência cadastrada.</p>';
}

function renderGoals(){
  const t = totals();
  const balance = t.income - t.expense;
  $('goalList').innerHTML = state.goals.map(g=>{
    const pct = Math.min(100, Math.round((g.saved/g.target)*100));
    return `<article class="goal"><div style="width:100%"><strong>${g.name}</strong><p class="small">${BRL(g.saved)} de ${BRL(g.target)} • ${pct}%</p><div class="progress"><span style="width:${pct}%"></span></div></div><button class="delete" onclick="deleteGoal('${g.id}')">Excluir</button></article>`;
  }).join('') || '<p class="tag">Nenhuma meta cadastrada.</p>';
  const g = state.goals[0];
  $('goalProjection').textContent = g && balance > 0 ? `Com ${BRL(balance)} por mês, "${g.name}" pode ser alcançada em ${Math.ceil((g.target-g.saved)/balance)} mês(es).` : 'Cadastre metas e mantenha saldo positivo para gerar previsão.';
}

function renderReports(){
  const months = {};
  state.transactions.forEach(t=>{
    months[t.month] ||= {income:0, expense:0};
    t.type==='income'?months[t.month].income+=t.amount:months[t.month].expense+=t.amount;
  });
  $('monthlySummary').innerHTML = Object.entries(months).sort().reverse().map(([m,v])=>`
    <div class="row"><strong>${m}</strong><span>Receitas: ${BRL(v.income)} • Despesas: ${BRL(v.expense)} • Saldo: ${BRL(v.income-v.expense)}</span></div>
  `).join('') || '<p class="tag">Sem dados para relatório.</p>';
}

window.deleteTransaction = id => { state.transactions = state.transactions.filter(t=>t.id!==id); save(); }
window.deleteGoal = id => { state.goals = state.goals.filter(g=>g.id!==id); save(); }

$('localLoginBtn').onclick = () => startApp();
$('googleBtn').onclick = () => {
  if(!window.FIREBASE_ENABLED) return alert('Firebase ainda não configurado. Use o modo local ou cole suas chaves em firebase-config.js.');
  alert('Depois de colar as chaves do Firebase, conecte aqui usando o SDK do Firebase.');
}
$('logoutBtn').onclick = logout;
$('themeBtn').onclick = () => { state.theme = state.theme === 'dark' ? 'light' : 'dark'; save(); }

document.querySelectorAll('.nav').forEach(btn=>{
  btn.onclick=()=>{
    document.querySelectorAll('.nav,.page').forEach(x=>x.classList.remove('active'));
    btn.classList.add('active');
    $(btn.dataset.page).classList.add('active');
    $('pageTitle').textContent = btn.textContent;
  }
});

$('transactionForm').onsubmit = e => {
  e.preventDefault();
  state.transactions.push({
    id:crypto.randomUUID(),
    description:$('description').value,
    amount:Number($('amount').value),
    type:$('type').value,
    category:$('category').value,
    recurring:$('recurring').checked,
    date:new Date().toISOString(),
    month:monthKey()
  });
  $('transactionForm').reset();
  save();
}

$('goalForm').onsubmit = e => {
  e.preventDefault();
  state.goals.push({id:crypto.randomUUID(), name:$('goalName').value, target:Number($('goalTarget').value), saved:Number($('goalSaved').value||0)});
  $('goalForm').reset();
  save();
}

$('categoryForm').onsubmit = e => {
  e.preventDefault();
  const c = $('newCategory').value.trim();
  if(c && !state.categories.includes(c)) state.categories.push(c);
  $('newCategory').value = '';
  save();
}

$('search').oninput = renderTransactions;
$('filterType').onchange = renderTransactions;
$('closeMonthBtn').onclick = () => alert('Mês registrado no histórico. Os dados ficam salvos automaticamente por mês.');

function download(name, content, type){
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([content],{type}));
  a.download = name;
  a.click();
}

$('exportCsvBtn').onclick = () => {
  const rows = ['Data,Mes,Tipo,Categoria,Descricao,Valor'];
  state.transactions.forEach(t=>rows.push(`${t.date},${t.month},${t.type},${t.category},"${t.description}",${t.amount}`));
  download('ramalho-finance.csv', rows.join('\n'), 'text/csv');
}
$('exportJsonBtn').onclick = () => download('ramalho-finance-backup.json', JSON.stringify(state,null,2), 'application/json');
$('importJson').onchange = e => {
  const file = e.target.files[0];
  if(!file) return;
  const reader = new FileReader();
  reader.onload = () => { Object.assign(state, JSON.parse(reader.result)); save(); };
  reader.readAsText(file);
}
$('printBtn').onclick = () => window.print();
$('clearBtn').onclick = () => { if(confirm('Apagar todos os dados?')){ localStorage.removeItem('ramalhoFinanceV5'); location.reload(); } }

window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); deferredPrompt = e; });
$('installBtn').onclick = () => deferredPrompt ? deferredPrompt.prompt() : alert('No celular, use o menu do navegador e toque em Instalar aplicativo.');

function animateMatrix(){
  const c = $('matrix');
  const ctx = c.getContext('2d');
  let w,h,particles;
  function resize(){
    w = c.width = innerWidth;
    h = c.height = innerHeight;
    particles = Array.from({length: Math.min(120, Math.floor(w*h/12000))},()=>({
      x:Math.random()*w,y:Math.random()*h,vx:(Math.random()-.5)*.7,vy:(Math.random()-.5)*.7
    }));
  }
  function loop(){
    ctx.clearRect(0,0,w,h);
    ctx.fillStyle='rgba(34,211,238,.75)';
    particles.forEach(p=>{
      p.x+=p.vx; p.y+=p.vy;
      if(p.x<0||p.x>w)p.vx*=-1;
      if(p.y<0||p.y>h)p.vy*=-1;
      ctx.beginPath(); ctx.arc(p.x,p.y,1.5,0,Math.PI*2); ctx.fill();
    });
    ctx.strokeStyle='rgba(34,211,238,.12)';
    for(let i=0;i<particles.length;i++){
      for(let j=i+1;j<particles.length;j++){
        const dx=particles[i].x-particles[j].x, dy=particles[i].y-particles[j].y;
        if(dx*dx+dy*dy<9000){ctx.beginPath();ctx.moveTo(particles[i].x,particles[i].y);ctx.lineTo(particles[j].x,particles[j].y);ctx.stroke();}
      }
    }
    requestAnimationFrame(loop);
  }
  resize(); addEventListener('resize', resize); loop();
}

animateMatrix();
if(state.logged) startApp(state.user);
if('serviceWorker' in navigator) navigator.serviceWorker.register('service-worker.js');
