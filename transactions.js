import { $, categories, id, today, money } from "./utils.js";
import { store } from "./core.js";

export function initTransactions() {
  const cat = $("txCategory");
  if (cat) cat.innerHTML = categories.map((c) => `<option>${c}</option>`).join("");
  if ($("txDate")) $("txDate").value = today();

  $("addTxBtn")?.addEventListener("click", () => {
    const description = $("txDescription").value.trim();
    const amount = Number($("txAmount").value || 0);
    if (!description || amount <= 0) {
      alert("Preencha descrição e valor.");
      return;
    }
    store.addTransaction({
      id: id(),
      description,
      amount,
      type: $("txType").value,
      category: $("txCategory").value,
      date: $("txDate").value || today()
    });
    $("txDescription").value = "";
    $("txAmount").value = "";
  });

  document.addEventListener("click", (ev) => {
    const btn = ev.target.closest("[data-remove-tx]");
    if (!btn) return;
    store.removeTransaction(btn.dataset.removeTx);
  });
}

export function renderTransactions() {
  $("txList").innerHTML = store.state.transactions.map((x) => `
    <div class="row">
      <div><b>${x.description}</b><small>${x.category} • ${x.date}</small></div>
      <span>${x.type === "income" ? "+" : "-"} ${money(x.amount)}</span>
      <button data-remove-tx="${x.id}">Excluir</button>
    </div>
  `).join("") || `<div class="alert">Nenhum lançamento cadastrado.</div>`;
}
