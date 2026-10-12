import { router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DemoPasscode } from '../components/DemoPasscode';
import { SimulationLabel } from '../components/SimulationLabel';

export default function PasscodeScreen() {
  return <SafeAreaView style={styles.screen}>
    <StatusBar style="dark" />
    <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
      <View style={styles.content}>
        <SimulationLabel />
        <DemoPasscode onCancel={() => router.canGoBack() ? router.back() : router.replace('/payment')} />
      </View>
    </ScrollView>
  </SafeAreaView>;
}
const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F2F2F4' },
  scroll: { flexGrow: 1, paddingHorizontal: 28, paddingTop: 12, paddingBottom: 12 },
  content: { flexGrow: 1, width: '100%', maxWidth: 420, alignSelf: 'center' },
});
