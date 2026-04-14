import { test, expect } from '@playwright/test'

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000'

test.describe('Admin smoke', () => {
  test('login page loads and shows form', async ({ page }) => {
    const res = await page.goto(`${BASE_URL}/admin/login`, { waitUntil: 'networkidle' })
    expect(res?.ok()).toBeTruthy()

    await expect(page.locator('input[type="email"]')).toBeVisible({ timeout: 15000 })
    await expect(page.locator('input[type="password"]')).toBeVisible()
    await expect(page.locator('form').locator('button[type="submit"]')).toBeVisible()
  })

  test('unauthenticated /admin redirects to login', async ({ page }) => {
    await page.goto(`${BASE_URL}/admin`, { waitUntil: 'networkidle' })
    await expect(page).toHaveURL(/\/admin\/login/)
  })
})
