import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

export type ExpenseCategory = 'Food' | 'Transport' | 'Fun' | 'Other';

export type Expense = {
  id: string;
  category: ExpenseCategory;
  amount: number;
  timestamp: number;
  label: string;
};

type ExpenseContextValue = {
  expenses: Expense[];
  budget: number;
  isLoading: boolean;
  budgetInitialized: boolean;
  addExpense: (category: ExpenseCategory, amount: number, label: string) => void;
  deleteExpense: (id: string) => void;
  editExpense: (id: string, category: ExpenseCategory, amount: number, label: string) => void;
  setBudget: (value: number) => void;
  clearAllData: () => void;
};

type StoredData = {
  expenses: Expense[];
  budget: number;
  budgetInitialized: boolean;
};

const STORAGE_KEY = 'broke_or_not_data_v1';
const DEFAULT_BUDGET = 30;
const MAX_EXPENSES = 500;

const ExpenseContext = createContext<ExpenseContextValue | undefined>(undefined);

function isValidCategory(value: string): value is ExpenseCategory {
  return value === 'Food' || value === 'Transport' || value === 'Fun' || value === 'Other';
}

function sanitizeExpense(raw: Partial<Expense>): Expense | null {
  if (typeof raw.id !== 'string' || raw.id.length === 0) {
    return null;
  }
  if (typeof raw.category !== 'string' || !isValidCategory(raw.category)) {
    return null;
  }
  if (typeof raw.amount !== 'number' || !Number.isFinite(raw.amount) || raw.amount <= 0) {
    return null;
  }
  if (typeof raw.timestamp !== 'number' || !Number.isFinite(raw.timestamp)) {
    return null;
  }
  const label = typeof raw.label === 'string' ? raw.label.trim() : '';

  return {
    id: raw.id,
    category: raw.category,
    amount: Math.round(raw.amount * 100) / 100,
    timestamp: raw.timestamp,
    label,
  };
}

function sanitizeStoredData(raw: unknown): StoredData {
  if (typeof raw !== 'object' || raw === null) {
    return { expenses: [], budget: DEFAULT_BUDGET, budgetInitialized: false };
  }

  const data = raw as Partial<StoredData>;
  const expenses = Array.isArray(data.expenses)
    ? data.expenses
        .map((item) => sanitizeExpense(item as Partial<Expense>))
        .filter((item): item is Expense => item !== null)
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, MAX_EXPENSES)
    : [];

  const budget =
    typeof data.budget === 'number' && Number.isFinite(data.budget) && data.budget > 0
      ? Math.round(data.budget * 100) / 100
      : DEFAULT_BUDGET;

  const budgetInitialized = typeof data.budgetInitialized === 'boolean' ? data.budgetInitialized : false;

  return { expenses, budget, budgetInitialized };
}

export function ExpenseProvider({ children }: { children: React.ReactNode }) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [budget, setBudgetState] = useState(DEFAULT_BUDGET);
  const [budgetInitialized, setBudgetInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function hydrate() {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored) as unknown;
          const sanitized = sanitizeStoredData(parsed);
          setExpenses(sanitized.expenses);
          setBudgetState(sanitized.budget);
          setBudgetInitialized(sanitized.budgetInitialized);
        }
      } catch {
        setExpenses([]);
        setBudgetState(DEFAULT_BUDGET);
        setBudgetInitialized(false);
      } finally {
        setIsLoading(false);
      }
    }

    hydrate();
  }, []);

  useEffect(() => {
    if (isLoading) {
      return;
    }

    const payload: StoredData = {
      expenses,
      budget,
      budgetInitialized,
    };

    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(payload)).catch(() => {
      // Ignore write errors so the UI stays responsive.
    });
  }, [expenses, budget, budgetInitialized, isLoading]);

  const value = useMemo<ExpenseContextValue>(
    () => ({
      expenses,
      budget,
      isLoading,
      budgetInitialized,
      addExpense: (category, amount, label = '') => {
        if (!Number.isFinite(amount) || amount <= 0) {
          return;
        }

        const next: Expense = {
          id: `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
          category,
          amount: Math.round(amount * 100) / 100,
          timestamp: Date.now(),
          label: label.trim(),
        };

        setExpenses((current) => [next, ...current].slice(0, MAX_EXPENSES));
      },
      deleteExpense: (id) => {
        setExpenses((current) => current.filter((item) => item.id !== id));
      },
      editExpense: (id, category, amount, label = '') => {
        if (!Number.isFinite(amount) || amount <= 0) {
          return;
        }
        setExpenses((current) =>
          current.map((item) =>
            item.id === id
              ? { ...item, category, amount: Math.round(amount * 100) / 100, label: label.trim() }
              : item
          )
        );
      },
      setBudget: (value) => {
        if (!Number.isFinite(value) || value <= 0) {
          return;
        }
        setBudgetState(Math.round(value * 100) / 100);
        setBudgetInitialized(true);
      },
      clearAllData: () => {
        setExpenses([]);
        setBudgetState(DEFAULT_BUDGET);
        setBudgetInitialized(false);
      },
    }),
    [expenses, budget, budgetInitialized, isLoading],
  );

  return <ExpenseContext.Provider value={value}>{children}</ExpenseContext.Provider>;
}

export function useExpenses() {
  const context = useContext(ExpenseContext);
  if (!context) {
    throw new Error('useExpenses must be used inside ExpenseProvider');
  }
  return context;
}

export function getTodayTotal(expenses: Expense[]) {
  const today = new Date();
  const y = today.getFullYear();
  const m = today.getMonth();
  const d = today.getDate();

  return expenses
    .filter((expense) => {
      const date = new Date(expense.timestamp);
      return date.getFullYear() === y && date.getMonth() === m && date.getDate() === d;
    })
    .reduce((sum, item) => sum + item.amount, 0);
}

export function formatMoney(value: number) {
  return `$${value.toFixed(2)}`;
}

export function formatTime(timestamp: number) {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function formatDate(timestamp: number) {
  return new Date(timestamp).toLocaleDateString([], {
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateTime(timestamp: number) {
  const date = new Date(timestamp);
  const dateStr = date.toLocaleDateString([], {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
  });
  const timeStr = date.toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
  });
  return `${dateStr} at ${timeStr}`;
}

export function getBudgetStatus(total: number, budget: number) {
  const ratio = budget > 0 ? total / budget : 0;
  if (ratio < 0.75) {
    return { label: "You're good", color: '#4caf50', backgroundColor: '#0a1f0a' };
  }
  if (ratio < 1) {
    return { label: 'Getting close', color: '#ffb74d', backgroundColor: '#2c1f0a' };
  }
  return { label: 'Over budget', color: '#ef5350', backgroundColor: '#2c0a0a' };
}
