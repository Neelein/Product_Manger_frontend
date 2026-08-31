function pad(value: number): string {
  return value.toString().padStart(2, '0')
}

/** Convert a backend RFC3339 instant into the browser's local datetime-local value. */
export function toDatetimeLocal(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

/** Convert a datetime-local wall-clock value to an RFC3339 instant. */
export function toRfc3339(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  return date.toISOString()
}
