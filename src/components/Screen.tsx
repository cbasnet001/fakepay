import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '../theme/tokens';

export function Screen({ children }: { children: ReactNode }) {
  return <SafeAreaView style={styles.screen}>
    <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>{children}</View>
    </ScrollView>
  </SafeAreaView>;
}
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  scroll: { flexGrow: 1, paddingHorizontal: 28, paddingTop: 12, paddingBottom: 20 },
  content: { flexGrow: 1, width: '100%', maxWidth: 420, alignSelf: 'center' },
});
