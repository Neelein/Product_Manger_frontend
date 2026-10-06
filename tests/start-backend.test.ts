import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { test } from 'node:test'

const launcher = readFileSync(join(process.cwd(), 'scripts/start-backend.sh'), 'utf8')

test('E2E backend launcher exports an overridable non-production payment OTP', () => {
  assert.match(launcher, /PAYMENT_OTP="\$\{E2E_PAYMENT_OTP:-e2e-payment-otp-placeholder\}"/)
  assert.match(launcher, /^export PAYMENT_OTP$/m)
  assert.doesNotMatch(launcher, /PAYMENT_OTP="(?:sk|prod|live)[^"\n]*"/i)
})
