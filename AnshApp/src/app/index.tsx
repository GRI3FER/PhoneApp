import React, { useMemo, useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
  TouchableOpacity,
  Alert,
} from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

import {
  ExpenseCategory,
  CATEGORY_COLORS,
  formatMoney,
  formatTime,
  getBudgetStatus,
  getTodayTotal,
  useExpenses,
} from '@/context/expense-context';

const CATEGORIES: ExpenseCategory[] = ['Food', 'Transport', 'Groceries', 'Fun', 'Other'];

const LABEL_SUGGESTIONS: Record<ExpenseCategory, string> = {
  Food: 'e.g., Pizza, Ice Cream',
  Transport: 'e.g., Uber, Lyft',
  Groceries: 'e.g., Milk, Bread',
  Fun: 'e.g., Movie, Arcade',
  Other: 'e.g., Item name',
};

type EditingExpense = {
  id: string;
  category: ExpenseCategory;
  amount: number;
  label: string;
} | null;

export default function HomeScreen() {
  const { expenses, budget, addExpense, editExpense, deleteExpense, setBudget, budgetInitialized, isLoading } = useExpenses();
  const [budgetSetupAmount, setBudgetSetupAmount] = useState(budget.toFixed(2));
  const [selectedCategory, setSelectedCategory] = useState<ExpenseCategory | null>(null);
  const [amountInput, setAmountInput] = useState('');
  const [labelInput, setLabelInput] = useState('');
  const [editingExpense, setEditingExpense] = useState<EditingExpense>(null);
  const [editAmount, setEditAmount] = useState('');
  const [editLabel, setEditLabel] = useState('');

  const todayExpenses = useMemo(() => {
    const now = new Date();
    return expenses.filter((expense) => {
      const date = new Date(expense.timestamp);
      return (
        date.getFullYear() === now.getFullYear() &&
        date.getMonth() === now.getMonth() &&
        date.getDate() === now.getDate()
      );
    });
  }, [expenses]);

  const todayTotal = getTodayTotal(expenses);
  const status = getBudgetStatus(todayTotal, budget);
  const percentSpent = Math.min((todayTotal / budget) * 100, 100);
  const percentRemaining = 100 - percentSpent;

  // Determine pie chart color based on percentage
  let pieColor = '#4caf50'; // green
  if (percentSpent >= 75 && percentSpent < 100) {
    pieColor = '#ffb74d'; // yellow
  } else if (percentSpent >= 100) {
    pieColor = '#ef5350'; // red
  }

  function onSetupBudget() {
    const value = Number.parseFloat(budgetSetupAmount);
    if (!Number.isFinite(value) || value <= 0) {
      return;
    }
    setBudget(value);
  }

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

  function onEditExpense(expense: any) {
    setEditingExpense(expense);
    setEditAmount(expense.amount.toString());
    setEditLabel(expense.label);
  }

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

  function onDeleteExpense(id: string) {
    Alert.alert('Delete', 'Remove this expense?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteExpense(id) },
    ]);
  }

  if (!budgetInitialized) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <Text style={styles.header}>Welcome!</Text>
          <Text style={styles.subHeader}>Let&apos;s set up your daily budget</Text>

          <View style={styles.setupCard}>
            <Text style={styles.setupLabel}>Daily Budget</Text>
            <Text style={styles.setupHint}>How much can you spend today?</Text>
            <TextInput
              value={budgetSetupAmount}
              onChangeText={setBudgetSetupAmount}
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

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: status.backgroundColor }]}>
      <View style={styles.container}>
        <Text style={styles.header}>Broke or Not?</Text>
        <Text style={styles.subHeader}>Today: {formatMoney(todayTotal)} / {formatMoney(budget)}</Text>

        {/* Pie Chart */}
        <View style={styles.pieChartContainer}>
          <View style={styles.pieChart}>
            {/* Filled portion */}
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
            {/* Inner circle (hole in center) */}
            <View style={styles.pieInner}>
              <Text style={styles.pieText}>{Math.round(percentSpent)}%</Text>
            </View>
          </View>
          <Text style={[styles.statusTextLabel, { color: pieColor, marginTop: 12 }]}>
            {status.label}
          </Text>
        </View>

        <Text style={styles.sectionLabel}>ADD EXPENSE</Text>
        <View style={styles.categoryWrap}>
          {CATEGORIES.map((category) => (
            <Pressable
              key={category}
              style={[styles.categoryButton, { borderLeftColor: CATEGORY_COLORS[category], borderLeftWidth: 4 }]}
              onPress={() => setSelectedCategory(category)}>
              <View style={styles.categoryButtonContent}>
                <View
                  style={[
                    styles.categoryButtonDot,
                    { backgroundColor: CATEGORY_COLORS[category] },
                  ]}
                />
                <Text style={styles.categoryButtonText}>{category}</Text>
              </View>
            </Pressable>
          ))}
        </View>

        <Text style={styles.sectionLabel}>TODAY'S EXPENSES</Text>
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
                <View style={{ flex: 1 }}>
                  <Text style={styles.rowTitle}>{item.category}{item.label ? ' • ' + item.label : ''}</Text>
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

        <Modal visible={selectedCategory !== null} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              {selectedCategory && (
                <>
                  <View style={styles.modalHeader}>
                    <View
                      style={[
                        styles.categoryHeaderDot,
                        { backgroundColor: CATEGORY_COLORS[selectedCategory] },
                      ]}
                    />
                    <Text style={styles.modalTitle}>Add {selectedCategory}</Text>
                  </View>

                  <TextInput
                    value={labelInput}
                    onChangeText={setLabelInput}
                    placeholder={LABEL_SUGGESTIONS[selectedCategory]}
                    placeholderTextColor="#9ca3af"
                    style={styles.input}
                  />

                  {/* Large Amount Display Button */}
                  <View style={styles.amountDisplayContainer}>
                    <Text style={styles.amountDisplayLabel}>Amount</Text>
                    <Pressable style={styles.amountDisplayButton}>
                      <Text style={styles.amountDisplay}>
                        ${amountInput || '0.00'}
                      </Text>
                    </Pressable>
                  </View>

                  <TextInput
                    value={amountInput}
                    onChangeText={setAmountInput}
                    keyboardType="decimal-pad"
                    placeholder="0.00"
                    placeholderTextColor="#9ca3af"
                    style={styles.input}
                  />

                  <View style={styles.modalActions}>
                    <Pressable
                      style={[styles.modalButton, styles.cancelButton]}
                      onPress={() => {
                        setSelectedCategory(null);
                        setAmountInput('');
                        setLabelInput('');
                      }}>
                      <Text style={styles.cancelButtonText}>Cancel</Text>
                    </Pressable>
                    <Pressable style={[styles.modalButton, styles.addButton]} onPress={onAddExpense}>
                      <Text style={styles.addButtonText}>Add Expense</Text>
                    </Pressable>
                  </View>
                </>
              )}
            </View>
          </View>
        </Modal>

        {/* Edit Modal */}
        <Modal visible={editingExpense !== null} transparent animationType="fade">
          <View style={styles.modalOverlay}>
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
                onChangeText={setEditAmount}
                keyboardType="decimal-pad"
                placeholder="Amount"
                placeholderTextColor="#9ca3af"
                style={styles.input}
              />
              <View style={styles.modalActions}>
                <Pressable
                  style={[styles.modalButton, styles.deleteButton]}
                  onPress={() => {
                    if (editingExpense) {
                      onDeleteExpense(editingExpense.id);
                      setEditingExpense(null);
                    }
                  }}>
                  <Text style={styles.deleteButtonText}>Delete</Text>
                </Pressable>
                <Pressable
                  style={[styles.modalButton, styles.cancelButton]}
                  onPress={() => setEditingExpense(null)}>
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </Pressable>
                <Pressable style={[styles.modalButton, styles.addButton]} onPress={onSaveEdit}>
                  <Text style={styles.addButtonText}>Save</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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
  },
  subHeader: {
    color: '#a0aec0',
    fontSize: 13,
  },
  statusCard: {
    backgroundColor: '#1f2937',
    borderRadius: 12,
    paddingVertical: 20,
    alignItems: 'center',
    borderWidth: 0,
  },
  statusText: {
    fontSize: 28,
    fontWeight: '900',
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
