/**
 * History Screen (Explore Tab)
 * 
 * Displays all expenses organized by date with spending analytics.
 * Features include:
 * - Expenses grouped by date (most recent first)
 * - Category breakdown with pie chart visualization
 * - Storage UI style budget bar (used vs remaining)
 * - Tap to delete functionality with confirmation
 * 
 * UX Flow:
 * 1. User sees category breakdown at top (list + stacked bar chart)
 * 2. Bar shows spending proportions with remaining budget as grey
 * 3. User scrolls through expenses grouped by date
 * 4. User can tap any expense to delete it with confirmation
 */

import { useMemo, useState } from 'react';
import { Alert, Pressable, SafeAreaView, SectionList, StyleSheet, Text, View } from 'react-native';

import { CATEGORY_COLORS, ExpenseCategory, formatMoney, formatTime, useExpenses } from '@/context/expense-context';
import { toLocalDayKey } from '@/utils/date';

// ============================================================================
// Types
// ============================================================================

/** Section type for grouped expenses by date */
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

// ============================================================================
// Helpers
// ============================================================================

/**
 * Format a timestamp as a readable date
 * Example: 1712310000000 → "Mon, Apr 5"
 */
function formatDay(timestamp: number) {
  return new Date(timestamp).toLocaleDateString([], {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

// ============================================================================
// Component
// ============================================================================

export default function HistoryScreen() {
  const { expenses, budget, deleteExpense, isLoading } = useExpenses();

  // =========================================================================
  // Computed Values
  // =========================================================================

  /**
   * Group all expenses by date for section list rendering
   * Expenses within each day are sorted newest first
   */
  const sections = useMemo<HistorySection[]>(() => {
    const grouped = new Map<string, HistorySection>();

    for (const expense of expenses) {
      const dayKey = toLocalDayKey(expense.timestamp);
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

  /**
   * Calculate total spending per category for breakdown visualization
   * Used for both list and pie chart display
   */
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
  const safeBudget = budget > 0 ? budget : 1;
  const isOverBudget = totalExpenses > budget;
  const overBudgetBy = Math.max(0, totalExpenses - budget);
  const [stackedBarWidth, setStackedBarWidth] = useState(0);

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
                const percentage = ((item.amount / safeBudget) * 100).toFixed(1);
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
              <View style={[styles.stackedBar, isOverBudget ? styles.stackedBarOver : null]}>
                <View
                  style={styles.stackedBarInner}
                  onLayout={(e) => {
                    const nextWidth = Math.round(e.nativeEvent.layout.width);
                    if (nextWidth > 0 && nextWidth !== stackedBarWidth) setStackedBarWidth(nextWidth);
                  }}>
                  {(() => {
                    // Use rounded pixel boundaries to prevent sub-pixel seams.
                    // Compute each segment's left/right from cumulative ratio.
                    let runningRatio = 0;
                    return categoryTotals.map((item) => {
                      const ratio = item.amount / safeBudget;
                      const clamped = Math.max(0, Math.min(1 - runningRatio, ratio));
                      const nextRunning = Math.min(1, runningRatio + clamped);

                      const leftPx = stackedBarWidth > 0 ? Math.round(runningRatio * stackedBarWidth) : 0;
                      const rightPx = stackedBarWidth > 0 ? Math.round(nextRunning * stackedBarWidth) : 0;
                      const widthPx = Math.max(0, rightPx - leftPx);

                      runningRatio = nextRunning;

                      if (stackedBarWidth <= 0 || widthPx <= 0) return null;

                      return (
                        <View
                          key={item.category}
                          style={[
                            styles.stackedSegment,
                            {
                              backgroundColor: CATEGORY_COLORS[item.category],
                              left: leftPx,
                              width: widthPx,
                            },
                          ]}
                        />
                      );
                    });
                  })()}
                </View>
              </View>
              <View style={styles.budgetLabels}>
                <Text style={styles.budgetUsed}>Used: {formatMoney(totalExpenses)}</Text>
                <Text style={styles.budgetTotal}>Budget: {formatMoney(budget)}</Text>
              </View>
              {isOverBudget && (
                <Text style={styles.overBudgetText}>Over by {formatMoney(overBudgetBy)}</Text>
              )}
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
                <View style={styles.sectionHeaderRight}>
                  <Text
                    style={[
                      styles.sectionTotal,
                      section.total > budget ? styles.sectionTotalOver : null,
                    ]}>
                    {formatMoney(section.total)}
                  </Text>
                  {section.total > budget && (
                    <Text style={styles.sectionOverBy}>Over by {formatMoney(section.total - budget)}</Text>
                  )}
                </View>
              </View>
            )}
            renderItem={({ item }) => {
              // Validate category to prevent crash from corrupted data
              const categoryColor = CATEGORY_COLORS[item.category as ExpenseCategory] || '#95A5A6';
              return (
                <Pressable style={styles.rowCard} onPress={() => confirmDelete(item.id)}>
                  <View style={styles.flex1}>
                    <View style={styles.rowWithCategory}>
                      <View
                        style={[
                          styles.categoryIndicator,
                          { backgroundColor: categoryColor },
                        ]}
                      />
                      <Text style={styles.rowTitle}>{item.category}{item.label ? ' • ' + item.label : ''}</Text>
                    </View>
                    <Text style={styles.rowMeta}>{formatTime(item.timestamp)}</Text>
                  </View>
                  <Text style={styles.rowAmount}>{formatMoney(item.amount)}</Text>
                </Pressable>
              );
            }}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex1: {
    flex: 1,
  },
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
    alignItems: 'stretch',
    paddingVertical: 16,
    gap: 12,
  },
  stackedBar: {
    width: '100%',
    alignSelf: 'stretch',
    height: 40,
    borderRadius: 8,
    position: 'relative',
    borderWidth: 2,
    borderColor: '#0f172a',
  },
  stackedBarInner: {
    flex: 1,
    overflow: 'hidden',
    borderRadius: 6,
    backgroundColor: '#475569',
  },
  stackedBarOver: {
    borderColor: '#ef5350',
  },
  stackedSegment: {
    position: 'absolute',
    top: 0,
    bottom: 0,
  },
  budgetLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingHorizontal: 4,
    width: '100%',
    alignSelf: 'stretch',
  },
  budgetUsed: {
    color: '#cbd5e1',
    fontSize: 13,
    fontWeight: '600',
  },
  budgetTotal: {
    color: '#cbd5e1',
    fontSize: 13,
    fontWeight: '600',
  },
  overBudgetText: {
    color: '#ef5350',
    fontSize: 13,
    fontWeight: '700',
    width: '100%',
    alignSelf: 'stretch',
    textAlign: 'center',
    paddingHorizontal: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 18,
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  sectionHeaderRight: {
    alignItems: 'flex-end',
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
  sectionTotalOver: {
    color: '#ef5350',
  },
  sectionOverBy: {
    color: '#ef5350',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 2,
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
    textAlign: 'center',
    width: '100%',
  },
  emptyList: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 8,
  },
});
