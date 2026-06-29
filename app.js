(function(){
'use strict';

function $(id){return document.getElementById(id);}
function brl(v){return Number(v||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'});}
function month(){return new Date().toISOString().slice(0,7);}
function safeParse(raw,fallback){try{return raw?JSON.parse(raw):fallback;}catch(e){return fallback;}}
function showError(err){var box=$('errorBox'); if(!box)return; box.classList.remove('hidden'); box.textContent='Erro carregando app: '+(err && err.message ? err.message : err);}

var state=safeParse(localStorage.getItem('rf_v12_1_fix'),{tx:[],wallets:[],cards:[],goals:[],theme:'dark'});

function save(){localStorage.setItem('rf_v12_1_fix',JSON.stringify(state)); render();}
function currentTx(){return state.tx.filter(function(t){return t.month===month();});}
function totals(){
 var tx=currentTx();
 var income=tx.filter(function(t){return t.type==='income';}).reduce(function(s,t){return s+t.amount;},0);
 var expense=tx.filter(function(t){return t.type==='expense';}).reduce(function(s,t){return s+t.amount;},0);
 var wallets=state.wallets.reduce(function(s,w){return s+w.balance;},0);
 return {income:income,expense:expense,balance:income-expense,wallets:wallets,net:wallets+income-expense};
}

function setPage(page){
 document.querySelectorAll('.page').forEach(function(p){p.classList.remove('active');});
 var el=$(page); if(el)el.classList.add('active');
 document.querySelectorAll('.tab').forEach(function(t){t.classList.remove('active');});
 var btn=document.querySelector('.tab[data-page="'+page+'"]'); if(btn)btn.classList.add('active');
 window.scrollTo(0,0);
}

document.querySelectorAll('.tab').forEach(function(btn){
 btn.addEventListener('click',function(){setPage(btn.dataset.page);});
});

$('themeBtn').addEventListener('click',function(){state.theme=state.theme==='dark'?'light':'dark';save();});

$('addTxBtn').addEventListener('click',function(){
 state.tx.push({id:Date.now().toString(36),description:$('txDescription').value||'Lançamento',amount:Number($('txAmount').value||0),type:$('txType').value,category:$('txCategory').value,recurring:$('txRecurring').checked,month:month()});
 $('txDescription').value=''; $('txAmount').value=''; $('txRecurring').checked=false; save();
});

$('addWalletBtn').addEventListener('click',function(){
 state.wallets.push({id:Date.now().toString(36),name:$('walletName').value||'Carteira',balance:Number($('walletBalance').value||0)});
 $('walletName').value=''; $('walletBalance').value=''; save();
});

$('addCardBtn').addEventListener('click',function(){
 state.cards.push({id:Date.now().toString(36),name:$('cardName').value||'Cartão',limit:Number($('cardLimit').value||0),due:Number($('cardDue').value||1)});
 $('cardName').value=''; $('cardLimit').value=''; $('cardDue').value=''; save();
});

$('addGoalBtn').addEventListener('click',function(){
 state.goals.push({id:Date.now().toString(36),name:$('goalName').value||'Meta',target:Number($('goalTarget').value||0),saved:Number($('goalSaved').value||0)});
 $('goalName').value=''; $('goalTarget').value=''; $('goalSaved').value=''; save();
});

$('sampleBtn').addEventListener('click',function(){
 state.wallets=[{id:'w1',name:'Nubank',balance:1200},{id:'w2',name:'Dinheiro',balance:150}];
 state.tx=[{id:'t1',description:'Salário',amount:1800,type:'income',category:'Trabalho',recurring:true,month:month()},{id:'t2',description:'Mercado',amount:430,type:'expense',category:'Alimentação',recurring:false,month:month()},{id:'t3',description:'Transporte',amount:180,type:'expense',category:'Transporte',recurring:true,month:month()}];
 state.cards=[{id:'c1',name:'Cartão principal',limit:2000,due:10}];
 state.goals=[{id:'g1',name:'Notebook',target:5000,saved:800}];
 save();
});

$('exportCsvBtn').addEventListener('click',function(){
 var rows=['Mes,Tipo,Categoria,Descricao,Valor'];
 state.tx.forEach(function(t){rows.push([t.month,t.type,t.category,'"'+t.description+'"',t.amount].join(','));});
 download('ramalho-finance.csv',rows.join('\\n'),'text/csv');
});

$('backupBtn').addEventListener('click',function(){download('ramalho-finance-backup.json',JSON.stringify(state,null,2),'application/json');});

$('restoreInput').addEventListener('change',function(e){
 var file=e.target.files[0]; if(!file)return;
 var reader=new FileReader();
 reader.onload=function(){try{state=JSON.parse(reader.result);save();}catch(err){showError(err);}};
 reader.readAsText(file);
});

$('clearBtn').addEventListener('click',function(){if(confirm('Apagar todos os dados?')){localStorage.removeItem('rf_v12_1_fix');location.reload();}});

function download(name,content,type){
 var a=document.createElement('a');
 a.href=URL.createObjectURL(new Blob([content],{type:type}));
 a.download=name; a.click();
}

function render(){
 document.body.classList.toggle('light',state.theme==='light');
 var t=totals();
 var saving=t.income?Math.round((t.balance/t.income)*100):0;
 var score=Math.max(0,Math.min(100,50+saving-(t.balance<0?25:0)));
 $('netWorth').textContent=brl(t.net);
 $('incomeTotal').textContent=brl(t.income);
 $('expenseTotal').textContent=brl(t.expense);
 $('balanceTotal').textContent=brl(t.balance);
 $('reserveTotal').textContent=brl(t.expense*6);
 $('score').textContent=score;
 $('savingRate').textContent=saving+'%';
 $('risk').textContent=score>=70?'Baixo':score>=45?'Médio':'Alto';
 var alerts=[];
 if(t.income===0)alerts.push('💡 Cadastre sua renda mensal.');
 if(t.balance<0)alerts.push('⚠️ Seu mês está negativo.');
 if(t.balance>=0&&t.income>0)alerts.push('✅ Seu mês está positivo.');
 alerts.push('🛡️ Reserva ideal: '+brl(t.expense*6));
 $('mainInsight').textContent=alerts[0];
 $('alerts').innerHTML=alerts.map(function(a){return '<div class="alert">'+a+'</div>';}).join('');
 renderBars(t); renderTransactions(); renderWallets(); renderCards(); renderGoals(); renderSummary();
}

function renderBars(t){
 var data=[['Receitas',t.income],['Despesas',t.expense],['Saldo',Math.max(0,t.balance)]];
 var max=Math.max(1,t.income,t.expense,Math.abs(t.balance));
 $('bars').innerHTML=data.map(function(d){return '<small>'+d[0]+' — '+brl(d[1])+'</small><div class="bar"><span style="width:'+Math.round((d[1]/max)*100)+'%"></span></div>';}).join('');
}
function renderTransactions(){
 $('transactionList').innerHTML=currentTx().map(function(t){return '<div class="row"><div><strong>'+t.description+'</strong><small>'+t.category+(t.recurring?' • recorrente':'')+'</small></div><strong class="'+(t.type==='income'?'positive':'negative')+'">'+(t.type==='income'?'+':'-')+' '+brl(t.amount)+'</strong></div>';}).join('')||'<p>Nenhum lançamento.</p>';
}
function renderWallets(){
 $('walletList').innerHTML=state.wallets.map(function(w){return '<div class="row"><strong>'+w.name+'</strong><span>'+brl(w.balance)+'</span></div>';}).join('')||'<p>Nenhuma carteira.</p>';
}
function renderCards(){
 $('cardList').innerHTML=state.cards.map(function(c){return '<div class="row"><strong>'+c.name+'</strong><span>'+brl(c.limit)+' • vence dia '+c.due+'</span></div>';}).join('')||'<p>Nenhum cartão.</p>';
}
function renderGoals(){
 $('goalList').innerHTML=state.goals.map(function(g){var pct=g.target?Math.min(100,Math.round((g.saved/g.target)*100)):0;return '<div class="alert"><strong>'+g.name+'</strong><p>'+brl(g.saved)+' de '+brl(g.target)+' • '+pct+'%</p><div class="progress"><span style="width:'+pct+'%"></span></div></div>';}).join('')||'<p>Nenhuma meta.</p>';
}
function renderSummary(){
 var m={}; state.tx.forEach(function(t){m[t.month]=m[t.month]||{income:0,expense:0}; t.type==='income'?m[t.month].income+=t.amount:m[t.month].expense+=t.amount;});
 $('monthlySummary').innerHTML=Object.keys(m).map(function(k){return '<div class="row"><strong>'+k+'</strong><span>Receitas '+brl(m[k].income)+' • Despesas '+brl(m[k].expense)+'</span></div>';}).join('')||'<p>Sem resumo.</p>';
}

try{render();}catch(err){showError(err);}
if('serviceWorker' in navigator){navigator.serviceWorker.register('./service-worker.js').catch(function(){});}
})();