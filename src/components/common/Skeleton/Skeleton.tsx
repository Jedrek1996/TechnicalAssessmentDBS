import type { CSSProperties } from 'react'
import styles from '../../../styles/components/common/Skeleton.module.css'

interface SkeletonProps {
  width?: CSSProperties['width']
  height: CSSProperties['height']
  radius?: CSSProperties['borderRadius']
}

export function Skeleton({ width = '100%', height, radius }: SkeletonProps) {
  return (
    <span
      className={styles.skeleton}
      style={{ width, height, borderRadius: radius }}
      aria-hidden="true"
    />
  )
}
