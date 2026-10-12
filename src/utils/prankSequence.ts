import { defaultSettings, errorOptions, type PrankSettings } from './prankSettings';

export const errorMessages = errorOptions.slice(1);

export type PrankState =
  | { status: 'idle' }
  | { status: 'authenticating'; attempt: number; waiting: boolean; canUsePasscode: boolean }
  | { status: 'demoPasscode'; filled: number }
  | { status: 'processing' }
  | { status: 'readyForReader' }
  | { status: 'error'; message: string };

export function createPrankSequence(
  onChange: (state: PrankState) => void,
  onError: () => void,
  random = Math.random,
  settings: PrankSettings = defaultSettings,
) {
  let state: PrankState = { status: 'idle' };
  let timer: ReturnType<typeof setTimeout> | undefined;
  let generation = 0;
  let disposed = false;
  let attempt = 0;
  let message = '';

  const publish = (next: PrankState) => { state = next; onChange(next); };
  const cancel = () => {
    generation += 1;
    clearTimeout(timer);
    timer = undefined;
  };
  const schedule = (delay: number, action: () => void) => {
    cancel();
    const session = generation;
    timer = setTimeout(() => {
      if (disposed || generation !== session) return;
      timer = undefined;
      action();
    }, delay);
  };
  const scan = () => {
    cancel();
    attempt += 1;
    publish({ status: 'authenticating', attempt, waiting: false, canUsePasscode: attempt > 1 });
    // This interactive flow uses a fixed 2.5-second fallback threshold.
    schedule(2500, () => {
      publish({ status: 'authenticating', attempt, waiting: true, canUsePasscode: true });
      // Deliberately no timer: wait for Retry Scan, Use Passcode, or Close.
    });
  };

  return {
    start() {
      if (disposed || (state.status !== 'idle' && state.status !== 'error')) return;
      attempt = 0;
      message = settings.error === 'Random'
        ? errorMessages[Math.floor(random() * errorMessages.length)]
        : settings.error;
      scan();
    },
    retryScan() {
      if (disposed || state.status !== 'authenticating' || !state.waiting) return;
      scan();
    },
    usePasscode() {
      if (disposed || state.status !== 'authenticating' || !state.canUsePasscode) return;
      cancel();
      publish({ status: 'demoPasscode', filled: 0 });
    },
    tapDigit() {
      if (disposed || state.status !== 'demoPasscode') return;
      const filled = state.filled + 1;
      if (filled < 4) { publish({ status: 'demoPasscode', filled }); return; }
      // Only tap counts are tracked; no digit values or passcode are accepted.
      publish({ status: 'processing' });
      schedule(900, () => {
        publish({ status: 'readyForReader' });
        schedule(2500, () => {
          publish({ status: 'error', message });
          if (settings.haptics) onError();
        });
      });
    },
    deleteDigit() {
      if (disposed || state.status !== 'demoPasscode' || state.filled === 0) return;
      publish({ status: 'demoPasscode', filled: state.filled - 1 });
    },
    cancelPasscode() {
      if (disposed || state.status !== 'demoPasscode') return;
      cancel();
      publish({ status: 'authenticating', attempt, waiting: true, canUsePasscode: true });
    },
    close() {
      if (disposed) return;
      cancel();
      publish({ status: 'idle' });
    },
    dispose() { cancel(); disposed = true; },
  };
}
