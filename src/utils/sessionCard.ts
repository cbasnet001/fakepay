// Decorative suffix only. Created once when the app's JavaScript session loads;
// shared by every card instance and never written to persistent storage.
export const sessionCardSuffix = String(Math.floor(1000 + Math.random() * 9000));
