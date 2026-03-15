import { test, expect } from '@playwright/test';

test.describe('Bottom Navigation', () => {
  test('navigates between sections using bottom nav', async ({ page }) => {
    await page.goto('/');

    const bottomNav = page.locator('nav[aria-label="Navegación principal"]');
    await expect(bottomNav).toBeVisible();

    const inicio = page.locator('a[aria-label="Inicio"]').first();
    await expect(inicio).toBeVisible();
    await inicio.click();
    await expect(page).toHaveURL(/\/$/);

    const favoritos = page.locator('a[aria-label="Tu selección"]').first();
    await expect(favoritos).toBeVisible();
    await favoritos.click();
    await expect(page).toHaveURL(/\/favoritos/);
  });
});
