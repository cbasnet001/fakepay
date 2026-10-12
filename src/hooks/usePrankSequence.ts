import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState } from 'react-native';
import * as Haptics from 'expo-haptics';
import { createPrankSequence, type PrankState } from '../utils/prankSequence';
import { useSettings } from '../context/SettingsContext';

export function usePrankSequence() {
  const { settings } = useSettings();
  const [state, setState] = useState<PrankState>({ status: 'idle' });
  const controller = useRef<ReturnType<typeof createPrankSequence> | null>(null);

  useEffect(() => {
    const sequence = createPrankSequence(setState, () => {
      if (AppState.currentState === 'active') {
        void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {
          // Haptics are best-effort; the visual result remains usable.
        });
      }
    }, Math.random, settings);
    controller.current = sequence;
    sequence.start();
    const subscription = AppState.addEventListener('change', (next) => {
      // Cancel rather than finish a prank or vibrate while the phone is locked.
      if (next !== 'active') sequence.close();
    });
    return () => {
      subscription.remove();
      sequence.dispose();
      controller.current = null;
    };
  }, [settings]);

  const retry = useCallback(() => controller.current?.start(), []);
  const close = useCallback(() => controller.current?.close(), []);
  const retryScan = useCallback(() => controller.current?.retryScan(), []);
  const usePasscode = useCallback(() => controller.current?.usePasscode(), []);
  const tapDigit = useCallback(() => controller.current?.tapDigit(), []);
  const deleteDigit = useCallback(() => controller.current?.deleteDigit(), []);
  const cancelPasscode = useCallback(() => controller.current?.cancelPasscode(), []);
  return { state, retry, close, retryScan, usePasscode, tapDigit, deleteDigit, cancelPasscode };
}
