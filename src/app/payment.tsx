import { useCallback, useRef } from 'react';
import { router, useFocusEffect } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { FictionalCard } from '../components/FictionalCard';
import { PrimaryButton } from '../components/PrimaryButton';
import { PrankStatus } from '../components/PrankStatus';
import { Screen } from '../components/Screen';
import { SimulationLabel } from '../components/SimulationLabel';
import { usePrankSequence } from '../hooks/usePrankSequence';
import { colors } from '../theme/tokens';

export default function PaymentScreen() {
  const { state, retry, close } = usePrankSequence();
  const opening = useRef(false);
  useFocusEffect(useCallback(() => { opening.current = false; }, []));
  const openPasscode = () => {
    if (opening.current) return;
    opening.current = true;
    router.push('/passcode');
  };
  const canRetry = state.status === 'error' || state.status === 'idle';
  const dismiss = () => {
    close();
    if (router.canGoBack()) router.back();
    else router.replace('/');
  };
  return <Screen>
    <View style={styles.header}><SimulationLabel /><Text style={styles.brand}>AUREL</Text></View>
    <View style={styles.card}><FictionalCard /></View>
    <View style={styles.status}><PrankStatus state={state} /></View>
    <View style={styles.actions}>
      {state.status === 'authenticating' && state.canUsePasscode && <Pressable accessibilityRole="button" accessibilityHint="Opens the fictional demo keypad" onPress={openPasscode} style={({ pressed }) => [styles.passcode, pressed && { opacity: 0.5 }]}><Text style={styles.passcodeText}>Passcode</Text></Pressable>}
      {canRetry && <PrimaryButton label="Try Again" accessibilityHint="Starts a new fictional payment simulation" onPress={retry} />}
      <Pressable accessibilityRole="button" accessibilityHint="Cancels this session and returns to your wallet" onPress={dismiss} style={({ pressed }) => [styles.close, pressed && { opacity: 0.5 }]}><Text style={styles.closeText}>Close</Text></Pressable>
    </View>
  </Screen>;
}
const styles = StyleSheet.create({
  header: { minHeight: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  brand: { color: colors.muted, fontSize: 10, letterSpacing: 3 },
  card: { paddingTop: 40 },
  status: { flexGrow: 1, justifyContent: 'center', paddingVertical: 36 },
  actions: { gap: 8, width: '100%', maxWidth: 260, alignSelf: 'center' },
  passcode: { minHeight: 44, paddingHorizontal: 24, borderRadius: 22, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center', alignSelf: 'center' },
  passcodeText: { color: colors.text, fontSize: 15 },
  close: { minHeight: 44, alignItems: 'center', justifyContent: 'center', padding: 12 },
  closeText: { color: colors.muted, fontSize: 14 },
});
