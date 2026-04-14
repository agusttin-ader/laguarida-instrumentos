import { test, expect } from '@playwright/test'

/** Set PLAYWRIGHT_BASE_URL if port 3000 is used by another app. */
const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000'

const viewports = [
  { name: 'mobile-360', width: 360, height: 800 },
  { name: 'iphone-se', width: 375, height: 667 },
  { name: 'mobile-390', width: 390, height: 844 },
  { name: 'mobile-412', width: 412, height: 915 },
  { name: 'tablet-768', width: 768, height: 1024 },
  { name: 'desktop-4k', width: 3840, height: 2160 }
]

for (const vp of viewports) {
  test.describe(`Responsive premium audit - ${vp.name}`, () => {
    test.use({ viewport: { width: vp.width, height: vp.height } })

    test('home + detail + anchors behave correctly', async ({ page }) => {
      await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' })

      await expect(
        page.getByAltText(/La Guarida/i).first(),
        `Expected La Guarida home at ${BASE_URL} (set PLAYWRIGHT_BASE_URL if another app uses this port)`
      ).toBeVisible({ timeout: 10000 })

      if (vp.width <= 480) {
        const horizontalOverflow = await page.evaluate(
          () => document.documentElement.scrollWidth - document.documentElement.clientWidth
        )
        expect(horizontalOverflow).toBeLessThanOrEqual(2)
      }

      const header = page.locator('header').first()
      await expect(header).toBeVisible()

      const bottomNav = page.locator('nav[aria-label="Navegación inferior"]')
      await expect(bottomNav).toHaveCount(0)

      if (vp.width < 768) {
        await page.getByRole('button', { name: 'Abrir menú' }).first().click()
        await page.waitForTimeout(350)
        await page.locator('nav[aria-label="Menú principal"] a[href*="about-section"]').first().click()
        await page.waitForTimeout(400)
        const about = page.locator('#about-section')
        await expect(about).toBeVisible()
      } else {
        await page.locator('header.header-desktop a[href*="about-section"]').first().click()
        await page.waitForTimeout(400)
        await expect(page.locator('#about-section')).toBeVisible()
      }

      const firstProductLink = page.locator('main a[href^="/guitars/"]').first()
      await expect(firstProductLink).toBeVisible()
      await firstProductLink.click()
      await page.waitForLoadState('networkidle')

      const consultButton = page.locator('a', { hasText: 'Consultar' }).first()
      await expect(consultButton).toBeVisible()
    })
  })
}
