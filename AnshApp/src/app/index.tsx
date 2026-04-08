/**
 * Home Screen (Today Tab)
 * 
 * Displays today's spending status and provides quick expense entry.
 * Features include:
 * - Budget vs spending visualization (pie chart + color status)
 * - Quick category-based expense entry
 * - Inline expense editing and deletion
 * - Real-time budget updates
 * 
 * UX Flow:
 * 1. User sees today's spending and budget status at top
 * 2. User clicks category button to add expense
 * 3. Modal appears for amount and label input
 * 4. Expense added and visible in Today's Expenses list
 * 5. User can click pencil icon to edit, or swipe/long-press to delete
 */

import { useMemo, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Alert,
} from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  Expense,
  ExpenseCategory,
  CATEGORY_COLORS,
  getExpensesForDay,
  formatMoney,
  formatTime,
  getBudgetStatus,
  useExpenses,
} from '@/context/expense-context';

// ============================================================================
// Constants
// ============================================================================

/** List of all available expense categories */
const CATEGORIES: ExpenseCategory[] = ['Food', 'Transport', 'Groceries', 'Fun', 'Other'];

/** Placeholder text suggestions for each category's label input */
const LABEL_SUGGESTIONS: Record<ExpenseCategory, string> = {
  Food: 'e.g., Pizza, Ice Cream',
  Transport: 'e.g., Uber, Lyft',
  Groceries: 'e.g., Milk, Bread',
  Fun: 'e.g., Movie, Arcade',
  Other: 'e.g., Item name',
};

// ============================================================================
// Types
// ============================================================================

/** Type for the expense currently being edited (null when edit modal is closed) */
type EditingExpense = Expense | null;

// ============================================================================
// Input Helpers
// ============================================================================

function sanitizeDecimalInput(text: string) {
  // Keep only digits and a single decimal point.
  // Also normalize commas (some keyboards) to dots.
  const normalized = text.replace(/,/g, '.');
  let out = '';
  let hasDot = false;

  for (const ch of normalized) {
    if (ch >= '0' && ch <= '9') {
      out += ch;
      continue;
    }
    if (ch === '.' && !hasDot) {
      out += ch;
      hasDot = true;
    }
  }

  // If user starts with '.', help them by prefixing 0
  if (out.startsWith('.')) {
    out = `0${out}`;
  }

  return out;
}

// ============================================================================
// Component
// ============================================================================

export default function HomeScreen() {
  const { expenses, budget, addExpense, editExpense, deleteExpense, setBudget, budgetInitialized, isLoading } = useExpenses();
  const insets = useSafeAreaInsets();

  // State for initial budget setup
  const [budgetSetupAmount, setBudgetSetupAmount] = useState(budget.toFixed(2));

  // State for add expense modal
  const [selectedCategory, setSelectedCategory] = useState<ExpenseCategory | null>(null);
  const [amountInput, setAmountInput] = useState('');
  const [labelInput, setLabelInput] = useState('');

  // State for edit expense modal
  const [editingExpense, setEditingExpense] = useState<EditingExpense>(null);
  const [editAmount, setEditAmount] = useState('');
  const [editLabel, setEditLabel] = useState('');

  // =========================================================================
  // Computed Values
  // =========================================================================

  /** Filter expenses to only today's spending (for display) */
  const todayExpenses = useMemo(() => {
    return getExpensesForDay(expenses, Date.now());
  }, [expenses]);

  /** Calculate today's total spending */
  const todayTotal = useMemo(() => todayExpenses.reduce((sum, item) => sum + item.amount, 0), [todayExpenses]);

  /** Get budget status (color, label, background) based on spending */
  const status = getBudgetStatus(todayTotal, budget);

  /** Calculate percentage and color for pie chart (memoized) */
  const { percentSpent, pieColor } = useMemo(() => {
    const ratio = budget > 0 ? todayTotal / budget : 0;
    const spent = Math.min(ratio * 100, 100);
    let color = '#4caf50'; // green (< 75%)
    if (spent >= 75 && spent < 100) {
      color = '#ffb74d'; // yellow (75-99%)
    } else if (spent >= 100) {
      color = '#ef5350'; // red (100%+)
    }
    return { percentSpent: spent, pieColor: color };
  }, [todayTotal, budget]);

  // =========================================================================
  // Event Handlers
  // =========================================================================

  /**
   * Handle initial budget setup on first app launch
   * Validates input and calls setBudget from context
   */
  function onSetupBudget() {
    const value = Number.parseFloat(budgetSetupAmount);
    if (!Number.isFinite(value) || value <= 0) {
      return;
    }
    setBudget(value);
    setBudgetSetupAmount(value.toFixed(2));
  }

  /**
   * Add a new expense from the modal input
   * Validates category and amount before submitting
   */
  function onAddExpense() {
    if (!selectedCategory) {
      return;
    }

    const amount = Number.parseFloat(amountInput);
    if (!Number.isFinite(amount) || amount <= 0) {
      return;
    }

    addExpense(selectedCategory, amount, labelInput);
    setAmountInput('');
    setLabelInput('');
    setSelectedCategory(null);
  }

  /**
   * Open edit modal with current expense values
   * Populates form fields for editing
   */
  function onEditExpense(expense: Expense) {
    setEditingExpense(expense);
    setEditAmount(expense.amount.toString());
    setEditLabel(expense.label);
  }

  /**
   * Save edited expense with new values
   * Validates amount and updates via context
   */
  function onSaveEdit() {
    if (!editingExpense) return;

    const amount = Number.parseFloat(editAmount);
    if (!Number.isFinite(amount) || amount <= 0) {
      Alert.alert('Invalid', 'Please enter a valid amount');
      return;
    }

    editExpense(editingExpense.id, editingExpense.category, amount, editLabel);
    setEditingExpense(null);
  }

  /**
   * Delete an expense with confirmation dialog
   * Shows Alert asking user to confirm deletion
   */
  function onDeleteExpense(id: string) {
    Alert.alert('Delete', 'Remove this expense?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteExpense(id) },
    ]);
  }

  // =========================================================================
  // Rendering
  // =========================================================================

  // Show budget setup screen if budget hasn't been initialized yet
  if (!budgetInitialized) {
    return (
      <BudgetSetupScreen
        budgetSetupAmount={budgetSetupAmount}
        setBudgetSetupAmount={setBudgetSetupAmount}
        onSetupBudget={onSetupBudget}
        topInset={insets.top}
      />
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: status.backgroundColor, paddingTop: insets.top }]}>
      <View style={styles.container}>
        <StatusSection
          todayTotal={todayTotal}
          budget={budget}
          percentSpent={percentSpent}
          pieColor={pieColor}
          statusLabel={status.label}
        />

        <AddExpenseSection onSelectCategory={setSelectedCategory} />

        <TodayExpensesSection
          isLoading={isLoading}
          todayExpenses={todayExpenses}
          onEditExpense={onEditExpense}
        />

        <AddExpenseModal
          selectedCategory={selectedCategory}
          amountInput={amountInput}
          labelInput={labelInput}
          setAmountInput={setAmountInput}
          setLabelInput={setLabelInput}
          onCancel={() => {
            setSelectedCategory(null);
            setAmountInput('');
            setLabelInput('');
          }}
          onAddExpense={onAddExpense}
        />

        <EditExpenseModal
          editingExpense={editingExpense}
          editAmount={editAmount}
          setEditAmount={setEditAmount}
          editLabel={editLabel}
          setEditLabel={setEditLabel}
          onCancel={() => setEditingExpense(null)}
          onDelete={() => {
            if (editingExpense) {
              onDeleteExpense(editingExpense.id);
              setEditingExpense(null);
            }
          }}
          onSave={onSaveEdit}
        />
      </View>
    </SafeAreaView>
  );
}

function BudgetSetupScreen({
  budgetSetupAmount,
  setBudgetSetupAmount,
  onSetupBudget,
  topInset,
}: {
  budgetSetupAmount: string;
  setBudgetSetupAmount: (value: string) => void;
  onSetupBudget: () => void;
  topInset: number;
}) {
  return (
    <SafeAreaView style={[styles.safeArea, { paddingTop: topInset }]}>
      <View style={styles.container}>
        <Text style={styles.header}>Welcome!</Text>
        <Text style={styles.subHeader}>Let&apos;s set up your daily budget</Text>

        <View style={styles.setupCard}>
          <Text style={styles.setupLabel}>Daily Budget</Text>
          <Text style={styles.setupHint}>How much can you spend today?</Text>
          <TextInput
            value={budgetSetupAmount}
            onChangeText={(text) => setBudgetSetupAmount(sanitizeDecimalInput(text))}
            keyboardType="decimal-pad"
            placeholder="30.00"
            placeholderTextColor="#9ca3af"
            style={styles.setupInput}
          />
          <Pressable style={styles.primaryButton} onPress={onSetupBudget}>
            <Text style={styles.primaryButtonText}>Set Budget</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

function StatusSection({
  todayTotal,
  budget,
  percentSpent,
  pieColor,
  statusLabel,
}: {
  todayTotal: number;
  budget: number;
  percentSpent: number;
  pieColor: string;
  statusLabel: string;
}) {
  return (
    <>
      <Text style={styles.header}>Broke or Not?</Text>
      <Text style={styles.subHeader}>Today: {formatMoney(todayTotal)} / {formatMoney(budget)}</Text>

      <View style={styles.pieChartContainer}>
        <View style={styles.pieChart}>
          <View
            style={[
              styles.pieFilled,
              {
                backgroundColor: pieColor,
                width: percentSpent > 50 ? '100%' : `${percentSpent * 2}%`,
                height: percentSpent > 50 ? '100%' : `${percentSpent * 2}%`,
              },
            ]}
          />
          <View style={styles.pieInner}>
            <Text style={styles.pieText}>{Math.round(percentSpent)}%</Text>
          </View>
        </View>
        <Text style={[styles.statusTextLabel, { color: pieColor, marginTop: 12 }]}>
          {statusLabel}
        </Text>
      </View>
    </>
  );
}

function AddExpenseSection({ onSelectCategory }: { onSelectCategory: (category: ExpenseCategory) => void }) {
  return (
    <>
      <Text style={styles.sectionLabel}>ADD EXPENSE</Text>
      <View style={styles.categoryWrap}>
        {CATEGORIES.map((category) => (
          <Pressable
            key={category}
            style={[styles.categoryButton, { borderLeftColor: CATEGORY_COLORS[category], borderLeftWidth: 4 }]}
            onPress={() => onSelectCategory(category)}>
            <View style={styles.categoryButtonContent}>
              <View style={[styles.categoryButtonDot, { backgroundColor: CATEGORY_COLORS[category] }]} />
              <Text style={styles.categoryButtonText}>{category}</Text>
            </View>
          </Pressable>
        ))}
      </View>
    </>
  );
}

function TodayExpensesSection({
  isLoading,
  todayExpenses,
  onEditExpense,
}: {
  isLoading: boolean;
  todayExpenses: Expense[];
  onEditExpense: (expense: Expense) => void;
}) {
  return (
    <>
      <Text style={styles.sectionLabel}>TODAY&apos;S EXPENSES</Text>
      {isLoading ? (
        <Text style={styles.mutedText}>Loading...</Text>
      ) : (
        <FlatList
          data={todayExpenses}
          keyExtractor={(item) => item.id}
          contentContainerStyle={todayExpenses.length === 0 ? styles.emptyList : undefined}
          ListEmptyComponent={<Text style={styles.mutedText}>No expenses yet today.</Text>}
          renderItem={({ item }) => (
            <View style={styles.rowCard}>
              <View style={[styles.categoryIcon, { backgroundColor: CATEGORY_COLORS[item.category] }]} />
              <View style={styles.flex1}>
                <Text style={styles.rowTitle}>
                  {item.category}
                  {item.label ? ' • ' + item.label : ''}
                </Text>
                <Text style={styles.rowMeta}>{formatTime(item.timestamp)}</Text>
              </View>
              <Text style={styles.rowAmount}>{formatMoney(item.amount)}</Text>
              <TouchableOpacity style={styles.editButton} onPress={() => onEditExpense(item)}>
                <MaterialCommunityIcons name="pencil" size={18} color="#1d4ed8" />
              </TouchableOpacity>
            </View>
          )}
        />
      )}
    </>
  );
}

function AddExpenseModal({
  selectedCategory,
  amountInput,
  labelInput,
  setAmountInput,
  setLabelInput,
  onCancel,
  onAddExpense,
}: {
  selectedCategory: ExpenseCategory | null;
  amountInput: string;
  labelInput: string;
  setAmountInput: (value: string) => void;
  setLabelInput: (value: string) => void;
  onCancel: () => void;
  onAddExpense: () => void;
}) {
  return (
    <Modal visible={selectedCategory !== null} transparent animationType="fade">
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          {selectedCategory && (
            <>
              <View style={styles.modalHeader}>
                <View style={[styles.categoryHeaderDot, { backgroundColor: CATEGORY_COLORS[selectedCategory] }]} />
                <Text style={styles.modalTitle}>Add {selectedCategory}</Text>
              </View>

              <TextInput
                value={labelInput}
                onChangeText={setLabelInput}
                placeholder={LABEL_SUGGESTIONS[selectedCategory]}
                placeholderTextColor="#9ca3af"
                style={styles.input}
              />

              <View style={styles.amountDisplayContainer}>
                <Text style={styles.amountDisplayLabel}>Amount</Text>
                <Pressable style={styles.amountDisplayButton}>
                  <Text style={styles.amountDisplay}>${amountInput || '0.00'}</Text>
                </Pressable>
              </View>

              <TextInput
                value={amountInput}
                onChangeText={(text) => setAmountInput(sanitizeDecimalInput(text))}
                keyboardType="decimal-pad"
                placeholder="0.00"
                placeholderTextColor="#9ca3af"
                style={styles.input}
              />

              <View style={styles.modalActions}>
                <Pressable style={[styles.modalButton, styles.cancelButton]} onPress={onCancel}>
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </Pressable>
                <Pressable style={[styles.modalButton, styles.addButton]} onPress={onAddExpense}>
                  <Text style={styles.addButtonText}>Add Expense</Text>
                </Pressable>
              </View>
            </>
          )}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

function EditExpenseModal({
  editingExpense,
  editAmount,
  setEditAmount,
  editLabel,
  setEditLabel,
  onCancel,
  onDelete,
  onSave,
}: {
  editingExpense: EditingExpense;
  editAmount: string;
  setEditAmount: (value: string) => void;
  editLabel: string;
  setEditLabel: (value: string) => void;
  onCancel: () => void;
  onDelete: () => void;
  onSave: () => void;
}) {
  return (
    <Modal visible={editingExpense !== null} transparent animationType="fade">
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
        <View style={styles.modalCard}>
          <Text style={styles.modalTitle}>Edit {editingExpense?.category}</Text>
          <TextInput
            value={editLabel}
            onChangeText={setEditLabel}
            placeholder="Label"
            placeholderTextColor="#9ca3af"
            style={styles.input}
          />
          <TextInput
            value={editAmount}
            onChangeText={(text) => setEditAmount(sanitizeDecimalInput(text))}
            keyboardType="decimal-pad"
            placeholder="Amount"
            placeholderTextColor="#9ca3af"
            style={styles.input}
          />
          <View style={styles.modalActions}>
            <Pressable style={[styles.modalButton, styles.deleteButton]} onPress={onDelete}>
              <Text style={styles.deleteButtonText}>Delete</Text>
            </Pressable>
            <Pressable style={[styles.modalButton, styles.cancelButton]} onPress={onCancel}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </Pressable>
            <Pressable style={[styles.modalButton, styles.addButton]} onPress={onSave}>
              <Text style={styles.addButtonText}>Save</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  flex1: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#0a0e27',
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 20,
    gap: 14,
  },
  header: {
    color: '#ffffff',
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -0.5,
    textAlign: 'center',
    width: '100%',
  },
  subHeader: {
    color: '#a0aec0',
    fontSize: 13,
    textAlign: 'center',
    width: '100%',
  },

  sectionLabel: {
    color: '#e2e8f0',
    fontWeight: '600',
    fontSize: 14,
    marginTop: 10,
    marginBottom: 6,
  },
  categoryWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryButton: {
    backgroundColor: '#1d4ed8',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderLeftWidth: 4,
  },
  categoryButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  categoryButtonDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  categoryButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  categoryIcon: {
    width: 18,
    height: 18,
    borderRadius: 3,
    marginRight: 10,
  },
  rowCard: {
    backgroundColor: '#1f2937',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  rowTitle: {
    color: '#e2e8f0',
    fontWeight: '600',
  },
  rowMeta: {
    color: '#94a3b8',
    fontSize: 12,
  },
  rowAmount: {
    color: '#f8fafc',
    fontWeight: '700',
    fontSize: 16,
  },
  mutedText: {
    color: '#94a3b8',
  },
  emptyList: {
    paddingTop: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(2, 6, 23, 0.65)',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  modalCard: {
    backgroundColor: '#0b1220',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#1f2937',
    gap: 12,
  },
  modalTitle: {
    color: '#f8fafc',
    fontSize: 20,
    fontWeight: '700',
  },
  input: {
    backgroundColor: '#111827',
    color: '#f8fafc',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#334155',
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  modalButton: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#1f2937',
  },
  addButton: {
    backgroundColor: '#16a34a',
  },
  cancelButtonText: {
    color: '#e2e8f0',
    fontWeight: '600',
  },
  addButtonText: {
    color: '#f0fdf4',
    fontWeight: '700',
    fontSize: 16,
  },
  setupCard: {
    backgroundColor: '#111827',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1f2937',
    padding: 20,
    gap: 12,
  },
  setupLabel: {
    color: '#f8fafc',
    fontSize: 20,
    fontWeight: '700',
  },
  setupHint: {
    color: '#cbd5e1',
    fontSize: 14,
  },
  setupInput: {
    backgroundColor: '#0b1220',
    color: '#f8fafc',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#334155',
    paddingHorizontal: 12,
    paddingVertical: 14,
    fontSize: 18,
    fontWeight: '600',
  },
  primaryButton: {
    backgroundColor: '#1d4ed8',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  pieChartContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  pieChart: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#1f2937',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: '#0a0e27',
  },
  pieFilled: {
    position: 'absolute',
    borderRadius: 100,
  },
  pieInner: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#0a0e27',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  pieText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  statusTextLabel: {
    fontSize: 16,
    fontWeight: '700',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 16,
  },
  categoryHeaderDot: {
    width: 32,
    height: 32,
    borderRadius: 8,
  },
  amountDisplayContainer: {
    marginVertical: 20,
    alignItems: 'center',
    gap: 8,
  },
  amountDisplayLabel: {
    color: '#cbd5e1',
    fontSize: 14,
    fontWeight: '600',
  },
  amountDisplayButton: {
    backgroundColor: '#1f2937',
    borderRadius: 12,
    paddingHorizontal: 30,
    paddingVertical: 20,
    borderWidth: 1,
    borderColor: '#334155',
    width: '100%',
    alignItems: 'center',
  },
  amountDisplay: {
    color: '#f8fafc',
    fontSize: 36,
    fontWeight: '700',
  },
  editButton: {
    paddingHorizontal: 8,
    paddingVertical: 8,
    marginLeft: 8,
  },
  deleteButton: {
    backgroundColor: '#ef5350',
  },
  deleteButtonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
});
