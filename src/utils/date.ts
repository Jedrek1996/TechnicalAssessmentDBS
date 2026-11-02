// Dates are shown in Singapore time, like formatShortDate, so the output doesn't depend on where the app runs.
const longDate = new Intl.DateTimeFormat('en-SG', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  timeZone: 'Asia/Singapore',
})

/** `Tuesday 20 October` */
export function formatLongDate(date: Date): string {
  return longDate.format(date)
}
