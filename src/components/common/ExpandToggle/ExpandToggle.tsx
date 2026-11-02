import styles from '../../../styles/components/common/ExpandToggle.module.css'

interface ExpandToggleProps {
  expanded: boolean
  label: string
  controls: string
  onToggle: () => void
}

export function ExpandToggle({ expanded, label, controls, onToggle }: ExpandToggleProps) {
  return (
    <button
      type="button"
      className={styles.toggle}
      aria-expanded={expanded}
      aria-controls={controls}
      aria-label={label}
      onClick={onToggle}
    >
      <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false">
        <path
          d="m6 9 6 6 6-6"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
        />
      </svg>
    </button>
  )
}
