import { useTheme } from '../../../hooks/useTheme'
import styles from '../../../styles/components/theme/ThemeToggle.module.css'

/** Light/dark switch. The name stays "Dark mode"; `aria-pressed` carries the state. */
export function ThemeToggle() {
  const { mode, toggleMode } = useTheme()

  return (
    <button
      type="button"
      className={styles.toggle}
      aria-label="Dark mode"
      aria-pressed={mode === 'dark'}
      onClick={toggleMode}
    >
      <svg
        viewBox="0 0 24 24"
        width="20"
        height="20"
        aria-hidden="true"
        focusable="false"
      >
        <circle
          cx="12"
          cy="12"
          r="9"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        />
        <path d="M12 3a9 9 0 0 1 0 18z" fill="currentColor" />
      </svg>
    </button>
  )
}
