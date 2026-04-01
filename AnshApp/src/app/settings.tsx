import React, { useState } from 'react';
import { Alert, Pressable, SafeAreaView, StyleSheet, Text, TextInput, View } from 'react-native';

import { formatMoney, useExpenses } from '@/context/expense-context';

export default function SettingsScreen() {
  const { budget, setBudget, clearAllData } = useExpenses();
  const [budgetInput, setBudgetInput] = useState(budget.toFixed(2));

  function saveBudget() {
    const value = Number.parseFloat(budgetInput);
    if (!Number.isFinite(value) || value <= 0) {
      Alert.alert('Invalid budget', 'Please enter a valid positive number.');
      return;
    }

    setBudget(value);
    setBudgetInput(value.toFixed(2));
    Alert.alert('Saved', `Daily budget set to ${formatMoney(value)}.`);
  }

  function confirmClear() {
    Alert.alert('Clear all data?', 'This will remove all expenses and reset budget to default.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear', style: 'destructive', onPress: clearAllData },
    ]);
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.header}>Settings</Text>
        <Text style={styles.subHeader}>Set your daily budget and manage app data.</Text>

        <View style={styles.card}>
          <Text style={styles.label}>Daily budget</Text>
          <TextInput
            value={budgetInput}
            onChangeText={setBudgetInput}
            keyboardType="decimal-pad"
            placeholder="30.00"
            placeholderTextColor="#94a3b8"
            style={styles.input}
          />
          <Pressable style={styles.primaryButton} onPress={saveBudget}>
            <Text style={styles.primaryButtonText}>Save Budget</Text>
          </Pressable>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Danger zone</Text>
          <Pressable style={styles.dangerButton} onPress={confirmClear}>
            <Text style={styles.dangerButtonText}>Clear All Data</Text>
          </Pressable>
        </View>
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
    gap: 14,
  },
  header: {
    color: '#f8fafc',
    fontSize: 28,
    fontWeight: '700',
  },
  subHeader: {
    color: '#cbd5e1',
    fontSize: 14,
  },
  card: {
    backgroundColor: '#111827',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1f2937',
    padding: 14,
    gap: 10,
  },
  label: {
    color: '#e2e8f0',
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#0b1220',
    color: '#f8fafc',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#334155',
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  primaryButton: {
    backgroundColor: '#2563eb',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#eff6ff',
    fontWeight: '700',
  },
  dangerButton: {
    backgroundColor: '#b91c1c',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  dangerButtonText: {
    color: '#fee2e2',
    fontWeight: '700',
  },
});
