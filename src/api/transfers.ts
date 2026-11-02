import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { FieldPath } from 'react-hook-form'
import { NEW_RECIPIENT } from '../constants/transfer'
import type { TransferFormValues } from '../utils/transferSchema'
import { apiFetch } from './client'
import { queryKeys } from './queries'
import type { CreateTransferRequest, TransferResponse } from './types'

/** The one place that turns the form into a request: either a saved payee or a new recipient. */
export function toRequest(values: TransferFormValues): CreateTransferRequest {
  const note = values.note.trim()
  const request = {
    fromAccountId: values.fromAccountId,
    amount: Number(values.amount),
    ...(note ? { note } : {}),
  }

  if (values.recipientChoice === NEW_RECIPIENT) {
    const { name, accountNumber, bank } = values.newRecipient
    return { ...request, recipient: { name: name.trim(), accountNumber, bank } }
  }
  return { ...request, payeeId: values.recipientChoice }
}

const FORM_FIELD_FOR_API_FIELD: Record<string, FieldPath<TransferFormValues>> = {
  fromAccountId: 'fromAccountId',
  payeeId: 'recipientChoice',
  'recipient.name': 'newRecipient.name',
  'recipient.accountNumber': 'newRecipient.accountNumber',
  'recipient.bank': 'newRecipient.bank',
  amount: 'amount',
  note: 'note',
}

/** API field errors, keyed by the form's own field names. */
export function toFormErrors(
  fields: Record<string, string> | undefined,
): [FieldPath<TransferFormValues>, string][] {
  return Object.entries(fields ?? {}).flatMap(([apiField, message]) => {
    const formField = FORM_FIELD_FOR_API_FIELD[apiField]
    return formField ? [[formField, message] as [FieldPath<TransferFormValues>, string]] : []
  })
}

export function useCreateTransfer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (request: CreateTransferRequest) =>
      apiFetch<TransferResponse>('/api/transfers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      }),
    // Refetch rather than patch the cache: always matches the server. Not awaited,
    // so the success screen shows straight away while the dashboard refreshes behind it.
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.customer })
      void queryClient.invalidateQueries({ queryKey: queryKeys.accounts })
      void queryClient.invalidateQueries({ queryKey: queryKeys.transactionsAll })
    },
  })
}
