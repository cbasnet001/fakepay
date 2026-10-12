import { StyleSheet, View } from 'react-native';
import { colors } from '../theme/tokens';

// Three thin adjustment sliders; no icon or SVG dependency.
export function SettingsIcon() {
  return <View style={styles.icon} accessible={false}>
    {[4, 12, 7].map((left, index) => <View style={styles.line} key={index}><View style={[styles.knob, { left }]} /></View>)}
  </View>;
}
const styles = StyleSheet.create({
  icon: { width: 20, height: 20, justifyContent: 'space-around' },
  line: { height: 1, backgroundColor: colors.muted, width: 20 },
  knob: { position: 'absolute', top: -2, width: 5, height: 5, borderRadius: 2.5, borderWidth: 1, borderColor: colors.muted, backgroundColor: colors.background },
});
