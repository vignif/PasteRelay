import { test, expect } from '@playwright/test';

test('data channel opens and text flows between two peers', async ({ browser, page }) => {
  // Page A (owner)
  const pageA = page;
  await pageA.goto('/');
  await pageA.getByRole('link', { name: /create session/i }).click();
  const pinEl = pageA.locator('text=••••••');
  await expect(pinEl).not.toBeVisible(); // eventually replaced by real PIN
  const pinText = await pageA.locator('main div').nth(1).innerText();
  const pin = pinText.replace(/\D/g, '').slice(0, 6);
  expect(pin.length).toBeGreaterThan(0);

  // Page B (guest)
  const pageB = await browser.newPage();
  await pageB.goto('/');
  await pageB.getByRole('link', { name: /join session/i }).click();
  await pageB.getByPlaceholder(/enter pin/i).fill(pin);
  await pageB.getByRole('button', { name: /join/i }).click();

  // Both should reach the room; type in A, appear in B
  await pageA.waitForURL(/\/room\//, { timeout: 20_000 });
  await pageB.waitForURL(/\/room\//, { timeout: 20_000 });

  await pageA.getByPlaceholder(/type text to share/i).fill('hello from A');
  await pageA.getByRole('button', { name: /share/i }).click();

  await expect(pageB.locator('text=hello from A')).toBeVisible({ timeout: 10_000 });
});
