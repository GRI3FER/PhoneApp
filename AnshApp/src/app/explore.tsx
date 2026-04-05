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
  const { expenses, deleteExpense, isLoading } = useExpenses();

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

            {/* Simple Pie Chart */}
            <View style={styles.pieChartContainer}>
              <View style={styles.pieChart}>
                {categoryTotals.map((item, index) => {
                  const percentage = (item.amount / totalExpenses) * 100;
                  const angle = (percentage / 100) * 360;
                  const color = CATEGORY_COLORS[item.category];
                  return (
                    <View
                      key={item.category}
                      style={[
                        styles.piePiece,
                        {
                          backgroundColor: color,
                          transform: [
                            { rotate: `${(index * 360) / categoryTotals.length}deg` },
                          ],
                          width: `${percentage}%`,
                        },
                      ]}>
                      {percentage > 10 && (
                        <Text
                          style={[
                            styles.pieLabel,
                            { color: percentage > 15 ? '#000' : 'transparent' },
                          ]}>
                          {percentage.toFixed(0)}%
                        </Text>
                      )}
                    </View>
                  );
                })}
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
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#1f2937',
  },
  breakdownTitle: {
    color: '#e2e8f0',
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  categoryGrid: {
    marginBottom: 16,
  },
  categoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#1f2937',
  },
  categoryDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 10,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    color: '#e2e8f0',
    fontSize: 14,
    fontWeight: '600',
  },
  categoryAmount: {
    color: '#94a3b8',
    fontSize: 12,
  },
  categoryPercentage: {
    color: '#cbd5e1',
    fontSize: 13,
    fontWeight: '600',
  },
  pieChartContainer: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  pieChart: {
    width: 160,
    height: 160,
    borderRadius: 80,
    overflow: 'hidden',
    flexDirection: 'row',
  },
  piePiece: {
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pieLabel: {
    fontSize: 11,
    fontWeight: '700',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
    marginBottom: 8,
  },
  sectionTitle: {
    color: '#e2e8f0',
    fontSize: 15,
    fontWeight: '600',
  },
  sectionTotal: {
    color: '#22c55e',
    fontWeight: '700',
  },
  rowCard: {
    backgroundColor: '#111827',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
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
    width: 4,
    height: 16,
    borderRadius: 2,
    marginRight: 8,
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
});
