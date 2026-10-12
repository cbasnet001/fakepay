import { useCallback, useRef, useState } from 'react';
import { useFocusEffect } from 'expo-router';
import { Animated, AppState, Easing, Pressable, StyleSheet, Text, View, useAnimatedValue } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { useSettings } from '../context/SettingsContext';
import { createDemoPasscode } from '../utils/demoPasscode';

const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'delete'];

export function DemoPasscode({ onCancel }: { onCancel: () => void }) {
  const [entry, setEntry] = useState({ filled: 0, locked: false });
  const controller = useRef<ReturnType<typeof createDemoPasscode> | null>(null);
  const shake = useAnimatedValue(0);
  const reduced = useReducedMotion();
  const { settings } = useSettings();

  useFocusEffect(useCallback(() => {
    let animation: Animated.CompositeAnimation | undefined;
    const sequence = createDemoPasscode((filled, locked) => setEntry({ filled, locked }), () => {
      if (AppState.currentState !== 'active') { sequence.reset(); return; }
      if (settings.haptics) {
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      }
      // Respect Reduce Motion while preserving the short input lock and reset.
      animation = Animated.sequence([8, -8, 6, -6, 3, 0].map((offset, index) =>
        Animated.timing(shake, {
          toValue: reduced === false ? offset : 0,
          duration: index < 2 ? 70 : 65,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        })));
      animation.start(({ finished }) => { if (finished) sequence.finishShake(); });
    });
    controller.current = sequence;
    sequence.reset();
    const stop = () => {
      animation?.stop();
      shake.setValue(0);
      sequence.reset();
    };
    const subscription = AppState.addEventListener('change', (next) => { if (next !== 'active') stop(); });
    return () => {
      subscription.remove();
      sequence.dispose();
      animation?.stop();
      shake.setValue(0);
      controller.current = null;
    };
  }, [reduced, settings.haptics, shake]));

  const cancel = () => {
    controller.current?.dispose();
    onCancel();
  };

  return <View style={styles.content}>
    <View style={styles.center}>
      <Text accessibilityRole="header" style={styles.title}>Demo Passcode</Text>
      <Text style={styles.note}>Use six made-up digits.</Text>
      <Animated.View style={[styles.dots, { transform: [{ translateX: shake }] }]}
        accessible accessibilityLabel={`${entry.filled} of 6 demo digits entered`} accessibilityLiveRegion="polite">
        {Array.from({ length: 6 }, (_, index) => <View key={index} style={[styles.dot, index < entry.filled && styles.filled]} />)}
      </Animated.View>
      <View style={styles.keypad}>
        {keys.map((key) => key === '' ? <View key="spacer" style={styles.keySlot} /> : <View key={key} style={styles.keySlot}>
          <Pressable accessibilityRole="button" accessibilityLabel={key === 'delete' ? 'Delete last demo digit' : key}
            disabled={entry.locked || (key === 'delete' && entry.filled === 0)}
            onPress={() => key === 'delete' ? controller.current?.delete() : controller.current?.tap()}
            style={({ pressed }) => [styles.key, pressed && styles.pressed]}>
            <Text style={[styles.digit, key === 'delete' && styles.delete]}>{key === 'delete' ? '⌫' : key}</Text>
          </Pressable>
        </View>)}
      </View>
    </View>
    <Pressable accessibilityRole="button" accessibilityHint="Returns to the simulated Face ID screen" onPress={cancel}
      style={({ pressed }) => [styles.cancel, pressed && { opacity: 0.5 }]}><Text style={styles.cancelText}>Cancel</Text></Pressable>
  </View>;
}
const styles = StyleSheet.create({
  content: { flexGrow: 1, alignItems: 'center' },
  center: { flexGrow: 1, width: '100%', alignItems: 'center', justifyContent: 'center', paddingVertical: 28 },
  title: { color: '#252525', fontSize: 23, fontWeight: '400', letterSpacing: -0.4 },
  note: { color: '#747474', fontSize: 12, marginTop: 12 },
  dots: { flexDirection: 'row', gap: 19, paddingVertical: 32 },
  dot: { width: 11, height: 11, borderRadius: 6, borderWidth: 1, borderColor: '#777777' },
  filled: { backgroundColor: '#505050', borderColor: '#505050' },
  keypad: { width: '100%', maxWidth: 300, flexDirection: 'row', flexWrap: 'wrap', rowGap: 12 },
  keySlot: { width: '33.333333%', alignItems: 'center' },
  key: { width: 72, height: 72, borderRadius: 36, backgroundColor: '#E6E6E8', alignItems: 'center', justifyContent: 'center' },
  pressed: { backgroundColor: '#D4D4D7', transform: [{ scale: 0.96 }] },
  digit: { color: '#303030', fontSize: 28, fontWeight: '300', fontVariant: ['tabular-nums'] },
  delete: { fontSize: 24 },
  cancel: { minHeight: 44, minWidth: 80, justifyContent: 'center', alignItems: 'center', marginTop: 20 },
  cancelText: { color: '#646464', fontSize: 14 },
});
