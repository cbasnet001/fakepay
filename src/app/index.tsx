import { useCallback, useRef } from 'react';
import { router, useFocusEffect } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { FictionalCard } from '../components/FictionalCard';
import { PrimaryButton } from '../components/PrimaryButton';
import { Screen } from '../components/Screen';
import { SettingsIcon } from '../components/SettingsIcon';
import { SimulationLabel } from '../components/SimulationLabel';

export default function WalletScreen() {
  const opening = useRef(false);
  useFocusEffect(useCallback(() => { opening.current = false; }, []));
  const navigate = (route: '/payment' | '/settings') => {
    if (opening.current) return;
    opening.current = true;
    router.push(route);
  };
  return <Screen>
    <View style={styles.header}>
      <SimulationLabel />
      <Pressable accessibilityRole="button" accessibilityLabel="Settings" onPress={() => navigate('/settings')} style={({ pressed }) => [styles.settings, pressed && { opacity: 0.5 }]}><SettingsIcon /></Pressable>
    </View>
    <View style={styles.wallet}>
      <FictionalCard />
      <View style={styles.button}><PrimaryButton label="Continue" accessibilityHint="Starts a fictional payment simulation" onPress={() => navigate('/payment')} /></View>
    </View>
    <View style={styles.space} />
  </Screen>;
}
const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  settings: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  wallet: { paddingTop: 72, gap: 32 },
  button: { width: '100%', maxWidth: 240, alignSelf: 'center' },
  space: { flexGrow: 1, minHeight: 80 },
});
