import { StyleSheet, View } from 'react-native';

export function ContactlessMark() {
  return (
    <View accessible={false} style={styles.mark}>
      {[12, 22, 32].map((size) => (
        <View key={size} style={[styles.arc, { width: size, height: size, borderRadius: size, right: 32 - size }]} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  mark: { width: 34, height: 34, justifyContent: 'center', overflow: 'hidden' },
  arc: { position: 'absolute', borderWidth: 1, borderColor: 'transparent', borderRightColor: '#888888' },
});
