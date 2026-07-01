import { $ } from "./utils.js";
import { currentTransactions, totals } from "./core.js";
import { financialScore } from "./dashboard.js";

export function renderAI() {
  const t = totals();
  const score = financialScore(t);
  const tx = currentTransactions();
  const level = score >= 70 ? "bom" : score >= 45 ? "atenção" : "crítico";
  const action = t.balance < 0
    ? "Reduzir despesas variáveis até o saldo ficar positivo."
    : "Separar parte do saldo para reserva, metas ou investimentos.";

  $("aiLocalBox").innerHTML = `
    <div class="alert">
      <b>Diagnóstico local:</b>
      <p>Seu score está ${score}/100, nível ${level}. Este mês possui ${tx.length} lançamento(s).</p>
    </div>
    <div class="alert"><b>Próxima ação:</b> ${action}</div>
  `;
}
