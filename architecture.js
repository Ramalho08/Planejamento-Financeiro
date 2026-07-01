import { $ } from "./utils.js";

export function renderArchitecture() {
  const stages = [
    "Etapa 1: arquitetura limpa criada",
    "Etapa 2: navegação refeita e validada",
    "Etapa 3: estado centralizado com localStorage",
    "Etapa 4: módulos separados",
    "Etapa 5: relatórios, IA local e Cloud Ready preparados",
    "Etapa 6: validação de sintaxe concluída"
  ];

  const modules = [
    "app.js", "core.js", "storage.js", "navigation.js", "dashboard.js",
    "transactions.js", "wallets.js", "goals.js", "reports.js",
    "ai.js", "cloud.js", "architecture.js", "settings.js", "utils.js"
  ];

  $("stageList").innerHTML = stages.map((x) => `<div class="alert">${x}</div>`).join("");
  $("moduleList").innerHTML = modules.map((x) => `<div class="alert"><b>${x}</b><p>Módulo isolado e pronto para evolução.</p></div>`).join("");
}
