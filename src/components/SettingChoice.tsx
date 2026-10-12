import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../theme/tokens';

type Props = { label: string; selected: boolean; onPress: () => void; last?: boolean };
export function SettingChoice({ label, selected, onPress, last }: Props) {
  return <Pressable accessibilityRole="radio" accessibilityState={{ checked: selected }} onPress={onPress}
    style={({ pressed }) => [styles.row, !last && styles.border, pressed && { opacity: 0.55 }]}>
    <Text style={styles.label}>{label}</Text>
    <View style={[styles.radio, selected && styles.selected]}>{selected && <View style={styles.dot} />}</View>
  </Pressable>;
}
const styles = StyleSheet.create({
  row: { minHeight: 52, paddingHorizontal: 16, paddingVertical: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 16 },
  border: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
  label: { color: colors.text, fontSize: 15, flexShrink: 1 },
  radio: { width: 16, height: 16, borderRadius: 8, borderWidth: 1, borderColor: '#555555', alignItems: 'center', justifyContent: 'center' },
  selected: { borderColor: '#C5C5C5' },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: '#C5C5C5' },
});
