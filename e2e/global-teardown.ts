import { rm } from 'node:fs/promises'

const MEDIA_ROOT =
  process.env.E2E_MEDIA_ROOT ??
  `${process.env.TMPDIR ?? '/tmp'}/pm-e2e-media`

export default async function globalTeardown(): Promise<void> {
  try {
    await rm(MEDIA_ROOT, { recursive: true, force: true })
  } catch {
    // best-effort cleanup; ignore errors
  }
}