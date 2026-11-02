import styles from '../../../styles/components/layout/Header.module.css'
import { SegmentSwitch } from '../../theme/SegmentSwitch'
import { ThemeToggle } from '../../theme/ThemeToggle'

const DISABLED_NAV = ['Cards', 'Payments', 'Insights']

interface HeaderProps {
  initials: string
}

export function Header({ initials }: HeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <div className={styles.brand}>
          <span className={styles.logo} aria-hidden="true">
            M
          </span>
          <span className={styles.name}>Meridian</span>
        </div>

        <nav className={styles.nav} aria-label="Primary">
          <span className={styles.current} aria-current="page">
            Overview
          </span>
          {DISABLED_NAV.map((label) => (
            <button key={label} type="button" className={styles.disabled} disabled>
              {label}
            </button>
          ))}
        </nav>

        <div className={styles.segment}>
          <SegmentSwitch />
        </div>

        <div className={styles.controls}>
          <ThemeToggle />
          <span
            className={styles.avatar}
            role="img"
            aria-label={`Signed in as ${initials}`}
          >
            {initials}
          </span>
        </div>
      </div>
    </header>
  )
}
