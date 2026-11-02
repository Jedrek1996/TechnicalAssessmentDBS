import { formatMoney } from '../lib/format'

// Intl puts a non-breaking space after "SGD" and Testing Library matches text
// with plain spaces, so normalise the expected value the same way.
export const moneyText = (amount: number) => formatMoney(amount).replace(/\s/g, ' ')
