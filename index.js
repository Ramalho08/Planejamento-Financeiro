const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { setGlobalOptions } = require("firebase-functions/v2");
const logger = require("firebase-functions/logger");
const admin = require("firebase-admin");
const OpenAI = require("openai");
const { z } = require("zod");

admin.initializeApp();
setGlobalOptions({ region: "us-central1", maxInstances: 10, timeoutSeconds: 180, memory: "1GiB" });

const RequestSchema = z.object({
  filename: z.string().min(1).max(160),
  mimeType: z.string().default("application/pdf"),
  pdfBase64: z.string().min(100)
});

exports.analyzeStatement = onCall(async (request) => {
  if (!request.auth) {
    throw new HttpsError("unauthenticated", "Entre com Google para analisar extratos.");
  }

  const parsed = RequestSchema.safeParse(request.data);
  if (!parsed.success) {
    throw new HttpsError("invalid-argument", "Dados inválidos para análise.");
  }

  const { filename, mimeType, pdfBase64 } = parsed.data;

  if (!process.env.OPENAI_API_KEY) {
    throw new HttpsError("failed-precondition", "OPENAI_API_KEY não configurada nas Cloud Functions.");
  }

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const model = process.env.OPENAI_MODEL || "gpt-4.1-mini";

  const system = `
Você é uma IA financeira especialista em extratos bancários brasileiros.
Analise o PDF inteiro e devolva SOMENTE JSON válido.

Regras:
- Não inclua saldo anterior, saldo atual, limite, totais ou cabeçalhos como transações.
- R$ 1.234,56 deve virar 1234.56.
- Despesas: type="expense" e amount positivo.
- Receitas: type="income" e amount positivo.
- Categorias permitidas: Alimentação, Transporte, Moradia, Educação, Saúde, Lazer, Cartão, Investimentos, Pix, Assinaturas, Salário, Outros.
- Se não tiver certeza, use "Outros".
- Inclua confidence de 0 a 100.
- Inclua warnings se houver partes ilegíveis.
- Responda apenas JSON válido neste formato:
{
  "summary": {
    "bank": "string ou null",
    "accountHolder": "string ou null",
    "periodStart": "YYYY-MM-DD ou null",
    "periodEnd": "YYYY-MM-DD ou null",
    "income": 0,
    "expense": 0,
    "balanceStart": null,
    "balanceEnd": null,
    "calculatedDifference": null,
    "warnings": []
  },
  "transactions": [
    {
      "date": "YYYY-MM-DD",
      "description": "string",
      "amount": 0,
      "type": "income ou expense",
      "category": "categoria",
      "confidence": 0,
      "duplicateHint": false,
      "notes": "string"
    }
  ]
}
`;

  try {
    const response = await client.responses.create({
      model,
      input: [
        {
          role: "system",
          content: [{ type: "input_text", text: system }]
        },
        {
          role: "user",
          content: [
            { type: "input_text", text: `Analise este extrato bancário: ${filename}. Responda apenas JSON válido.` },
            { type: "input_file", filename, file_data: `data:${mimeType};base64,${pdfBase64}` }
          ]
        }
      ]
    });

    const text = response.output_text || "";
    let json;
    try {
      json = JSON.parse(text);
    } catch (err) {
      logger.error("JSON parse failed", { text });
      throw new HttpsError("internal", "A IA não retornou JSON válido.");
    }

    if (!Array.isArray(json.transactions)) json.transactions = [];
    json.transactions = json.transactions.map((tx) => ({
      date: tx.date || null,
      description: String(tx.description || "").slice(0, 160),
      amount: Math.abs(Number(tx.amount || 0)),
      type: tx.type === "income" ? "income" : "expense",
      category: tx.category || "Outros",
      confidence: Math.max(0, Math.min(100, Number(tx.confidence || 50))),
      duplicateHint: Boolean(tx.duplicateHint),
      notes: String(tx.notes || "").slice(0, 240)
    })).filter((tx) => tx.date && tx.description && tx.amount > 0);

    await admin.firestore()
      .collection("users")
      .doc(request.auth.uid)
      .collection("aiAnalyses")
      .add({
        filename,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        summary: json.summary || {},
        transactionCount: json.transactions.length
      });

    return json;
  } catch (err) {
    logger.error(err);
    if (err instanceof HttpsError) throw err;
    throw new HttpsError("internal", err.message || "Erro ao analisar extrato.");
  }
});
