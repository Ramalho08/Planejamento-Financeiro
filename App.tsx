import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, CreditCard, Goal, Home, LineChart, PiggyBank, Wallet } from 'lucide-react';
import { Dashboard } from './pages/Dashboard';
import { Finance } from './pages/Finance';
import { Cards } from './pages/Cards';
import { Investments } from './pages/Investments';
import { Goals } from './pages/Goals';
import { Assistant } from './pages/Assistant';
import { Reports } from './pages/Reports';
import { useFinanceStore } from './services/useFinanceStore';

const pages = [
  { id: 'dashboard', label: 'Dashboard', icon: Home },
  { id: 'finance', label: 'Financeiro', icon: Wallet },
  { id: 'cards', label: 'Cartões', icon: CreditCard },
  { id: 'investments', label: 'Investimentos', icon: LineChart },
  { id: 'goals', label: 'Metas', icon: Goal },
  { id: 'assistant', label: 'Assistente IA', icon: PiggyBank },
  { id: 'reports', label: 'Relatórios', icon: BarChart3 }
] as const;

type Page = typeof pages[number]['id'];

export default function App() {
  const [page, setPage] = useState<Page>('dashboard');
  const [logged, setLogged] = useState(() => localStorage.getItem('rf_logged') === 'true');
  const store = useFinanceStore();

  const content = useMemo(() => {
    if (page === 'dashboard') return <Dashboard store={store} />;
    if (page === 'finance') return <Finance store={store} />;
    if (page === 'cards') return <Cards store={store} />;
    if (page === 'investments') return <Investments store={store} />;
    if (page === 'goals') return <Goals store={store} />;
    if (page === 'assistant') return <Assistant store={store} />;
    return <Reports store={store} />;
  }, [page, store]);

  if (!logged) {
    return (
      <main className="login-screen">
        <motion.section className="login-card" initial={{ opacity: 0, y: 25 }} animate={{ opacity: 1, y: 0 }}>
          <div className="big-logo">R💰</div>
          <h1>Ramalho Finance Enterprise</h1>
          <p>Seu sistema financeiro pessoal profissional.</p>
          <button onClick={() => { localStorage.setItem('rf_logged', 'true'); setLogged(true); }}>
            Entrar no modo local
          </button>
          <button className="google" onClick={() => alert('Firebase será configurado depois.')}>
            Entrar com Google
          </button>
        </motion.section>
      </main>
    );
  }

  return (
    <main className="app">
      <aside className="sidebar">
        <div className="brand">
          <div className="logo">R💰</div>
          <div>
            <h1>Ramalho Finance</h1>
            <span>Enterprise V11</span>
          </div>
        </div>

        <nav>
          {pages.map(item => {
            const Icon = item.icon;
            return (
              <button key={item.id} className={page === item.id ? 'active' : ''} onClick={() => setPage(item.id)}>
                <Icon size={18} /> {item.label}
              </button>
            );
          })}
        </nav>

        <button className="logout" onClick={() => { localStorage.removeItem('rf_logged'); setLogged(false); }}>
          Sair
        </button>
      </aside>

      <section className="workspace">
        <header className="topbar">
          <div>
            <h2>{pages.find(p => p.id === page)?.label}</h2>
            <p>{new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}</p>
          </div>
          <button onClick={() => store.insertSampleData()}>Dados de exemplo</button>
        </header>
        {content}
      </section>
    </main>
  );
}
