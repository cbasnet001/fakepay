import { useEffect } from 'react';
import { Animated, Easing, StyleSheet, Text, useAnimatedValue } from 'react-native';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { colors } from '../theme/tokens';
import type { PrankState } from '../utils/prankSequence';
import { PrankVisual } from './PrankVisual';

export function PrankStatus({ state }: { state: PrankState }) {
  const entrance = useAnimatedValue(0);
  const reduced = useReducedMotion();
  useEffect(() => {
    if (reduced === null) return;
    if (reduced) { entrance.setValue(1); return; }
    entrance.setValue(0);
    const animation = Animated.timing(entrance, { toValue: 1, duration: 280, easing: Easing.out(Easing.cubic), useNativeDriver: true });
    animation.start();
    return () => animation.stop();
  }, [entrance, reduced, state.status]);

  const title = state.status === 'authenticating' ? 'Face ID'
    : state.status === 'readyForReader' ? 'Hold Near Reader'
    : state.status === 'processing' ? 'Processing…'
    : state.status === 'error' ? state.message : 'Session paused.';
  const subtitle = state.status === 'authenticating' ? null
    : state.status === 'readyForReader' ? null
    : state.status === 'processing' ? 'Completing demo verification.'
    : state.status === 'error' ? 'Please try again.'
    : 'The app was interrupted. Try again when you’re ready.';

  return (
    <Animated.View style={[styles.content, { opacity: entrance, transform: [{ translateY: entrance.interpolate({ inputRange: [0, 1], outputRange: [10, 0] }) }] }]}>
      <PrankVisual status={state.status} attempt={state.status === 'authenticating' ? state.attempt : undefined} />
      {state.status !== 'authenticating' && state.status !== 'readyForReader' && <Text style={styles.step}>{state.status === 'processing' ? 'DEMO PASSCODE' : state.status === 'error' ? 'PAYMENT NOT COMPLETED' : 'SESSION PAUSED'}</Text>}
      <Text accessibilityRole="header" accessibilityLiveRegion="polite" style={styles.title}>{title}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  content: { alignItems: 'center', gap: 12 },
  step: { color: colors.muted, fontSize: 9, letterSpacing: 1.5, fontWeight: '600', textAlign: 'center', marginTop: 12 },
  title: { color: colors.text, fontSize: 21, fontWeight: '400', letterSpacing: -0.4, textAlign: 'center' },
  subtitle: { color: colors.muted, fontSize: 15, lineHeight: 23, textAlign: 'center', maxWidth: 300 },
});
