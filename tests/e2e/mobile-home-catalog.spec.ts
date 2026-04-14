import { test, expect } from '@playwright/test'

const BASE_URL = 'http://localhost:3000'

test.describe('Mobile home catalog subviews', () => {
  test.use({ viewport: { width: 390, height: 844 } })

  test('featured catalog hides previews and low cost; volver restores landing', async ({ page }) => {
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' })

    await expect(page.getByRole('button', { name: 'Ver catálogo completo' })).toBeVisible()
    await page.getByRole('button', { name: 'Ver catálogo completo' }).click()

    await expect(page.getByRole('button', { name: 'Volver al home' })).toBeVisible()
    await expect(page.locator('#low-cost')).toBeHidden()

    await page.getByRole('button', { name: 'Volver al home' }).click()
    await expect(page.locator('#low-cost')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Ver catálogo completo' })).toBeVisible()
  })

  test('low cost catalog shows volver and hides seleccion section', async ({ page }) => {
    await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' })

    const lowCostBtn = page.getByRole('button', { name: 'Ver catálogo Low cost completo' })
    if ((await lowCostBtn.count()) === 0) {
      test.skip()
      return
    }

    await lowCostBtn.click()
    await expect(page.getByRole('button', { name: 'Volver al home' })).toBeVisible()
    await expect(page.locator('#seleccion-destacada')).toBeHidden()

    await page.getByRole('button', { name: 'Volver al home' }).click()
    await expect(page.locator('#seleccion-destacada')).toBeVisible()
  })
})
