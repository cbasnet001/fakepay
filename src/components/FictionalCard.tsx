import { useEffect } from 'react';
import { Animated, Easing, StyleSheet, Text, View, useAnimatedValue } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useReducedMotion } from '../hooks/useReducedMotion';
import { ContactlessMark } from './ContactlessMark';
import { sessionCardSuffix } from '../utils/sessionCard';

export function FictionalCard() {
  const entrance = useAnimatedValue(0);
  const reduced = useReducedMotion();
  useEffect(() => {
    if (reduced === null) return;
    if (reduced) { entrance.setValue(1); return; }
    entrance.setValue(0);
    const animation = Animated.timing(entrance, { toValue: 1, duration: 550, easing: Easing.out(Easing.cubic), useNativeDriver: true });
    animation.start();
    return () => animation.stop();
  }, [entrance, reduced]);

  return <Animated.View style={{ width: '100%', opacity: entrance, transform: [{ translateY: entrance.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) }] }}>
    <LinearGradient colors={['#292929', '#222222', '#1C1C1C']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.card}
      accessible accessibilityLabel={`AUREL fictional simulation card. Placeholder digits ${sessionCardSuffix.split('').join(' ')}.`}>
      <View style={styles.top}><Text style={styles.wordmark}>AUREL</Text><ContactlessMark /></View>
      <View style={styles.symbol} accessible={false}><View style={styles.diamond} /><View style={styles.diamondOffset} /></View>
      <View style={styles.bottom}><Text style={styles.number}>•••• {sessionCardSuffix}</Text><Text style={styles.label}>SIMULATION</Text></View>
    </LinearGradient>
  </Animated.View>;
}
const styles = StyleSheet.create({
  card: { width: '100%', aspectRatio: 1.586, minHeight: 180, borderRadius: 18, borderWidth: StyleSheet.hairlineWidth, borderColor: '#424242', padding: 22, justifyContent: 'space-between' },
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  wordmark: { color: '#E5E5E5', fontSize: 13, fontWeight: '500', letterSpacing: 4 },
  symbol: { width: 42, height: 34, justifyContent: 'center', marginLeft: 6 },
  diamond: { position: 'absolute', width: 23, height: 23, borderWidth: 1, borderColor: '#8C8C8C', transform: [{ rotate: '45deg' }] },
  diamondOffset: { position: 'absolute', left: 14, width: 23, height: 23, borderWidth: 1, borderColor: '#5C5C5C', transform: [{ rotate: '45deg' }] },
  bottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  number: { color: '#A0A0A0', fontSize: 11, letterSpacing: 1.5, fontVariant: ['tabular-nums'] },
  label: { color: '#A0A0A0', fontSize: 8, letterSpacing: 2 },
});
