import { Redirect } from 'expo-router';

// Support the alternate passcode URL without an unmatched route.
export default function PasscodeRedirect() {
  return <Redirect href="/passcode" />;
}
