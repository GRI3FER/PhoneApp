import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useColorScheme } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import AppTabs from '@/components/app-tabs';
import { ExpenseProvider } from '@/context/expense-context';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  return (
    <SafeAreaProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <ExpenseProvider>
          <AnimatedSplashOverlay />
          <AppTabs />
        </ExpenseProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
