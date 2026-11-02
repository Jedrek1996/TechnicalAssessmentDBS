import type { ReactNode } from 'react'
import styles from '../../../styles/components/layout/ContentLayout.module.css'

interface ContentLayoutProps {
  children: ReactNode
}

// The page container: max width, side margins, and room under the content for the fixed button.
export function ContentLayout({ children }: ContentLayoutProps) {
  return <main className={styles.layout}>{children}</main>
}
