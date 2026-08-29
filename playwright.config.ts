import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  globalSetup: './e2e/global-setup.ts',
  globalTeardown: './e2e/global-teardown.ts',
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : 1,
  reporter: process.env.CI
    ? [['github'], ['html', { open: 'never' }]]
    : 'list',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    video: 'off',
    screenshot: 'only-on-failure',
  },
  webServer: [
    {
      command: `E2E_BACKEND_DIR=${process.env.E2E_BACKEND_DIR ?? ''} bash scripts/start-backend.sh`,
      url: 'http://localhost:8090/api/health',
      // Never attach to a server started with a different DATABASE_URL. A
      // reused backend can make the direct registration-code fixture appear
      // invalid when it is actually writing to productdb_e2e.
      reuseExistingServer: false,
      timeout: 120_000,
    },
    {
      command: `API_GATEWAY_SECRET="${process.env.E2E_API_SECRET ?? 'e2e'}" npm run dev`,
      url: 'http://localhost:5173',
      reuseExistingServer: false,
      timeout: 120_000,
    },
  ],
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
})
