import { useState } from 'react';
import type { FinanceStore } from '../services/useFinanceStore';

const brl = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export function Cards({ store }: { store: FinanceStore }) {
  const [name, setName] = useState('');
  const [limit, setLimit] = useState('');
  const [dueDay, setDueDay] = useState('');

  return (
    <section className="grid">
      <article className="panel">
        <h3>Novo cartão</h3>
        <input placeholder="Nome do cartão" value={name} onChange={e => setName(e.target.value)} />
        <input placeholder="Limite" type="number" value={limit} onChange={e => setLimit(e.target.value)} />
        <input placeholder="Dia de vencimento" type="number" value={dueDay} onChange={e => setDueDay(e.target.value)} />
        <button onClick={() => { store.addCard(name || 'Cartão', Number(limit || 0), Number(dueDay || 1)); setName(''); setLimit(''); setDueDay(''); }}>
          Adicionar cartão
        </button>
      </article>

      <article className="panel">
        <h3>Cartões</h3>
        {store.state.cards.map(c => (
          <div className="row" key={c.id}>
            <strong>{c.name}</strong>
            <span>{brl(c.limit)} • vence dia {c.dueDay}</span>
          </div>
        ))}
      </article>
    </section>
  );
}
