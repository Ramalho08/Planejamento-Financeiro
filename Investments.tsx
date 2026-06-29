import { useState } from 'react';
import type { FinanceStore } from '../services/useFinanceStore';

const brl = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export function Investments({ store }: { store: FinanceStore }) {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [rate, setRate] = useState('');

  const future = store.state.investments.reduce((sum, inv) => sum + inv.amount * Math.pow(1 + inv.monthlyRate / 100, 12), 0);

  return (
    <section className="grid">
      <article className="panel">
        <h3>Novo investimento</h3>
        <input placeholder="Nome" value={name} onChange={e => setName(e.target.value)} />
        <input placeholder="Valor atual" type="number" value={amount} onChange={e => setAmount(e.target.value)} />
        <input placeholder="% ao mês" type="number" value={rate} onChange={e => setRate(e.target.value)} />
        <button onClick={() => { store.addInvestment(name || 'Investimento', Number(amount || 0), Number(rate || 0)); setName(''); setAmount(''); setRate(''); }}>
          Adicionar
        </button>
      </article>

      <article className="panel">
        <h3>Carteira de investimentos</h3>
        <p>Projeção em 12 meses: <strong>{brl(future)}</strong></p>
        {store.state.investments.map(i => <div className="row" key={i.id}><strong>{i.name}</strong><span>{brl(i.amount)} • {i.monthlyRate}% mês</span></div>)}
      </article>
    </section>
  );
}
