import { useId, useLayoutEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import styles from '../../../styles/components/common/CollapsibleSection.module.css'
import { ExpandToggle } from '../ExpandToggle'
import { SectionHeader } from '../SectionHeader'
import { SectionHeading } from '../SectionHeading'

interface CollapsibleSectionProps {
  title: string
  summary: ReactNode
  action?: ReactNode
  children: ReactNode
}

export function CollapsibleSection({
  title,
  summary,
  action,
  children,
}: CollapsibleSectionProps) {
  const [expanded, setExpanded] = useState(true)
  const headingId = useId()
  const bodyId = useId()
  const bodyRef = useRef<HTMLDivElement>(null)
  const heightBefore = useRef<number | null>(null)

  function toggle() {
    heightBefore.current = bodyRef.current?.offsetHeight ?? null
    setExpanded((open) => !open)
  }
  useLayoutEffect(() => {
    const body = bodyRef.current
    const from = heightBefore.current
    heightBefore.current = null
    if (!body || from === null || typeof body.animate !== 'function') return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const to = body.offsetHeight
    if (from === to) return

    body.style.overflow = 'hidden'
    const animation = body.animate(
      [{ height: `${from}px` }, { height: `${to}px` }],
      { duration: 280, easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)' },
    )
    const done = () => {
      body.style.overflow = ''
    }
    animation.addEventListener('finish', done)
    animation.addEventListener('cancel', done)
  }, [expanded])

  return (
    <section aria-labelledby={headingId}>
      <SectionHeader
        heading={<SectionHeading id={headingId}>{title}</SectionHeading>}
        toggle={
          <ExpandToggle
            expanded={expanded}
            label={`${expanded ? 'Collapse' : 'Expand'} ${title.toLowerCase()}`}
            controls={bodyId}
            onToggle={toggle}
          />
        }
        action={expanded ? action : undefined}
      />
      <div id={bodyId} ref={bodyRef}>
        <div key={expanded ? 'content' : 'summary'} className={styles.view}>
          {expanded ? children : summary}
        </div>
      </div>
    </section>
  )
}
