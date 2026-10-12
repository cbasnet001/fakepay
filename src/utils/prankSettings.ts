export const errorOptions = [
  'Random',
  'Authentication unavailable',
  'Connection timed out',
  'Card unavailable',
  'Service temporarily unavailable',
] as const;
export const authenticationDelays = [2, 4, 6] as const;
export type PrankSettings = {
  error: typeof errorOptions[number];
  authenticationDelay: typeof authenticationDelays[number];
  haptics: boolean;
};
export const defaultSettings: PrankSettings = { error: 'Random', authenticationDelay: 2, haptics: true };

export function parseSettings(raw: string | null): PrankSettings {
  if (!raw) return { ...defaultSettings };
  try {
    const value = JSON.parse(raw);
    if (!value || typeof value !== 'object' || Array.isArray(value)) return { ...defaultSettings };
    return {
      error: errorOptions.includes(value.error) ? value.error : defaultSettings.error,
      authenticationDelay: authenticationDelays.includes(value.authenticationDelay) ? value.authenticationDelay : defaultSettings.authenticationDelay,
      haptics: typeof value.haptics === 'boolean' ? value.haptics : defaultSettings.haptics,
    };
  } catch { return { ...defaultSettings }; }
}
