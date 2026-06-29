import { useCallback, useMemo, useState } from 'react';

export type Transaction = {
  id: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  month: string;
};

export type Wallet = {
  id: string;
  name: string;
  balance: number;
};

export type Card = {
  id: string;
  name: string;
  limit: number;
  dueDay: number;
};

export type Investment = {
  id: string;
  name: string;
  amount: number;
  monthlyRate: number;
};

export type Goal = {
  id: string;
  name: string;
  target: number;
  saved: number;
};

type State = {
  transactions: Transaction[];
  wallets: Wallet[];
  cards: Card[];
  investments: Investment[];
  goals: Goal[];
};

const emptyState: State = {
  transactions: [],
  wallets: [],
  cards: [],
  investments: [],
  goals: []
};

const key = 'ramalho_finance_enterprise_v11';

const currentMonth = () => new Date().toISOString().slice(0, 7);

export function useFinanceStore() {
  const [state, setState] = useState<State>(() => {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : emptyState;
  });

  const persist = useCallback((next: State) => {
    setState(next);
    localStorage.setItem(key, JSON.stringify(next));
  }, []);

  const addTransaction = useCallback((data: Omit<Transaction, 'id' | 'month'>) => {
    persist({
      ...state,
      transactions: [...state.transactions, { ...data, id: crypto.randomUUID(), month: currentMonth() }]
    });
  }, [state, persist]);

  const addWallet = useCallback((name: string, balance: number) => {
    persist({ ...state, wallets: [...state.wallets, { id: crypto.randomUUID(), name, balance }] });
  }, [state, persist]);

  const addCard = useCallback((name: string, limit: number, dueDay: number) => {
    persist({ ...state, cards: [...state.cards, { id: crypto.randomUUID(), name, limit, dueDay }] });
  }, [state, persist]);

  const addInvestment = useCallback((name: string, amount: number, monthlyRate: number) => {
    persist({ ...state, investments: [...state.investments, { id: crypto.randomUUID(), name, amount, monthlyRate }] });
  }, [state, persist]);

  const addGoal = useCallback((name: string, target: number, saved: number) => {
    persist({ ...state, goals: [...state.goals, { id: crypto.randomUUID(), name, target, saved }] });
  }, [state, persist]);

  const insertSampleData = useCallback(() => {
    const sample: State = {
      transactions: [
        { id: crypto.randomUUID(), description: 'Salário', amount: 1800, type: 'income', category: 'Trabalho', month: currentMonth() },
        { id: crypto.randomUUID(), description: 'Mercado', amount: 430, type: 'expense', category: 'Alimentação', month: currentMonth() },
        { id: crypto.randomUUID(), description: 'Transporte', amount: 180, type: 'expense', category: 'Transporte', month: currentMonth() }
      ],
      wallets: [{ id: crypto.randomUUID(), name: 'Nubank', balance: 1200 }],
      cards: [{ id: crypto.randomUUID(), name: 'Cartão principal', limit: 2000, dueDay: 10 }],
      investments: [{ id: crypto.randomUUID(), name: 'Reserva CDB', amount: 500, monthlyRate: 0.8 }],
      goals: [{ id: crypto.randomUUID(), name: 'Notebook', target: 5000, saved: 800 }]
    };
    persist(sample);
  }, [persist]);

  const metrics = useMemo(() => {
    const income = state.transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const expense = state.transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    const wallets = state.wallets.reduce((s, w) => s + w.balance, 0);
    const investments = state.investments.reduce((s, i) => s + i.amount, 0);
    const balance = income - expense;
    const netWorth = wallets + investments + balance;
    const savingRate = income > 0 ? Math.round((balance / income) * 100) : 0;
    return { income, expense, wallets, investments, balance, netWorth, savingRate };
  }, [state]);

  return {
    state,
    metrics,
    addTransaction,
    addWallet,
    addCard,
    addInvestment,
    addGoal,
    insertSampleData
  };
}

export type FinanceStore = ReturnType<typeof useFinanceStore>;
