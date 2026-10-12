import { Pressable, StyleSheet, Text } from 'react-native';
import { colors } from '../theme/tokens';

type Props = { label: string; onPress: () => void; accessibilityHint?: string };
export function PrimaryButton({ label, onPress, accessibilityHint }: Props) {
  return (
    <Pressable accessibilityRole="button" accessibilityHint={accessibilityHint} onPress={onPress}
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}>
      <Text style={styles.label}>{label}</Text>
    </Pressable>
  );
}
const styles = StyleSheet.create({
  button: { backgroundColor: colors.surface, borderWidth: StyleSheet.hairlineWidth, borderColor: '#383838', minHeight: 48, borderRadius: 13, paddingHorizontal: 24, paddingVertical: 14, alignItems: 'center', justifyContent: 'center' },
  pressed: { opacity: 0.65 },
  label: { color: colors.text, fontSize: 15, fontWeight: '500' },
});
