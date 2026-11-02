import { get, useFormContext } from 'react-hook-form'
import type { FieldError, FieldPath } from 'react-hook-form'
import type { TransferFormValues } from '../utils/transferSchema'

/** Props that connect a MUI TextField to the transfer form: value handlers, focus ref, error and its message. */
export function useTransferField() {
  const {
    register,
    formState: { errors },
  } = useFormContext<TransferFormValues>()

  return (name: FieldPath<TransferFormValues>) => {
    const { ref, ...handlers } = register(name)
    const error: FieldError | undefined = get(errors, name)
    return {
      ...handlers,
      inputRef: ref,
      error: Boolean(error),
      helperText: error?.message,
    }
  }
}
