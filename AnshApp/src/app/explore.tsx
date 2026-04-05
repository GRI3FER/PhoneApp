import React, { useMemo } from 'react';
import { Alert, Pressable, SafeAreaView, SectionList, StyleSheet, Text, View } from 'react-native';

import { CATEGORY_COLORS, ExpenseCategory, formatMoney, formatTime, useExpenses } from '@/context/expense-context';

type HistorySection = {
  title: string;
  total: number;
  data: {
    id: string;
    category: string;
    amount: number;
    timestamp: number;
    label: string;
  }[];
};

function formatDay(timestamp: number) {
  return new Date(timestamp).toLocaleDateString([], {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

export default function HistoryScreen() {
  const { expenses, budget, deleteExpense, isLoading } = useExpenses();

  const sections = useMemo<HistorySection[]>(() => {
    const grouped = new Map<string, HistorySection>();

    for (const expense of expenses) {
      const dayKey = new Date(expense.timestamp).toDateString();
      const existing = grouped.get(dayKey);

      if (existing) {
        existing.data.push(expense);
        existing.total += expense.amount;
      } else {
        grouped.set(dayKey, {
          title: formatDay(expense.timestamp),
          total: expense.amount,
          data: [expense],
        });
      }
    }

    return Array.from(grouped.values()).map((section) => ({
      ...section,
      data: section.data.sort((a, b) => b.timestamp - a.timestamp),
      total: Math.round(section.total * 100) / 100,
    }));
  }, [expenses]);

  const categoryTotals = useMemo(() => {
    const totals: Record<ExpenseCategory, number> = {
      Food: 0,
      Transport: 0,
      Groceries: 0,
      Fun: 0,
      Other: 0,
    };

    for (const expense of expenses) {
      totals[expense.category] += expense.amount;
    }

    return Object.entries(totals)
      .map(([category, amount]) => ({
        category: category as ExpenseCategory,
        amount: Math.round(amount * 100) / 100,
      }))
      .filter((item) => item.amount > 0)
      .sort((a, b) => b.amount - a.amount);
  }, [expenses]);

  const totalExpenses = categoryTotals.reduce((sum, item) => sum + item.amount, 0);

  function confirmDelete(id: string) {
    Alert.alert('Delete expense?', 'This action cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteExpense(id) },
    ]);
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.header}>History</Text>
        <Text style={styles.subHeader}>Tap an item to delete it.</Text>

        {!isLoading && categoryTotals.length > 0 && (
          <View style={styles.categoryBreakdownSection}>
            <Text style={styles.breakdownTitle}>Category Breakdown</Text>
            <View style={styles.categoryGrid}>
              {categoryTotals.map((item) => {
                const percentage = ((item.amount / totalExpenses) * 100).toFixed(1);
                const color = CATEGORY_COLORS[item.category];
                return (
                  <View key={item.category} style={styles.categoryItem}>
                    <View style={[styles.categoryDot, { backgroundColor: color }]} />
                    <View style={styles.categoryInfo}>
                      <Text style={styles.categoryName}>{item.category}</Text>
                      <Text style={styles.categoryAmount}>{formatMoney(item.amount)}</Text>
                    </View>
                    <Text style={styles.categoryPercentage}>{percentage}%</Text>
                  </View>
                );
              })}
            </View>

            {/* Storage UI Style Bar Chart */}
            <View style={styles.pieChartContainer}>
              <View style={styles.stackedBar}>
                {categoryTotals.map((item) => {
                  const percentage = (item.amount / budget) * 100;
                  const color = CATEGORY_COLORS[item.category];
                  return (
                    <View
                      key={item.category}
                      style={[
                        styles.stackedSegment,
                        {
                          backgroundColor: color,
                          flex: percentage,
                        },
                      ]}
                    />
                  );
                })}
                {/* Remaining budget as grey */}
                <View
                  style={[
                    styles.stackedSegment,
                    {
                      backgroundColor: '#475569',
                      flex: Math.max(0, ((budget - totalExpenses) / budget) * 100),
                    },
                  ]}
                />
              </View>
              <View style={styles.budgetLabels}>
                <Text style={styles.budgetUsed}>Used: {formatMoney(totalExpenses)}</Text>
                <Text style={styles.budgetRemaining}>
                  Left: {formatMoney(Math.max(0, budget - totalExpenses))}
                </Text>
              </View>
            </View>
          </View>
        )}

        {isLoading ? (
          <Text style={styles.mutedText}>Loading...</Text>
        ) : (
          <SectionList
            sections={sections}
            keyExtractor={(item) => item.id}
            stickySectionHeadersEnabled={false}
            contentContainerStyle={sections.length === 0 ? styles.emptyList : undefined}
            ListEmptyComponent={<Text style={styles.mutedText}>No expenses yet.</Text>}
            renderSectionHeader={({ section }) => (
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>{section.title}</Text>
                <Text style={styles.sectionTotal}>{formatMoney(section.total)}</Text>
              </View>
            )}
            renderItem={({ item }) => (
              <Pressable style={styles.rowCard} onPress={() => confirmDelete(item.id)}>
                <View style={{ flex: 1 }}>
                  <View style={styles.rowWithCategory}>
                    <View
                      style={[
                        styles.categoryIndicator,
                        { backgroundColor: CATEGORY_COLORS[item.category as ExpenseCategory] },
                      ]}
                    />
                    <Text style={styles.rowTitle}>{item.category}{item.label ? ' • ' + item.label : ''}</Text>
                  </View>
                  <Text style={styles.rowMeta}>{formatTime(item.timestamp)}</Text>
                </View>
                <Text style={styles.rowAmount}>{formatMoney(item.amount)}</Text>
              </Pressable>
            )}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0f172a',
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 20,
  },
  header: {
    color: '#f8fafc',
    fontSize: 28,
    fontWeight: '700',
  },
  subHeader: {
    color: '#cbd5e1',
    fontSize: 14,
    marginBottom: 12,
  },
  categoryBreakdownSection: {
    backgroundColor: '#111827',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#1f2937',
  },
  breakdownTitle: {
    color: '#e2e8f0',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 14,
  },
  categoryGrid: {
    marginBottom: 20,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#1f2937',
  },
  categoryDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginRight: 12,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    color: '#e2e8f0',
    fontSize: 15,
    fontWeight: '600',
  },
  categoryAmount: {
    color: '#94a3b8',
    fontSize: 13,
    marginTop: 2,
  },
  categoryPercentage: {
    color: '#cbd5e1',
    fontSize: 14,
    fontWeight: '700',
  },
  pieChartContainer: {
    alignItems: 'center',
    paddingVertical: 16,
    gap: 12,
  },
  stackedBar: {
    width: '100%',
    height: 40,
    borderRadius: 8,
    overflow: 'hidden',
    flexDirection: 'row',
    borderWidth: 2,
    borderColor: '#0f172a',
  },
  stackedSegment: {
    height: '100%',
  },
  budgetLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingHorizontal: 4,
  },
  budgetUsed: {
    color: '#cbd5e1',
    fontSize: 13,
    fontWeight: '600',
  },
  budgetRemaining: {
    color: '#94a3b8',
    fontSize: 13,
    fontWeight: '600',
  },
  totalExpensesLabel: {
    color: '#cbd5e1',
    fontSize: 13,
    fontWeight: '600',
  },
  pieChart: {
    width: 180,
    height: 180,
    borderRadius: 90,
    overflow: 'hidden',
    flexDirection: 'row',
    borderWidth: 2,
    borderColor: '#0f172a',
  },
  piePiece: {
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pieLabel: {
    fontSize: 12,
    fontWeight: '700',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 18,
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    color: '#e2e8f0',
    fontSize: 16,
    fontWeight: '700',
  },
  sectionTotal: {
    color: '#4caf50',
    fontWeight: '700',
    fontSize: 16,
  },
  rowCard: {
    backgroundColor: '#111827',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#1f2937',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  rowWithCategory: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  categoryIndicator: {
    width: 6,
    height: 20,
    borderRadius: 3,
    marginRight: 10,
  },
  rowTitle: {
    color: '#e2e8f0',
    fontWeight: '600',
    fontSize: 15,
  },
  rowMeta: {
    color: '#94a3b8',
    fontSize: 12,
    marginTop: 2,
  },
  rowAmount: {
    color: '#f8fafc',
    fontWeight: '700',
    fontSize: 15,
  },
  mutedText: {
    color: '#94a3b8',
  },
  emptyList: {
    paddingTop: 8,
  },
});
