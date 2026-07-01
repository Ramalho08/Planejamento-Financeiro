import { $, today } from "./utils.js";
import { store } from "./core.js";
import { clearState } from "./storage.js";

export function initSettings() {
  $("resetDemoBtn")?.addEventListener("click", () => {
    store.state.transactions = [
      { id: "demo1", description: "Salário", amount: 1800, type: "income", category: "Salário", date: today() },
      { id: "demo2", description: "Mercado", amount: 120, type: "expense", category: "Alimentação", date: today() },
      { id: "demo3", description: "Transporte", amount: 35, type: "expense", category: "Transporte", date: today() }
    ];
    store.state.wallets = [{ id: "wallet1", name: "Carteira principal", balance: 500 }];
    store.state.goals = [{ id: "goal1", name: "Notebook", target: 5000, saved: 700 }];
    store.emit();
  });

  $("clearDataBtn")?.addEventListener("click", () => {
    if (confirm("Limpar todos os dados locais?")) {
      clearState();
      location.reload();
    }
  });
}

export function renderSettings() {
  $("systemStatus").innerHTML = `
    <div class="alert"><b>Versão:</b> Ramalho Finance 2.0 Foundation</div>
    <div class="alert"><b>Armazenamento:</b> localStorage</div>
    <div class="alert"><b>Pronto para:</b> Firebase, IA Cloud, PDF/OCR e app mobile</div>
  `;
}
