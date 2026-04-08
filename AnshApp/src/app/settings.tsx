/**
 * Settings Screen
 * 
 * Allows users to customize their daily budget and manage app data.
 * Features include:
 * - Edit daily budget with validation
 * - Clear all expenses and reset app to defaults
 * - Destructive action confirmations
 * 
 * UX Flow:
 * 1. User sees current daily budget value
 * 2. User can edit budget and tap Save
 * 3. Confirmation alert shows new budget amount
 * 4. User can tap Clear All Data for destructive actions
 * 5. Confirmation dialog prevents accidental data loss
 */

import { useEffect, useState } from 'react';
import { Alert, Pressable, SafeAreaView, StyleSheet, Text, TextInput, View } from 'react-native';

function sanitizeDecimalInput(text: string) {
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

  if (out.startsWith('.')) {
    out = `0${out}`;
  }

  return out;
}
import { formatMoney, useExpenses } from '@/context/expense-context';

// ============================================================================
// Component
// ============================================================================

export default function SettingsScreen() {
  const { budget, setBudget, clearAllData } = useExpenses();
  
  // State for budget input field
  const [budgetInput, setBudgetInput] = useState(budget.toFixed(2));
  
  // Sync local input when context budget changes
  useEffect(() => {
    setBudgetInput(budget.toFixed(2));
  }, [budget]);

  // =========================================================================
  // Event Handlers
  // =========================================================================

  /**
   * Validate and save new budget
   * Shows confirmation alert with new budget amount
   */
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

  /**
   * Show confirmation dialog before clearing all data
   * User must confirm twice: once in the dialog, once in AlertActionSheetIOS
   */
  function confirmClear() {
    Alert.alert('Clear all data?', 'This will remove all expenses and reset budget to default.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Clear', style: 'destructive', onPress: clearAllData },
    ]);
  }

  // =========================================================================
  // Rendering
  // =========================================================================

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.header}>Budget</Text>
        <Text style={styles.subHeader}>Set your daily budget and manage app data.</Text>

        <View style={styles.card}>
          <Text style={styles.label}>Daily budget</Text>
          <TextInput
            value={budgetInput}
            onChangeText={(text) => setBudgetInput(sanitizeDecimalInput(text))}
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
