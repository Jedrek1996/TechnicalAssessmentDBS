import type { ReactNode } from 'react'
import styles from '../../../styles/components/layout/ContentLayout.module.css'

interface ContentLayoutProps {
  main: ReactNode
  /** Right column on desktop (300px), stacked below on mobile. */
  rail?: ReactNode
}

/**
 * The page grid. Loading, error and loaded states all render through it, so
 * the layout can't jump when the data arrives (D1).
 */
export function ContentLayout({ main, rail }: ContentLayoutProps) {
  return (
    <main className={styles.layout}>
      <div className={styles.main}>{main}</div>
      {rail && <aside className={styles.rail}>{rail}</aside>}
    </main>
  )
}
