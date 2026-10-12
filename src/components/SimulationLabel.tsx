import { StyleSheet, Text } from 'react-native';
import { colors } from '../theme/tokens';
export function SimulationLabel() { return <Text style={styles.text}>Simulation</Text>; }
const styles = StyleSheet.create({ text: { color: colors.muted, fontSize: 11, letterSpacing: 0.6 } });
