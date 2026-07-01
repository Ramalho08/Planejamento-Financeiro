import { $, id, money } from "./utils.js";
import { store } from "./core.js";

export function initGoals() {
  $("addGoalBtn")?.addEventListener("click", () => {
    const name = $("goalName").value.trim();
    const target = Number($("goalTarget").value || 0);
    const saved = Number($("goalSaved").value || 0);
    if (!name || target <= 0) return alert("Preencha a meta e o valor alvo.");
    store.addGoal({ id: id(), name, target, saved });
    $("goalName").value = "";
    $("goalTarget").value = "";
    $("goalSaved").value = "";
  });

  document.addEventListener("click", (ev) => {
    const btn = ev.target.closest("[data-remove-goal]");
    if (btn) store.removeGoal(btn.dataset.removeGoal);
  });
}

export function renderGoals() {
  $("goalList").innerHTML = store.state.goals.map((x) => {
    const pct = x.target ? Math.min(100, Math.round((x.saved / x.target) * 100)) : 0;
    return `
      <div class="alert">
        <b>${x.name}</b>
        <p>${money(x.saved)} de ${money(x.target)} • ${pct}%</p>
        <div class="progress"><span style="width:${pct}%"></span></div>
        <button data-remove-goal="${x.id}">Excluir</button>
      </div>
    `;
  }).join("") || `<div class="alert">Nenhuma meta criada.</div>`;
}
