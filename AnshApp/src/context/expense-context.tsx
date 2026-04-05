/**
 * Expense Context and State Management
 * 
 * This module provides global state management for the expense tracker app
 * using React Context API and AsyncStorage for persistence.
 * 
 * Key features:
 * - Centralized expense and budget state
 * - Automatic persistence to AsyncStorage
 * - Input validation and data sanitization
 * - Utility functions for formatting and calculations
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

// ============================================================================
// Types & Interfaces
// ============================================================================

/** Supported expense categories */
export type ExpenseCategory = 'Food' | 'Transport' | 'Fun' | 'Groceries' | 'Other';

/** Single expense record */
export type Expense = {
  id: string;
  category: ExpenseCategory;
  amount: number;
  timestamp: number;
  label: string;
};

/** Context value type for type-safe hook usage */
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

/** Data persisted to AsyncStorage */
type StoredData = {
  expenses: Expense[];
  budget: number;
  budgetInitialized: boolean;
};

// ============================================================================
// Constants
// ============================================================================

/** AsyncStorage key for app data */
const STORAGE_KEY = 'broke_or_not_data_v1';

/** Default daily budget in dollars */
const DEFAULT_BUDGET = 30;

/** Maximum number of expenses to store (prevents excessive data) */
const MAX_EXPENSES = 500;

/** Budget status thresholds - ratio of spending to budget */
const BUDGET_THRESHOLD_YELLOW = 0.75; // 75% - "Getting close"
const BUDGET_THRESHOLD_RED = 1.0;    // 100% - "Over budget"

// ============================================================================
// Context & Validation
// ============================================================================

const ExpenseContext = createContext<ExpenseContextValue | undefined>(undefined);

/**
 * Type guard to validate category strings
 * Ensures only valid categories are accepted
 */
function isValidCategory(value: string): value is ExpenseCategory {
  return value === 'Food' || value === 'Transport' || value === 'Fun' || value === 'Groceries' || value === 'Other';
}

/**
 * Validates and sanitizes expense objects from storage
 * Prevents data corruption and type mismatches
 * 
 * @param raw - Partial expense object (potentially corrupted)
 * @returns Validated Expense or null if invalid
 */
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

/**
 * Validates and reconstructs stored data with defaults
 * Ensures app doesn't crash if storage is corrupted
 * 
 * @param raw - Raw stored data (potentially corrupted)
 * @returns Valid StoredData with fallbacks to defaults
 */
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

// ============================================================================
// Provider Component
// ============================================================================

/**
 * ExpenseProvider
 * 
 * Wraps the app to provide global expense state management.
 * Handles data persistence to AsyncStorage and state initialization.
 */
export function ExpenseProvider({ children }: { children: React.ReactNode }) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [budget, setBudgetState] = useState(DEFAULT_BUDGET);
  const [budgetInitialized, setBudgetInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load data from AsyncStorage when app starts
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
        // Fallback to defaults if storage is corrupted
        setExpenses([]);
        setBudgetState(DEFAULT_BUDGET);
        setBudgetInitialized(false);
      } finally {
        setIsLoading(false);
      }
    }

    hydrate();
  }, []);

  // Auto-save to AsyncStorage whenever data changes (debounced to after load)
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
      // Silently ignore write errors to keep UI responsive
    });
  }, [expenses, budget, budgetInitialized, isLoading]);

  // Memoized context value to prevent unnecessary re-renders
  const value = useMemo<ExpenseContextValue>(
    () => ({
      expenses,
      budget,
      isLoading,
      budgetInitialized,

      /**
       * Add a new expense
       * Generates unique ID and validates amount
       */
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

      /**
       * Delete an expense by ID
       */
      deleteExpense: (id) => {
        setExpenses((current) => current.filter((item) => item.id !== id));
      },

      /**
       * Update an existing expense
       */
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

      /**
       * Set the daily budget
       * Marks budget as initialized on first set
       */
      setBudget: (value) => {
        if (!Number.isFinite(value) || value <= 0) {
          return;
        }
        setBudgetState(Math.round(value * 100) / 100);
        setBudgetInitialized(true);
      },

      /**
       * Clear all expenses and reset budget to default
       * Used for data cleanup
       */
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

// ============================================================================
// Hooks
// ============================================================================

/**
 * Custom hook to access expense context
 * Throws error if used outside ExpenseProvider
 */
export function useExpenses() {
  const context = useContext(ExpenseContext);
  if (!context) {
    throw new Error('useExpenses must be used inside ExpenseProvider');
  }
  return context;
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Calculate total spending for today
 * Used for budget comparisons on home screen
 */
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

/**
 * Format a number as USD currency
 * Example: 12.5 → "$12.50"
 */
export function formatMoney(value: number) {
  return `$${value.toFixed(2)}`;
}

/**
 * Format timestamp as time only
 * Example: "3:45 PM"
 */
export function formatTime(timestamp: number) {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
  });
}

/**
 * Get budget status with color and message
 * Returns different status based on spending threshold
 * 
 * @param total - Current spending
 * @param budget - Daily budget limit
 * @returns Status object with label, color, and background color
 */
export function getBudgetStatus(total: number, budget: number) {
  const ratio = budget > 0 ? total / budget : 0;
  if (ratio < BUDGET_THRESHOLD_YELLOW) {
    return { label: "You're good", color: '#4caf50', backgroundColor: '#0a1f0a' };
  }
  if (ratio < BUDGET_THRESHOLD_RED) {
    return { label: 'Getting close', color: '#ffb74d', backgroundColor: '#2c1f0a' };
  }
  return { label: 'Over budget', color: '#ef5350', backgroundColor: '#2c0a0a' };
}

// ============================================================================
// Constants & Theme
// ============================================================================

/**
 * Category colors for visual consistency
 * Used in pie charts, category indicators, and list items
 */
export const CATEGORY_COLORS: Record<ExpenseCategory, string> = {
  Food: '#FF6B6B',
  Transport: '#4ECDC4',
  Groceries: '#95E1D3',
  Fun: '#FFE66D',
  Other: '#95A5A6',
};

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

/**
 * Format a number as USD currency
 * Example: 12.5 → "$12.50"
 */
export function formatMoney(value: number) {
  return `$${value.toFixed(2)}`;
}

/**
 * Format timestamp as time only
 * Example: "3:45 PM"
 */
export function formatTime(timestamp: number) {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function getBudgetStatus(total: number, budget: number) {
  const ratio = budget > 0 ? total / budget : 0;
  if (ratio < BUDGET_THRESHOLD_YELLOW) {
    return { label: "You're good", color: '#4caf50', backgroundColor: '#0a1f0a' };
  }
  if (ratio < BUDGET_THRESHOLD_RED) {
    return { label: 'Getting close', color: '#ffb74d', backgroundColor: '#2c1f0a' };
  }
  return { label: 'Over budget', color: '#ef5350', backgroundColor: '#2c0a0a' };
}

export const CATEGORY_COLORS: Record<ExpenseCategory, string> = {
  Food: '#FF6B6B',
  Transport: '#4ECDC4',
  Groceries: '#95E1D3',
  Fun: '#FFE66D',
  Other: '#95A5A6',
};
