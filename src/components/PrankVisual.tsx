import { useEffect } from 'react';
import { Animated, Easing, StyleSheet, Text, View, useAnimatedValue } from 'react-native';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { colors } from '../theme/tokens';
import { FaceScanIcon } from './FaceScanIcon';
import { ReaderIcon } from './ReaderIcon';
import type { PrankState } from '../utils/prankSequence';

type Props = { status: PrankState['status']; attempt?: number };
export function PrankVisual({ status, attempt }: Props) {
  const motion = useAnimatedValue(0);
  const reduced = useReducedMotion();
  useEffect(() => {
    motion.setValue(0);
    if (reduced !== false || status === 'error' || status === 'idle') return;
    if (status === 'authenticating') {
      // Each fade takes 650ms; the two eased halves form a continuous breath.
      const animation = Animated.loop(Animated.sequence([
        Animated.timing(motion, { toValue: 1, duration: 650, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        Animated.timing(motion, { toValue: 0, duration: 650, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
      ]));
      animation.start();
      return () => animation.stop();
    }
    const pulsing = status === 'readyForReader';
    const animation = Animated.loop(Animated.timing(motion, { toValue: 1, duration: pulsing ? 2000 : 1400, easing: pulsing ? Easing.inOut(Easing.sin) : Easing.linear, useNativeDriver: true }));
    animation.start();
    return () => animation.stop();
  }, [motion, reduced, status, attempt]);
  return <View style={[styles.stage, status === 'authenticating' && styles.faceStage]} accessible={false} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
    {status === 'error' || status === 'idle'
      ? <View style={styles.circle}><Text style={styles.mark}>{status === 'error' ? '!' : 'Ⅱ'}</Text></View>
      : status === 'authenticating'
        ? <Animated.View style={{ opacity: reduced !== false ? 1 : motion.interpolate({ inputRange: [0, 1], outputRange: [1, 0.65] }), transform: [{ scale: reduced !== false ? 1 : motion.interpolate({ inputRange: [0, 1], outputRange: [1, 1.06] }) }] }}><FaceScanIcon size={96} /></Animated.View>
        : status === 'readyForReader'
          ? <Animated.View style={{ opacity: reduced !== false ? 1 : motion.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.55, 1, 0.55] }), transform: [{ scale: reduced !== false ? 1 : motion.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.97, 1, 0.97] }) }] }}><ReaderIcon /></Animated.View>
        : <Animated.View style={[styles.circle, styles.spinner, styles.processing, { transform: [{ rotate: motion.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] }) }] }]} />}
  </View>;
}
const styles = StyleSheet.create({
  stage: { width: 88, height: 88, alignItems: 'center', justifyContent: 'center' },
  faceStage: { width: 124, height: 124 },
  circle: { width: 52, height: 52, borderRadius: 26, borderWidth: 1, borderColor: '#505050', alignItems: 'center', justifyContent: 'center' },
  spinner: { borderColor: '#252525', borderTopColor: '#B8B8B8', borderRightColor: '#737373' },
  processing: { width: 34, height: 34, borderRadius: 17 },
  mark: { color: colors.muted, fontSize: 24, fontWeight: '300' },
});
