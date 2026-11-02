import { useQuery } from '@tanstack/react-query'
import { useId, useState } from 'react'
import { useFormContext } from 'react-hook-form'
import { payeesQuery } from '../../../../api/queries'
import type { Payee } from '../../../../api/types'
import { NEW_RECIPIENT } from '../../../../constants/transfer'
import styles from '../../../../styles/components/transfer/recipient/RecipientStep.module.css'
import type { TransferFormValues } from '../../../../utils/transferSchema'
import { InlineError } from '../../../common/InlineError'
import { SearchInput } from '../../../common/SearchInput'
import { Skeleton } from '../../../common/Skeleton'
import { StepHeading } from '../../StepHeading'
import { NewRecipientFields } from '../NewRecipientFields'
import { RecipientOption } from '../RecipientOption'

export function RecipientStep() {
  const headingId = useId()
  const errorId = useId()
  const {
    register,
    watch,
    formState: { errors },
  } = useFormContext<TransferFormValues>()
  const payees = useQuery(payeesQuery())
  const [search, setSearch] = useState('')

  const registration = register('recipientChoice')
  const choice = watch('recipientChoice')
  const term = search.trim().toLowerCase()
  const matches = (payees.data ?? []).filter(
    ({ name, bank }) =>
      !term || name.toLowerCase().includes(term) || bank.toLowerCase().includes(term),
  )
  // Whoever is chosen stays in view even if a later search no longer matches them: pinned at the
  // top under a "Selected" label, with the matches below, so it is clear why they are there.
  const chosen = payees.data?.find(({ id }) => id === choice)
  const pinned = chosen && !matches.includes(chosen) ? chosen : undefined
  const option = (payee: Payee) => (
    <RecipientOption
      key={payee.id}
      value={payee.id}
      registration={registration}
      avatar={payee.initials}
      title={payee.name}
      detail={`${payee.bank} · ${payee.accountNumberMasked}`}
    />
  )
  const error = errors.recipientChoice?.message

  return (
    <>
      <StepHeading id={headingId}>Who are you sending to?</StepHeading>
      <SearchInput
        label="Search payees"
        value={search}
        onChange={setSearch}
        onClear={() => setSearch('')}
        fullWidth
      />

      <div
        role="radiogroup"
        aria-labelledby={headingId}
        aria-describedby={error ? errorId : undefined}
        className={styles.group}
      >
        {payees.isPending && (
          <>
            <Skeleton height="4rem" radius="var(--radius-md)" />
            <Skeleton height="4rem" radius="var(--radius-md)" />
            <Skeleton height="4rem" radius="var(--radius-md)" />
          </>
        )}
        {payees.isError && (
          <InlineError
            message="We couldn't load your payees."
            onRetry={() => void payees.refetch()}
          />
        )}
        {pinned && (
          <>
            <p className={styles.label} aria-hidden="true">
              Selected
            </p>
            {option(pinned)}
            <p className={styles.label} aria-hidden="true">
              Search results
            </p>
          </>
        )}
        {matches.map(option)}
        {payees.data?.length === 0 && (
          <p className={styles.note}>No saved payees yet.</p>
        )}
        {payees.data && payees.data.length > 0 && matches.length === 0 && (
          <p className={styles.note}>No payees match your search.</p>
        )}
        <RecipientOption
          value={NEW_RECIPIENT}
          registration={registration}
          avatar="+"
          title="Send to someone new"
        />
      </div>

      {error && (
        <p id={errorId} className={styles.error}>
          {error}
        </p>
      )}
      {choice === NEW_RECIPIENT && <NewRecipientFields />}
    </>
  )
}
