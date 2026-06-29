import type { FinanceStore } from '../services/useFinanceStore';

export function Reports({ store }: { store: FinanceStore }) {
  const exportJson = () => {
    const blob = new Blob([JSON.stringify(store.state, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'ramalho-finance-backup.json';
    a.click();
  };

  const exportCsv = () => {
    const rows = ['Mes,Tipo,Categoria,Descricao,Valor'];
    store.state.transactions.forEach(t => rows.push(`${t.month},${t.type},${t.category},"${t.description}",${t.amount}`));
    const blob = new Blob([rows.join('\n')], { type: 'text/csv' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'ramalho-finance.csv';
    a.click();
  };

  return (
    <article className="panel">
      <h3>Relatórios</h3>
      <button onClick={exportCsv}>Exportar CSV</button>
      <button onClick={exportJson}>Backup JSON</button>
      <button onClick={() => window.print()}>PDF / Imprimir</button>
    </article>
  );
}
