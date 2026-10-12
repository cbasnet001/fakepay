import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { defaultSettings, parseSettings, type PrankSettings } from '../utils/prankSettings';
import { colors } from '../theme/tokens';

const storageKey = '@fakepay/settings/v1';
type SettingsContextValue = {
  settings: PrankSettings;
  updateSettings: (patch: Partial<PrankSettings>) => void;
  saveStatus: 'saved' | 'saving' | 'error';
};
const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState(defaultSettings);
  const [ready, setReady] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SettingsContextValue['saveStatus']>('saved');
  const current = useRef(defaultSettings);
  const writes = useRef(Promise.resolve());
  const revision = useRef(0);
  const mounted = useRef(false);

  useEffect(() => {
    let active = true;
    mounted.current = true;
    void AsyncStorage.getItem(storageKey).then((raw) => {
      if (!active) return;
      const loaded = parseSettings(raw);
      current.current = loaded;
      setSettings(loaded);
    }).catch(() => { if (active) setSaveStatus('error'); }).finally(() => {
      if (active) setReady(true);
    });
    return () => { active = false; mounted.current = false; };
  }, []);

  const updateSettings = (patch: Partial<PrankSettings>) => {
    const next = { ...current.current, ...patch };
    current.current = next;
    setSettings(next);
    setSaveStatus('saving');
    const version = ++revision.current;
    // Serialize writes so rapid selection changes cannot persist out of order.
    writes.current = writes.current.then(() => AsyncStorage.setItem(storageKey, JSON.stringify(next)))
      .then(() => { if (mounted.current && version === revision.current) setSaveStatus('saved'); })
      .catch(() => { if (mounted.current && version === revision.current) setSaveStatus('error'); });
  };

  if (!ready) return <View style={styles.loading}><ActivityIndicator color={colors.muted} accessibilityLabel="Loading preferences" /></View>;
  return <SettingsContext.Provider value={{ settings, updateSettings, saveStatus }}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  const value = useContext(SettingsContext);
  if (!value) throw new Error('useSettings must be used inside SettingsProvider');
  return value;
}
const styles = StyleSheet.create({ loading: { flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' } });
