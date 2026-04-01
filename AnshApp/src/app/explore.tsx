import React, { useMemo } from 'react';
import { Alert, Pressable, SafeAreaView, SectionList, StyleSheet, Text, View } from 'react-native';

import { formatMoney, formatTime, useExpenses } from '@/context/expense-context';

type HistorySection = {
  title: string;
  total: number;
  data: {
    id: string;
    category: string;
    amount: number;
    timestamp: number;
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
                <View>
                  <Text style={styles.rowTitle}>{item.category}</Text>
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
