import type { CSSProperties } from 'react'
import styles from '../../../styles/components/common/Skeleton.module.css'

interface SkeletonProps {
  /** Any CSS length. Defaults to the full width of its container. */
  width?: CSSProperties['width']
  height: CSSProperties['height']
  radius?: CSSProperties['borderRadius']
}

/** A placeholder block. Size it like the content it stands in for. */
export function Skeleton({ width = '100%', height, radius }: SkeletonProps) {
  return (
    <span
      className={styles.skeleton}
      style={{ width, height, borderRadius: radius }}
      aria-hidden="true"
    />
  )
}
