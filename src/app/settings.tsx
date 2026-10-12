import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Screen } from '../components/Screen';
import { SettingChoice } from '../components/SettingChoice';
import { SimulationLabel } from '../components/SimulationLabel';
import { useSettings } from '../context/SettingsContext';
import { authenticationDelays, errorOptions } from '../utils/prankSettings';
import { colors } from '../theme/tokens';

export default function SettingsScreen() {
  const { settings, updateSettings, saveStatus } = useSettings();
  return <Screen>
    <View style={styles.header}><SimulationLabel /><Pressable accessibilityRole="button" onPress={() => router.canGoBack() ? router.back() : router.replace('/')} style={styles.done}><Text style={styles.doneText}>Done</Text></Pressable></View>
    <Text accessibilityRole="header" style={styles.title}>Settings</Text>
    <Text style={styles.sectionTitle}>Error selection</Text>
    <View style={styles.group} accessibilityRole="radiogroup" accessibilityLabel="Error selection">
      {errorOptions.map((error, index) => <SettingChoice key={error} label={error} selected={settings.error === error} last={index === errorOptions.length - 1} onPress={() => updateSettings({ error })} />)}
    </View>
    <Text style={styles.sectionTitle}>Authentication delay</Text>
    <View style={styles.group} accessibilityRole="radiogroup" accessibilityLabel="Authentication delay">
      {authenticationDelays.map((authenticationDelay, index) => <SettingChoice key={authenticationDelay} label={`${authenticationDelay} seconds`} selected={settings.authenticationDelay === authenticationDelay} last={index === authenticationDelays.length - 1} onPress={() => updateSettings({ authenticationDelay })} />)}
    </View>
    <Text style={styles.sectionTitle}>Haptic feedback</Text>
    <View style={styles.group} accessibilityRole="radiogroup" accessibilityLabel="Haptic feedback">
      <SettingChoice label="On" selected={settings.haptics} onPress={() => updateSettings({ haptics: true })} />
      <SettingChoice label="Off" selected={!settings.haptics} last onPress={() => updateSettings({ haptics: false })} />
    </View>
    <Text accessibilityLiveRegion="polite" style={styles.note}>{saveStatus === 'saving' ? 'Saving…' : saveStatus === 'error' ? 'Preferences could not be loaded or saved. Tap an option to retry saving.' : 'Saved on this iPhone.'}</Text>
  </Screen>;
}
const styles = StyleSheet.create({
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  done: { minHeight: 44, minWidth: 44, alignItems: 'flex-end', justifyContent: 'center' },
  doneText: { color: colors.text, fontSize: 15 },
  title: { color: colors.text, fontSize: 28, fontWeight: '500', letterSpacing: -0.6, marginTop: 24, marginBottom: 4 },
  sectionTitle: { color: colors.muted, fontSize: 12, marginTop: 28, marginBottom: 12, paddingHorizontal: 4 },
  group: { backgroundColor: colors.surface, borderRadius: 14, overflow: 'hidden' },
  note: { color: colors.muted, fontSize: 12, textAlign: 'center', lineHeight: 18, marginTop: 28, marginBottom: 12 },
});
