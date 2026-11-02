/** Private mode or blocked storage must not break the toggle. */
export function persist(key: string, value: string): void {
  try {
    localStorage.setItem(key, value)
  } catch {
    // The choice still applies for this visit; it just won't be remembered.
  }
}
