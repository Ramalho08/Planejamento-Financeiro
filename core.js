import { loadState, saveState } from "./storage.js";
import { month } from "./utils.js";

export const store = {
  state: loadState(),
  listeners: new Set(),

  subscribe(fn) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  },

  emit() {
    saveState(this.state);
    this.listeners.forEach((fn) => fn(this.state));
  },

  setTheme(theme) {
    this.state.theme = theme;
    this.emit();
  },

  addTransaction(tx) {
    this.state.transactions.unshift(tx);
    this.emit();
  },

  removeTransaction(id) {
    this.state.transactions = this.state.transactions.filter((x) => x.id !== id);
    this.emit();
  },

  addWallet(wallet) {
    this.state.wallets.unshift(wallet);
    this.emit();
  },

  removeWallet(id) {
    this.state.wallets = this.state.wallets.filter((x) => x.id !== id);
    this.emit();
  },

  addGoal(goal) {
    this.state.goals.unshift(goal);
    this.emit();
  },

  removeGoal(id) {
    this.state.goals = this.state.goals.filter((x) => x.id !== id);
    this.emit();
  }
};

export function currentTransactions() {
  return store.state.transactions.filter((x) => (x.date || "").slice(0, 7) === month());
}

export function totals() {
  const tx = currentTransactions();
  const income = tx.filter((x) => x.type === "income").reduce((s, x) => s + Number(x.amount || 0), 0);
  const expense = tx.filter((x) => x.type === "expense").reduce((s, x) => s + Number(x.amount || 0), 0);
  const wallets = store.state.wallets.reduce((s, x) => s + Number(x.balance || 0), 0);
  return { income, expense, balance: income - expense, wallets };
}
