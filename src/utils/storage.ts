export function persist(key: string, value: string): void {
  try {
    localStorage.setItem(key, value)
  } catch {
    // Storage can be blocked (private mode). The choice still applies for this visit.
  }
}
