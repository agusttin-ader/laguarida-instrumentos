import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30 * 1000,
  expect: { timeout: 5000 },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: 'list',
  use: {
    actionTimeout: 0,
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    viewport: { width: 375, height: 812 }, // mobile iPhone X
  },
  projects: [
    {
      name: 'Mobile Chromium',
      use: { ...devices['Pixel 5'], viewport: { width: 375, height: 812 } },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
