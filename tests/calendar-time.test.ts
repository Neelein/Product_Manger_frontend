import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'
import { join } from 'node:path'
import { toDatetimeLocal, toRfc3339 } from '../src/features/calendar/time.ts'

test('datetime-local changed values are serialized as local instants', () => {
  const localValue = '2026-01-15T09:45'
  assert.equal(toRfc3339(localValue), new Date(localValue).toISOString())
})

test('RFC3339 values round-trip to the browser local datetime-local value', () => {
  const rfc3339 = '2026-07-15T16:45:00.000Z'
  const expected = (() => {
    const date = new Date(rfc3339)
    const pad = (value: number) => value.toString().padStart(2, '0')
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
  })()

  assert.equal(toDatetimeLocal(rfc3339), expected)
})

test('invalid datetime values are not reported as a successful conversion', () => {
  assert.equal(toRfc3339('not-a-date'), 'not-a-date')
  assert.equal(toDatetimeLocal('not-a-date'), '')
})

test('successful event saves replace the read-only event state with the API response', () => {
  const detailPage = readFileSync(join(process.cwd(), 'src/features/calendar/pages/CalendarEventDetailPage.tsx'), 'utf8')

  assert.match(detailPage, /const updated = await update\(/)
  assert.match(detailPage, /if \(updated\) \{[\s\S]*setEvent\(updated\)/)
  assert.match(detailPage, /updateError/)
  assert.match(detailPage, /start_time: toRfc3339\(editStart\)/)
  assert.match(detailPage, /end_time: toRfc3339\(editEnd\)/)
  assert.doesNotMatch(detailPage, /v \+ ':00Z'/)
})
