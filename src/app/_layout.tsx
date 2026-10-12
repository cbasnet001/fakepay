import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { SettingsProvider } from '../context/SettingsContext';
import { colors } from '../theme/tokens';
import { useReducedMotion } from '../hooks/useReducedMotion';

export default function RootLayout() {
  const reducedMotion = useReducedMotion();
  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <SettingsProvider>
        <Stack screenOptions={{ headerShown: false, animation: reducedMotion === false ? 'fade' : 'none', contentStyle: { backgroundColor: colors.background } }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="payment" />
          <Stack.Screen name="passcode" />
          <Stack.Screen name="passid" />
          <Stack.Screen name="settings" />
        </Stack>
      </SettingsProvider>
    </SafeAreaProvider>
  );
}
