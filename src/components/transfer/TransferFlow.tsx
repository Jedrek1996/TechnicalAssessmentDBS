import { zodResolver } from '@hookform/resolvers/zod'
import { DialogActions, DialogContent, DialogTitle } from '@mui/material'
import { useEffect, useRef, useState } from 'react'
import { FormProvider, get, useForm, useWatch } from 'react-hook-form'
import type { FieldPath, Resolver } from 'react-hook-form'
import { ApiError } from '../../api/client'
import { toFormErrors, toRequest, useCreateTransfer } from '../../api/transfers'
import type { Account, Customer, TransferResponse } from '../../api/types'
import { SEND_ERROR_MESSAGE } from '../../constants/transfer'
import type { TransferStep } from '../../constants/transfer'
import styles from '../../styles/components/transfer/TransferFlow.module.css'
import { isDepositAccount, remainingLimit } from '../../utils/money'
import { buildStepSchema } from '../../utils/transferSchema'
import type { TransferFormValues } from '../../utils/transferSchema'
import { Button } from '../common/Button'
import { AmountStep } from './amount/AmountStep'
import { RecipientStep } from './recipient/RecipientStep'
import { ReviewStep } from './review/ReviewStep'
import { Stepper } from './stepper/Stepper'
import { SuccessPanel } from './success/SuccessPanel'

export const TRANSFER_TITLE_ID = 'transfer-dialog-title'

interface TransferFlowProps {
  customer: Customer
  accounts: Account[]
  onClose: () => void
}

// Lives inside the dialog, so closing the dialog throws the form and the step away.
export function TransferFlow({ customer, accounts, onClose }: TransferFlowProps) {
  const deposits = accounts.filter(isDepositAccount)
  const remaining = remainingLimit(customer)
  const [step, setStep] = useState<TransferStep>('recipient')
  const [result, setResult] = useState<TransferResponse>()
  const mutation = useCreateTransfer()
  const contentRef = useRef<HTMLDivElement>(null)

  // Each step checks only its own fields; the balance comes from the account chosen.
  const resolver: Resolver<TransferFormValues> = (values, context, options) => {
    const balance = deposits.find(({ id }) => id === values.fromAccountId)?.balance ?? 0
    const schema = buildStepSchema(step === 'success' ? 'review' : step, {
      balance,
      remaining,
    })
    return zodResolver(schema)(values, context, options)
  }

  const form = useForm<TransferFormValues>({
    defaultValues: {
      recipientChoice: '',
      newRecipient: { name: '', accountNumber: '', bank: '' },
      fromAccountId: deposits[0]?.id ?? '',
      amount: '',
      note: '',
    },
    mode: 'onBlur',
    resolver,
  })

  // Is this step complete and valid right now? Checked silently (no errors shown) so the
  // Continue button can look disabled until it is.
  const values = useWatch({ control: form.control })
  const stepIsValid =
    step === 'recipient' || step === 'amount'
      ? buildStepSchema(step, {
          balance: deposits.find(({ id }) => id === values.fromAccountId)?.balance ?? 0,
          remaining,
        }).safeParse(values).success
      : true

  // Fields are checked when you leave them; once one shows an error, it re-checks as you fix it.
  useEffect(
    () =>
      form.subscribe({
        formState: { values: true },
        callback: ({ name }) => {
          if (name && get(form.formState.errors, name)) {
            void form.trigger(name as FieldPath<TransferFormValues>)
          }
        },
      }),
    [form],
  )

  // Move focus to the step's heading so screen readers announce it.
  useEffect(() => {
    contentRef.current?.querySelector<HTMLElement>('h2')?.focus()
  }, [step])

  async function goNext() {
    if (step === 'recipient') {
      if (await form.trigger(['recipientChoice', 'newRecipient'], { shouldFocus: true })) {
        setStep('amount')
      }
    } else if (step === 'amount') {
      if (await form.trigger(['fromAccountId', 'amount', 'note'], { shouldFocus: true })) {
        setStep('review')
      }
    }
  }

  function goBack() {
    mutation.reset()
    setStep(step === 'review' ? 'amount' : 'recipient')
  }

  function send() {
    if (mutation.isPending) return
    mutation.mutate(toRequest(form.getValues()), {
      onSuccess: (response) => {
        setResult(response)
        setStep('success')
      },
      onError: (error) => {
        // Show the API's field messages under the fields (visible after Back).
        if (error instanceof ApiError) {
          for (const [name, message] of toFormErrors(error.fields)) {
            form.setError(name, { message })
          }
        }
      },
    })
  }

  const sendError = mutation.error
    ? mutation.error instanceof ApiError && mutation.error.status < 500
      ? mutation.error.message
      : SEND_ERROR_MESSAGE
    : undefined

  return (
    <FormProvider {...form}>
      <DialogTitle id={TRANSFER_TITLE_ID}>New transfer</DialogTitle>
      <button type="button" className={styles.close} aria-label="Close" onClick={onClose}>
        ✕
      </button>
      {step !== 'success' && (
        <div className={styles.stepper}>
          <Stepper step={step} />
        </div>
      )}

      <DialogContent ref={contentRef}>
        {step === 'recipient' && <RecipientStep />}
        {step === 'amount' && <AmountStep accounts={deposits} remaining={remaining} />}
        {step === 'review' && <ReviewStep accounts={deposits} sendError={sendError} />}
        {step === 'success' && result && <SuccessPanel transfer={result.transfer} />}
      </DialogContent>

      <DialogActions className={styles.actions}>
        {step === 'success' ? (
          <Button onClick={onClose}>Back to dashboard</Button>
        ) : (
          <>
            <Button variant="secondary" onClick={step === 'recipient' ? onClose : goBack}>
              {step === 'recipient' ? (
                'Cancel'
              ) : (
                <>
                  <span aria-hidden="true">←</span> Back
                </>
              )}
            </Button>
            {step === 'review' ? (
              <Button onClick={send} disabled={mutation.isPending}>
                {mutation.isPending ? 'Sending…' : 'Confirm transfer'}
              </Button>
            ) : (
              // Soft-disabled: looks and announces as disabled, but stays focusable, so pressing it early
              // shows what is wrong and moves focus to the first invalid field instead of doing nothing.
              <Button aria-disabled={!stepIsValid} onClick={() => void goNext()}>
                Continue
              </Button>
            )}
          </>
        )}
      </DialogActions>
    </FormProvider>
  )
}
