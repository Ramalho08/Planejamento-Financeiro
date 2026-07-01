import { $, money, download, month } from "./utils.js";
import { currentTransactions, totals, store } from "./core.js";
import { financialScore } from "./dashboard.js";

export function reportText() {
  const t = totals();
  const tx = currentTransactions();
  const expenses = tx.filter((x) => x.type === "expense").sort((a, b) => b.amount - a.amount);
  const lines = [
    "Ramalho Finance 2.0 - Relatório",
    "Mês: " + month(),
    "Score: " + financialScore(t),
    "Receitas: " + money(t.income),
    "Despesas: " + money(t.expense),
    "Saldo: " + money(t.balance),
    "",
    "Maiores gastos:"
  ];
  expenses.slice(0, 10).forEach((x, i) => lines.push(`${i + 1}. ${x.description} - ${money(x.amount)} - ${x.category}`));
  return lines.join("\n");
}

export function initReports() {
  $("copyReportBtn")?.addEventListener("click", () => {
    navigator.clipboard?.writeText(reportText()).then(() => alert("Relatório copiado."));
  });
  $("exportReportBtn")?.addEventListener("click", () => download("relatorio-ramalho-finance.txt", reportText(), "text/plain"));
  $("backupBtn")?.addEventListener("click", () => download("backup-ramalho-finance.json", JSON.stringify(store.state, null, 2), "application/json"));
}

export function renderReports() {
  const t = totals();
  const score = financialScore(t);
  $("reportDiagnostics").innerHTML = `
    <div class="grid-4">
      <div class="alert"><b>Score</b><p>${score}</p></div>
      <div class="alert"><b>Receitas</b><p>${money(t.income)}</p></div>
      <div class="alert"><b>Despesas</b><p>${money(t.expense)}</p></div>
      <div class="alert"><b>Saldo</b><p>${money(t.balance)}</p></div>
    </div>
  `;
}
