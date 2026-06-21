
const db=JSON.parse(localStorage.getItem('rf11'))||{itens:[]};
function adicionar(){
db.itens.push({
descricao:descricao.value,
valor:+valor.value,
tipo:tipo.value,
data:new Date().toLocaleDateString()
});
save();
}
function excluir(i){db.itens.splice(i,1);save();}
function save(){localStorage.setItem('rf11',JSON.stringify(db));render();}
function render(){
let saldo=0;
lista.innerHTML='';
db.itens.forEach((x,i)=>{
saldo += x.tipo==='receita'?x.valor:-x.valor;
lista.innerHTML+=`<li>${x.data} - ${x.descricao}: R$ ${x.valor}
<button onclick='excluir(${i})'>X</button></li>`;
});
saldo.innerText='Saldo: R$ '+saldo.toFixed(2);
}
render();
