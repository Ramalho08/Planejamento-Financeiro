import type { FinanceStore } from '../services/useFinanceStore';

const brl = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export function Assistant({ store }: { store: FinanceStore }) {
  const { metrics } = store;

  const tips = [
    metrics.income === 0 ? 'Cadastre sua renda para análises mais completas.' : '',
    metrics.balance < 0 ? 'Seu mês está negativo. Corte despesas variáveis primeiro.' : '',
    metrics.savingRate < 20 ? 'Tente guardar pelo menos 20% da renda.' : 'Ótimo ritmo de economia.',
    `Reserva ideal recomendada: ${brl(metrics.expense * 6)}.`
  ].filter(Boolean);

  return (
    <article className="panel">
      <h3>Assistente financeiro local</h3>
      {tips.map((tip, index) => <p className="alert" key={index}>{tip}</p>)}
    </article>
  );
}
