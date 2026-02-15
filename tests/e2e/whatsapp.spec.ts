import { test, expect } from '@playwright/test';

test.describe('WhatsApp CTA', () => {
  test('floating WhatsApp button has correct wa.me href', async ({ page }) => {
    await page.goto('/');
    const wa = page.locator('a[aria-label="Contactar por WhatsApp"]');
    await expect(wa).toHaveAttribute('href', /wa.me/);
  });

  test('product "Pedir Info" button contains wa.me with product name (if present)', async ({ page }) => {
    // Navigate to product listing — adjust route if your app uses a different path
    await page.goto('/products');

    // Find the first product 'Pedir Info' anchor
    const first = page.locator('a', { hasText: 'Pedir Info' }).first();
    await expect(first).toBeVisible();
    const href = await first.getAttribute('href');
    expect(href).toContain('wa.me');
  });
});
