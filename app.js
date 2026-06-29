const $=id=>document.getElementById(id);
const brl=v=>Number(v||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});
const month=()=>new Date().toISOString().slice(0,7);
let flowChart=null,categoryChart=null;
let state=JSON.parse(localStorage.getItem('rf_v12_mobile_pro')||'null')||{tx:[],wallets:[],cards:[],goals:[],investments:[],theme:'dark',logged:false};

function save(){localStorage.setItem('rf_v12_mobile_pro',JSON.stringify(state));render();}
function currentTx(){return state.tx.filter(t=>t.month===month());}
function totals(){
 const tx=currentTx();
 const income=tx.filter(t=>t.type==='income').reduce((s,t)=>s+t.amount,0);
 const expense=tx.filter(t=>t.type==='expense').reduce((s,t)=>s+t.amount,0);
 const wallets=state.wallets.reduce((s,w)=>s+w.balance,0);
 const investments=state.investments.reduce((s,i)=>s+i.amount,0);
 const balance=income-expense;
 return {income,expense,balance,wallets,investments,net:wallets+investments+balance};
}
function login(sample=false){state.logged=true;if(sample)insertSample();save();$('login').classList.add('hidden');$('app').classList.remove('hidden');}
$('enterBtn').onclick=()=>login(false);
$('demoBtn').onclick=()=>login(true);
$('logoutBtn').onclick=()=>{state.logged=false;save();location.reload();};
$('themeBtn').onclick=()=>{state.theme=state.theme==='dark'?'light':'dark';save();};
$('menuBtn').onclick=()=>$('menuSheet').classList.toggle('hidden');

document.querySelectorAll('.tab,.sheet-link').forEach(btn=>{
 btn.onclick=()=>{
   const page=btn.dataset.page;
   if(!page)return;
   document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
   $(page).classList.add('active');
   document.querySelectorAll('.tab').forEach(t=>t.classList.remove('active'));
   document.querySelector(`.tab[data-page="${page}"]`)?.classList.add('active');
   $('menuSheet').classList.add('hidden');
   scrollTo({top:0,behavior:'smooth'});
 };
});

$('addTxBtn').onclick=()=>{
 state.tx.push({id:crypto.randomUUID(),description:$('txDescription').value||'Lançamento',amount:Number($('txAmount').value||0),type:$('txType').value,category:$('txCategory').value,date:$('txDate').value||new Date().toISOString().slice(0,10),recurring:$('txRecurring').checked,month:month()});
 $('txDescription').value='';$('txAmount').value='';$('txRecurring').checked=false;
 save();
};
$('searchTx').oninput=renderTransactions;

$('addWalletBtn').onclick=()=>{
 state.wallets.push({id:crypto.randomUUID(),name:$('walletName').value||'Carteira',balance:Number($('walletBalance').value||0)});
 $('walletName').value='';$('walletBalance').value='';
 save();
};

$('addCardBtn').onclick=()=>{
 state.cards.push({id:crypto.randomUUID(),name:$('cardName').value||'Cartão',limit:Number($('cardLimit').value||0),due:Number($('cardDue').value||1)});
 $('cardName').value='';$('cardLimit').value='';$('cardDue').value='';
 save();
};

$('addParcelBtn').onclick=()=>{
 const total=Number($('parcelTotal').value||0), count=Math.max(1,Number($('parcelCount').value||1));
 const cardId=$('parcelCard').value, card=state.cards.find(c=>c.id===cardId);
 const part=total/count;
 for(let i=0;i<count;i++){
   const d=new Date(); d.setMonth(d.getMonth()+i);
   state.tx.push({id:crypto.randomUUID(),description:$('parcelDesc').value||'Compra parcelada',amount:part,type:'expense',category:'Cartão',cardId,cardName:card?.name||'',date:d.toISOString().slice(0,10),recurring:false,installment:`${i+1}/${count}`,month:d.toISOString().slice(0,7)});
 }
 $('parcelDesc').value='';$('parcelTotal').value='';$('parcelCount').value='';
 save();
};

$('addGoalBtn').onclick=()=>{
 state.goals.push({id:crypto.randomUUID(),name:$('goalName').value||'Meta',target:Number($('goalTarget').value||0),saved:Number($('goalSaved').value||0)});
 $('goalName').value='';$('goalTarget').value='';$('goalSaved').value='';
 save();
};

$('simulateGoalBtn').onclick=()=>{
 const goal=state.goals[0], monthly=Number($('monthlySave').value||0);
 $('goalSimulation').textContent=goal&&monthly>0?`Guardando ${brl(monthly)} por mês, você alcança "${goal.name}" em ${Math.ceil((goal.target-goal.saved)/monthly)} mês(es).`:'Crie uma meta e informe um valor mensal.';
};

$('addInvestmentBtn').onclick=()=>{
 state.investments.push({id:crypto.randomUUID(),name:$('investmentName').value||'Investimento',amount:Number($('investmentAmount').value||0),rate:Number($('investmentRate').value||0)});
 $('investmentName').value='';$('investmentAmount').value='';$('investmentRate').value='';
 save();
};

$('simulateWealthBtn').onclick=()=>{
 let total=state.investments.reduce((s,i)=>s+i.amount,0);
 const months=Number($('wealthYears').value||0)*12, aporte=Number($('wealthMonthly').value||0);
 for(let i=0;i<months;i++)total=(total+aporte)*1.008;
 $('wealthSimulation').textContent=`Patrimônio estimado: ${brl(total)}`;
};

$('generatePlanBtn').onclick=()=>{
 const t=totals();
 $('assistantPlan').innerHTML=`<div class="alert"><strong>Plano inteligente do mês</strong><p>1. Priorize despesas essenciais.<br>2. Tente guardar ${brl(Math.max(0,t.balance*.3))}.<br>3. Sua reserva ideal é ${brl(t.expense*6)}.<br>4. Revise categorias com maiores gastos.</p></div>`;
};

$('exportCsvBtn').onclick=()=>{
 const rows=['Mes,Data,Tipo,Categoria,Descricao,Valor,Recorrente'];
 state.tx.forEach(t=>rows.push(`${t.month},${t.date},${t.type},${t.category},"${t.description}",${t.amount},${t.recurring}`));
 download('ramalho-finance-v12.csv',rows.join('\\n'),'text/csv');
};
$('backupBtn').onclick=()=>download('ramalho-finance-v12-backup.json',JSON.stringify(state,null,2),'application/json');
$('restoreInput').onchange=e=>{
 const file=e.target.files[0]; if(!file)return;
 const reader=new FileReader();
 reader.onload=()=>{state=JSON.parse(reader.result);save();};
 reader.readAsText(file);
};
$('printBtn').onclick=()=>print();
$('clearBtn').onclick=()=>{if(confirm('Apagar todos os dados?')){localStorage.removeItem('rf_v12_mobile_pro');location.reload();}};

function download(name,content,type){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([content],{type}));a.download=name;a.click();}

function render(){
 document.body.classList.toggle('light',state.theme==='light');
 $('today').textContent=new Date().toLocaleDateString('pt-BR',{day:'2-digit',month:'long',year:'numeric'});
 if(state.logged){$('login').classList.add('hidden');$('app').classList.remove('hidden');}
 const t=totals();
 const saving=t.income?Math.round((t.balance/t.income)*100):0;
 const score=Math.max(0,Math.min(100,50+saving-(t.balance<0?25:0)));
 $('netWorth').textContent=brl(t.net);
 $('incomeTotal').textContent=brl(t.income);
 $('expenseTotal').textContent=brl(t.expense);
 $('balanceTotal').textContent=brl(t.balance);
 $('reserveTotal').textContent=brl(t.expense*6);
 $('score').textContent=score;
 $('savingRate').textContent=saving+'%';
 $('riskLevel').textContent=score>=70?'Baixo':score>=45?'Médio':'Alto';
 const alerts=makeAlerts(t,saving);
 $('mainInsight').textContent=alerts[0];
 $('alerts').innerHTML=alerts.map(a=>`<div class="alert">${a}</div>`).join('');
 $('healthChecklist').innerHTML=makeChecklist(t).map(a=>`<div class="alert">${a}</div>`).join('');
 renderTransactions();renderWallets();renderCards();renderGoals();renderInvestments();renderReports();drawCharts(t);
}
function makeAlerts(t,saving){
 const arr=[];
 if(t.income===0)arr.push('💡 Cadastre sua renda para liberar análises mais precisas.');
 if(t.balance<0)arr.push('⚠️ Seu mês está negativo. Revise gastos variáveis.');
 if(saving>=25)arr.push('🚀 Excelente: sua taxa de economia está forte.');
 if(t.expense>t.income*.75&&t.income>0)arr.push('🚨 Mais de 75% da renda comprometida.');
 if(!arr.length)arr.push('✅ Finanças equilibradas neste mês.');
 arr.push(`🛡️ Reserva ideal recomendada: ${brl(t.expense*6)}.`);
 return arr;
}
function makeChecklist(t){
 return [(t.income?'✅':'⬜')+' Receita cadastrada',(t.expense?'✅':'⬜')+' Despesas monitoradas',(state.wallets.length?'✅':'⬜')+' Carteira cadastrada',(state.goals.length?'✅':'⬜')+' Meta financeira ativa',(state.investments.length?'✅':'⬜')+' Investimentos registrados',(t.balance>=0?'✅':'⚠️')+' Saldo mensal positivo'];
}
function renderTransactions(){
 const q=($('searchTx').value||'').toLowerCase();
 const list=currentTx().filter(t=>t.description.toLowerCase().includes(q));
 $('transactionList').innerHTML=list.map(t=>`<div class="row"><div><strong>${t.description}</strong><small>${t.category} ${t.installment?'• '+t.installment:''} ${t.recurring?'• recorrente':''}</small></div><strong class="${t.type==='income'?'positive':'negative'}">${t.type==='income'?'+':'-'} ${brl(t.amount)}</strong></div>`).join('')||'<p>Nenhum lançamento neste mês.</p>';
}
function renderWallets(){
 $('walletList').innerHTML=state.wallets.map(w=>`<div class="row"><strong>${w.name}</strong><span>${brl(w.balance)}</span></div>`).join('')||'<p>Nenhuma carteira.</p>';
}
function renderCards(){
 $('parcelCard').innerHTML=state.cards.map(c=>`<option value="${c.id}">${c.name}</option>`).join('');
 $('cardList').innerHTML=state.cards.map(c=>{
   const used=currentTx().filter(t=>t.cardId===c.id).reduce((s,t)=>s+t.amount,0);
   const pct=c.limit?Math.min(100,Math.round((used/c.limit)*100)):0;
   return `<div class="alert"><strong>${c.name}</strong><p>Usado ${brl(used)} de ${brl(c.limit)} • vence dia ${c.due}</p><div class="progress"><span style="width:${pct}%"></span></div></div>`;
 }).join('')||'<p>Nenhum cartão.</p>';
}
function renderGoals(){
 $('goalList').innerHTML=state.goals.map(g=>{
   const pct=g.target?Math.min(100,Math.round((g.saved/g.target)*100)):0;
   return `<div class="alert"><strong>${g.name}</strong><p>${brl(g.saved)} de ${brl(g.target)} • ${pct}%</p><div class="progress"><span style="width:${pct}%"></span></div></div>`;
 }).join('')||'<p>Nenhuma meta.</p>';
}
function renderInvestments(){
 const future=state.investments.reduce((s,i)=>s+i.amount*Math.pow(1+(i.rate||0)/100,12),0);
 $('investmentList').innerHTML=(state.investments.length?`<div class="alert"><strong>Projeção 12 meses:</strong> ${brl(future)}</div>`:'')+state.investments.map(i=>`<div class="row"><strong>${i.name}</strong><span>${brl(i.amount)} • ${i.rate}% mês</span></div>`).join('')||'<p>Nenhum investimento.</p>';
}
function renderReports(){
 const months={};
 state.tx.forEach(t=>{months[t.month]??={income:0,expense:0};t.type==='income'?months[t.month].income+=t.amount:months[t.month].expense+=t.amount;});
 $('monthlySummary').innerHTML=Object.entries(months).map(([m,v])=>`<div class="row"><strong>${m}</strong><span>Receitas ${brl(v.income)} • Despesas ${brl(v.expense)}</span></div>`).join('')||'<p>Sem relatórios.</p>';
}
function drawCharts(t){
 if(!window.Chart)return;
 if(flowChart)flowChart.destroy();
 flowChart=new Chart($('flowChart'),{type:'bar',data:{labels:['Receitas','Despesas','Investimentos'],datasets:[{data:[t.income,t.expense,t.investments]}]},options:{plugins:{legend:{display:false}}}});
 const cats={};
 currentTx().filter(t=>t.type==='expense').forEach(t=>cats[t.category]=(cats[t.category]||0)+t.amount);
 if(categoryChart)categoryChart.destroy();
 categoryChart=new Chart($('categoryChart'),{type:'doughnut',data:{labels:Object.keys(cats),datasets:[{data:Object.values(cats)}]}});
 const max=Math.max(1,...Object.values(cats));
 $('categoryBars').innerHTML=Object.entries(cats).map(([c,v])=>`<small>${c} — ${brl(v)}</small><div class="bar"><span style="width:${(v/max)*100}%"></span></div>`).join('');
}
function insertSample(){
 state.wallets=[{id:crypto.randomUUID(),name:'Nubank',balance:1200},{id:crypto.randomUUID(),name:'Dinheiro',balance:150}];
 state.tx=[{id:crypto.randomUUID(),description:'Salário',amount:1800,type:'income',category:'Trabalho',date:new Date().toISOString().slice(0,10),recurring:true,month:month()},{id:crypto.randomUUID(),description:'Mercado',amount:430,type:'expense',category:'Alimentação',date:new Date().toISOString().slice(0,10),recurring:false,month:month()},{id:crypto.randomUUID(),description:'Transporte',amount:180,type:'expense',category:'Transporte',date:new Date().toISOString().slice(0,10),recurring:true,month:month()}];
 state.cards=[{id:crypto.randomUUID(),name:'Cartão principal',limit:2000,due:10}];
 state.goals=[{id:crypto.randomUUID(),name:'Notebook',target:5000,saved:800}];
 state.investments=[{id:crypto.randomUUID(),name:'Reserva CDB',amount:500,rate:0.8}];
}
function bg(){
 const c=$('bg'),ctx=c.getContext('2d');let w,h,pts;
 function resize(){w=c.width=innerWidth;h=c.height=innerHeight;pts=Array.from({length:70},()=>({x:Math.random()*w,y:Math.random()*h,vx:(Math.random()-.5)*.55,vy:(Math.random()-.5)*.55}));}
 function loop(){ctx.clearRect(0,0,w,h);ctx.fillStyle='rgba(34,211,238,.65)';pts.forEach(p=>{p.x+=p.vx;p.y+=p.vy;if(p.x<0||p.x>w)p.vx*=-1;if(p.y<0||p.y>h)p.vy*=-1;ctx.beginPath();ctx.arc(p.x,p.y,1.3,0,7);ctx.fill();});requestAnimationFrame(loop);}
 resize();addEventListener('resize',resize);loop();
}
bg();render();
if('serviceWorker' in navigator)navigator.serviceWorker.register('service-worker.js');
