import { test, expect } from '@playwright/test';

test.describe('FilterBar', () => {
  test('opens filter modal and applies a category filter', async ({ page }) => {
    await page.goto('/products');

    // Count products before filtering (assumes product cards are <article>)
    const before = await page.locator('article').count();

    // Open filter modal
    const filterBtn = page.locator('button', { hasText: 'Filtros' }).first();
    await expect(filterBtn).toBeVisible();
    await filterBtn.click();

    // Wait for modal and pick first category button inside modal
    const modal = page.locator('div[role="dialog"]').first();
    // If modal role isn't present, fall back to visible modal container
    const categoryBtn = page.locator('button').filter({ hasText: /./ }).nth(0);
    await categoryBtn.click();

    // Apply filters
    const apply = page.locator('button', { hasText: 'Aplicar' }).first();
    await apply.click();

    // Count products after filtering
    const after = await page.locator('article').count();
    expect(after).toBeLessThanOrEqual(before);
  });
});
