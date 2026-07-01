import { $, money } from "./utils.js";
import { currentTransactions, totals } from "./core.js";

export function financialScore(t) {
  let score = 80;
  const saving = t.income ? ((t.balance / t.income) * 100) : 0;
  if (t.balance < 0) score -= 30;
  if (saving < 10) score -= 12;
  if (t.expense > t.income && t.income > 0) score -= 15;
  return Math.max(0, Math.min(100, Math.round(score)));
}

export function renderDashboard() {
  const t = totals();
  const score = financialScore(t);
  $("kIncome").textContent = money(t.income);
  $("kExpense").textContent = money(t.expense);
  $("kBalance").textContent = money(t.balance);
  $("kScore").textContent = String(score);

  const level = score >= 70 ? "Saudável" : score >= 45 ? "Atenção" : "Crítico";
  $("dashboardSummary").innerHTML = `
    <div class="grid-4">
      <div class="alert"><b>Nível</b><p>${level}</p></div>
      <div class="alert"><b>Carteiras</b><p>${money(t.wallets)}</p></div>
      <div class="alert"><b>Economia</b><p>${t.income ? Math.round((t.balance / t.income) * 100) : 0}%</p></div>
      <div class="alert"><b>Mês</b><p>${currentTransactions().length} lançamentos</p></div>
    </div>
  `;

  const recent = currentTransactions().slice(0, 5);
  $("recentTransactions").innerHTML = recent.map((x) => `
    <div class="row">
      <div><b>${x.description}</b><small>${x.category} • ${x.date}</small></div>
      <span>${x.type === "income" ? "+" : "-"} ${money(x.amount)}</span>
    </div>
  `).join("") || `<div class="alert">Nenhum lançamento neste mês.</div>`;
}
