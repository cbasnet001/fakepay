// Only the number of taps exists in memory; digit values are never accepted.
export function createDemoPasscode(onChange: (filled: number, locked: boolean) => void, onShake: () => void) {
  let filled = 0;
  let locked = false;
  let disposed = false;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let generation = 0;
  const reset = () => {
    generation += 1;
    clearTimeout(timer);
    filled = 0;
    locked = false;
    if (!disposed) onChange(0, false);
  };
  return {
    tap() {
      if (disposed || locked) return;
      filled += 1;
      locked = filled === 6;
      onChange(filled, locked);
      if (locked) {
        const session = generation;
        timer = setTimeout(() => {
          if (!disposed && session === generation) onShake();
        }, 200);
      }
    },
    delete() {
      if (disposed || locked) return;
      filled = Math.max(0, filled - 1);
      onChange(filled, false);
    },
    finishShake() { if (!disposed && locked) reset(); },
    reset,
    dispose() { disposed = true; reset(); },
  };
}
