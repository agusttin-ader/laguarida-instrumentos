import { test, expect } from '@playwright/test';

test.describe('Bottom Navigation', () => {
  test('navigates between sections using bottom nav', async ({ page }) => {
    await page.goto('/');

    const categorias = page.locator('a[aria-label="Categorías"]').first();
    await expect(categorias).toBeVisible();
    await categorias.click();
    await expect(page).toHaveURL(/\/categories|\/categor/);

    const inicio = page.locator('a[aria-label="Inicio"]').first();
    await inicio.click();
    await expect(page).toHaveURL(/\/$/);
  });
});
