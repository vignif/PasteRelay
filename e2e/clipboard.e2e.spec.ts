import { test, expect } from '@playwright/test';

test('data channel opens and text flows between two peers', async ({ browser, page }) => {
  // Page A (owner)
  const pageA = page;
  await pageA.goto('/');
  await pageA.getByRole('link', { name: /create session/i }).click();
  await pageA.waitForURL('**/create', { timeout: 20000 });
  const pinContainer = pageA.getByTestId('pin');
  await expect(pinContainer).toBeVisible({ timeout: 20000 });
  // Wait for a 6-digit PIN to appear
  await expect(pinContainer).toHaveText(/\d{6}/, { timeout: 20000 });
  const pinText = await pinContainer.innerText();
  const match = pinText.match(/\d{6}/);
  expect(match).not.toBeNull();
  const pin = match![0];
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
