import { useState } from 'react';
import type { FinanceStore } from '../services/useFinanceStore';

const brl = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export function Goals({ store }: { store: FinanceStore }) {
  const [name, setName] = useState('');
  const [target, setTarget] = useState('');
  const [saved, setSaved] = useState('');

  return (
    <section className="grid">
      <article className="panel">
        <h3>Nova meta</h3>
        <input placeholder="Nome da meta" value={name} onChange={e => setName(e.target.value)} />
        <input placeholder="Valor alvo" type="number" value={target} onChange={e => setTarget(e.target.value)} />
        <input placeholder="Já guardado" type="number" value={saved} onChange={e => setSaved(e.target.value)} />
        <button onClick={() => { store.addGoal(name || 'Meta', Number(target || 0), Number(saved || 0)); setName(''); setTarget(''); setSaved(''); }}>
          Criar meta
        </button>
      </article>

      <article className="panel">
        <h3>Metas</h3>
        {store.state.goals.map(g => {
          const pct = Math.min(100, Math.round((g.saved / g.target) * 100));
          return (
            <div className="goal" key={g.id}>
              <strong>{g.name}</strong>
              <span>{brl(g.saved)} de {brl(g.target)} • {pct}%</span>
              <div className="progress"><span style={{ width: `${pct}%` }} /></div>
            </div>
          );
        })}
      </article>
    </section>
  );
}
