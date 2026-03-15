import { test, expect } from '@playwright/test';

test.describe('WhatsApp CTA', () => {
  test('home has a WhatsApp CTA with correct wa.me href', async ({ page }) => {
    await page.goto('/');
    const wa = page.locator('a[href*="wa.me"]').first();
    await expect(wa).toBeVisible();
    await expect(wa).toHaveAttribute('href', /wa\.me/);
  });

  test('product page has Consultar por WhatsApp with wa.me', async ({ page }) => {
    await page.goto('/');
    const firstProduct = page.locator('a[href^="/guitars/"]').first();
    await expect(firstProduct).toBeVisible();
    await firstProduct.click();
    await page.waitForLoadState('networkidle');

    const consultLink = page.locator('a[href*="wa.me"]', { hasText: /Consultar|WhatsApp/i }).first();
    await expect(consultLink).toBeVisible();
    await expect(consultLink).toHaveAttribute('href', /wa\.me/);
  });
});
