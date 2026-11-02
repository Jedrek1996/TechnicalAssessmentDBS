import { useTheme } from '../../../hooks/useTheme'
import type { Segment } from '../../../constants/theme'
import styles from '../../../styles/components/theme/SegmentSwitch.module.css'

const OPTIONS: { value: Segment; label: string }[] = [
  { value: 'retail', label: 'Retail' },
  { value: 'premium', label: 'Premium' },
]

// Only changes the brand colour; there is no API call.
export function SegmentSwitch() {
  const { segment, setSegment } = useTheme()

  return (
    <div
      role="group"
      aria-label="Customer segment"
      className={styles.group}
      data-active={segment}
    >
      <span className={styles.indicator} aria-hidden="true" />
      {OPTIONS.map(({ value, label }) => (
        <button
          key={value}
          type="button"
          className={styles.option}
          aria-pressed={segment === value}
          onClick={() => setSegment(value)}
        >
          {label}
        </button>
      ))}
    </div>
  )
}
