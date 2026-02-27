import { test, expect } from '@playwright/test'

const BASE_URL = 'http://localhost:3000'

const viewports = [
  { name: 'mobile-360', width: 360, height: 800, expectBottomNav: true },
  { name: 'mobile-390', width: 390, height: 844, expectBottomNav: true },
  { name: 'mobile-412', width: 412, height: 915, expectBottomNav: true },
  { name: 'tablet-768', width: 768, height: 1024, expectBottomNav: false },
]

for (const vp of viewports) {
  test.describe(`Responsive premium audit - ${vp.name}`, () => {
    test.use({ viewport: { width: vp.width, height: vp.height } })

    test('home + detail + anchors behave correctly', async ({ page }) => {
      await page.goto(`${BASE_URL}/`, { waitUntil: 'networkidle' })

      const header = page.locator('header').first()
      await expect(header).toBeVisible()

      const bottomNav = page.locator('nav[aria-label="Navegación principal"]').first()
      if (vp.expectBottomNav) {
        await expect(bottomNav).toBeVisible()
      } else {
        await expect(bottomNav).toBeHidden()
      }

      if (vp.expectBottomNav) {
        await page.locator('a[aria-label="Sobre nosotros"]').first().click()
        await page.waitForTimeout(400)
        const about = page.locator('#about-section')
        await expect(about).toBeVisible()
      }

      const firstCard = page.locator('article a[href^="/guitars/"]').first()
      await expect(firstCard).toBeVisible()
      await firstCard.click()
      await page.waitForLoadState('networkidle')

      const consultButton = page.locator('a', { hasText: 'Consultar' }).first()
      await expect(consultButton).toBeVisible()

      if (vp.expectBottomNav) {
        const sticky = page.locator('a', { hasText: 'Consultar' }).first()
        const stickyBox = await sticky.boundingBox()
        const navBox = await bottomNav.boundingBox()

        expect(stickyBox).not.toBeNull()
        expect(navBox).not.toBeNull()
        if (stickyBox && navBox) {
          expect(stickyBox.y + stickyBox.height).toBeLessThanOrEqual(navBox.y + 2)
        }
      }
    })
  })
}
