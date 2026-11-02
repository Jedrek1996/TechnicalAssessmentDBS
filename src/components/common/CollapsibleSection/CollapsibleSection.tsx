import { useId, useState } from 'react'
import type { ReactNode } from 'react'
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

  return (
    <section aria-labelledby={headingId}>
      <SectionHeader
        heading={<SectionHeading id={headingId}>{title}</SectionHeading>}
        toggle={
          <ExpandToggle
            expanded={expanded}
            label={`${expanded ? 'Collapse' : 'Expand'} ${title.toLowerCase()}`}
            controls={bodyId}
            onToggle={() => setExpanded((open) => !open)}
          />
        }
        action={expanded ? action : undefined}
      />
      <div id={bodyId}>{expanded ? children : summary}</div>
    </section>
  )
}
