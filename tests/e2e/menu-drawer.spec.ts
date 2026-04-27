import { test, expect } from '@playwright/test'

test.describe('Mobile menu drawer', () => {
  test('navega a favoritos desde el menú hamburguesa', async ({ page }) => {
    await page.goto('/')

    await page.getByRole('button', { name: 'Abrir menú' }).click()
    const drawer = page.getByRole('navigation', { name: 'Menú principal' })
    await expect(drawer).toBeVisible()

    await drawer.getByRole('link', { name: 'Inicio' }).click()
    await expect(page).toHaveURL(/\/$/)

    await page.getByRole('button', { name: 'Abrir menú' }).click()
    await drawer.getByRole('link', { name: 'Favoritos' }).click()
    await expect(page).toHaveURL(/\/favoritos/)
  })
})
