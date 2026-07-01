import { $ } from "./utils.js";

export function renderCloud() {
  $("cloudChecklist").innerHTML = `
    <div class="alert"><b>1.</b> Criar projeto Firebase.</div>
    <div class="alert"><b>2.</b> Ativar Login Google.</div>
    <div class="alert"><b>3.</b> Criar backend para OpenAI/Gemini.</div>
    <div class="alert"><b>4.</b> Testar PDF/OCR isolado.</div>
    <div class="alert"><b>5.</b> Integrar importação real com revisão.</div>
  `;
}
