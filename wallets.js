import { $, id, money } from "./utils.js";
import { store } from "./core.js";

export function initWallets() {
  $("addWalletBtn")?.addEventListener("click", () => {
    const name = $("walletName").value.trim();
    const balance = Number($("walletBalance").value || 0);
    if (!name) return alert("Informe o nome da carteira.");
    store.addWallet({ id: id(), name, balance });
    $("walletName").value = "";
    $("walletBalance").value = "";
  });

  document.addEventListener("click", (ev) => {
    const btn = ev.target.closest("[data-remove-wallet]");
    if (btn) store.removeWallet(btn.dataset.removeWallet);
  });
}

export function renderWallets() {
  $("walletList").innerHTML = store.state.wallets.map((x) => `
    <div class="row">
      <div><b>${x.name}</b><small>Carteira</small></div>
      <span>${money(x.balance)}</span>
      <button data-remove-wallet="${x.id}">Excluir</button>
    </div>
  `).join("") || `<div class="alert">Nenhuma carteira cadastrada.</div>`;
}
