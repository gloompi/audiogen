import { test, expect } from '@playwright/test';

test('has title and main components', async ({ page }) => {
  await page.goto('http://localhost:3000');

  // Check title
  await expect(page).toHaveTitle(/AI Audio Generator/);

  // Check header
  await expect(page.getByRole('heading', { name: 'AI Audio Generator' })).toBeVisible();

  // Check form elements
  await expect(page.getByPlaceholder('Enter text to convert to speech...')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Generate Speech' })).toBeVisible();

  // Check history section
  await expect(page.getByText('Generation History')).toBeVisible();
});
