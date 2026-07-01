export const $ = (id) => document.getElementById(id);

export function money(value) {
  return Number(value || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function today() {
  return new Date().toISOString().slice(0, 10);
}

export function month() {
  return new Date().toISOString().slice(0, 7);
}

export function id() {
  return crypto?.randomUUID ? crypto.randomUUID() : String(Date.now() + Math.random());
}

export function download(filename, content, type = "text/plain") {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export const categories = [
  "Salário", "Alimentação", "Transporte", "Moradia", "Saúde",
  "Educação", "Lazer", "Cartão", "Investimentos", "Assinaturas",
  "Pix", "Outros"
];
