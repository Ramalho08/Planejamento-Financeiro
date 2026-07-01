export const STORAGE_KEY = "rf2_foundation_state";

export const defaultState = () => ({
  version: "2.0 Foundation",
  theme: "dark",
  transactions: [],
  wallets: [],
  goals: [],
  settings: {
    currency: "BRL",
    cloudEnabled: false,
    aiMode: "local"
  }
});

export function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    return { ...defaultState(), ...JSON.parse(raw) };
  } catch {
    return defaultState();
  }
}

export function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function clearState() {
  localStorage.removeItem(STORAGE_KEY);
}
