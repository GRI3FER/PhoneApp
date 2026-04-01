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
} from 'react-native';

import {
  ExpenseCategory,
  formatMoney,
  formatTime,
  getBudgetStatus,
  getTodayTotal,
  useExpenses,
} from '@/context/expense-context';

const CATEGORIES: ExpenseCategory[] = ['Food', 'Coffee', 'Transport', 'Fun', 'Other'];

export default function HomeScreen() {
  const { expenses, budget, addExpense, isLoading } = useExpenses();
  const [selectedCategory, setSelectedCategory] = useState<ExpenseCategory | null>(null);
  const [amountInput, setAmountInput] = useState('');

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

  function onAddExpense() {
    if (!selectedCategory) {
      return;
    }

    const amount = Number.parseFloat(amountInput);
    if (!Number.isFinite(amount) || amount <= 0) {
      return;
    }

    addExpense(selectedCategory, amount);
    setAmountInput('');
    setSelectedCategory(null);
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.header}>Broke or Not?</Text>
        <Text style={styles.subHeader}>Today: {formatMoney(todayTotal)} / {formatMoney(budget)}</Text>

        <View style={styles.statusCard}>
          <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
        </View>

        <Text style={styles.sectionLabel}>Quick add</Text>
        <View style={styles.categoryWrap}>
          {CATEGORIES.map((category) => (
            <Pressable
              key={category}
              style={styles.categoryButton}
              onPress={() => setSelectedCategory(category)}>
              <Text style={styles.categoryButtonText}>{category}</Text>
            </Pressable>
          ))}
        </View>

        <Text style={styles.sectionLabel}>Today&apos;s expenses</Text>
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
                <View>
                  <Text style={styles.rowTitle}>{item.category}</Text>
                  <Text style={styles.rowMeta}>{formatTime(item.timestamp)}</Text>
                </View>
                <Text style={styles.rowAmount}>{formatMoney(item.amount)}</Text>
              </View>
            )}
          />
        )}

        <Modal visible={selectedCategory !== null} transparent animationType="fade">
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>Add {selectedCategory}</Text>
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
                  }}>
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </Pressable>
                <Pressable style={[styles.modalButton, styles.addButton]} onPress={onAddExpense}>
                  <Text style={styles.addButtonText}>Add</Text>
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
    gap: 6,
  },
  categoryButton: {
    backgroundColor: '#1d4ed8',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  categoryButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
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
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1f2937',
    gap: 12,
  },
  modalTitle: {
    color: '#f8fafc',
    fontSize: 18,
    fontWeight: '700',
  },
  input: {
    backgroundColor: '#111827',
    color: '#f8fafc',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#334155',
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'flex-end',
  },
  modalButton: {
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
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
  },
});
