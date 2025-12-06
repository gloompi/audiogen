import { test, expect } from '@playwright/test';

test.describe('Audio Generator Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Log all requests
    await page.route('**', async route => {
      console.log(`REQUEST: ${route.request().url()}`);
      await route.continue();
    });

    // Mock History API (Initial load)
    await page.route('**/api/history', async route => {
      await route.fulfill({ json: [] });
    });

    // Mock Generate API
    await page.route(/\/api\/generate/, async route => {
      // Simulate network delay to verify loading state
      await new Promise(resolve => setTimeout(resolve, 1500));
      await route.fulfill({ 
        json: {
          id: 'test-id-123',
          prompt: 'Testing the flow',
          voiceId: '21m00Tcm4TlvDq8ikWAM',
          // Valid 1-second silent MP3 base64
          audioData: 'data:audio/mp3;base64,//NExAAAAANIAAAAAExBTUUzLjEwMKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq//NExAAAAANIAAAAAExBTUUzLjEwMKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq',
          createdAt: new Date().toISOString()
        } 
      });
    });

    await page.goto('http://localhost:3000');
  });

  test('should generate audio and update history', async ({ page }) => {
    // Setup stateful mock for history
    let historyCallCount = 0;
    await page.unroute('**/api/history'); // Clear previous mock
    await page.route('**/api/history', async route => {
      historyCallCount++;
      if (historyCallCount <= 1) {
        await route.fulfill({ json: [] });
      } else {
        await route.fulfill({ 
          json: [{
            id: 'test-id-123',
            prompt: 'Testing the flow',
            voiceId: '21m00Tcm4TlvDq8ikWAM',
            audioData: 'data:audio/mp3;base64,test-audio-data',
            createdAt: new Date().toISOString()
          }] 
        });
      }
    });

    // 1. Fill out the form
    const input = page.getByPlaceholder('Enter text to convert to speech...');
    await input.click();
    await input.fill('Testing the flow');
    
    // 2. Click Generate
    const generateBtn = page.locator('button[type="submit"]');
    await expect(generateBtn).toBeEnabled();
    
    // Try pressing Enter to submit
    await input.press('Enter');
    
    // 3. Verify Loading State
    // Increase timeout to allow for hydration/event loop
    await expect(page.getByText('Generating...')).toBeVisible({ timeout: 5000 });
    await expect(generateBtn).toBeDisabled();

    // 4. Wait for completion
    await expect(page.getByText('Generating...')).toBeHidden();
    await expect(generateBtn).toBeEnabled();

    // 5. Verify History Update
    // The history list should auto-refresh. We wait for the item to appear.
    await expect(page.getByText('"Testing the flow"')).toBeVisible();
  });

  test('should delete history item', async ({ page }) => {
    // Mock History API to return one item
    await page.unroute('**/api/history');
    await page.route('**/api/history', async route => {
      await route.fulfill({ 
        json: [{
          id: 'test-id-123',
          prompt: 'Testing the flow',
          voiceId: '21m00Tcm4TlvDq8ikWAM',
          audioData: 'data:audio/mp3;base64,//NExAAAAANIAAAAAExBTUUzLjEwMKqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq',
          createdAt: new Date().toISOString()
        }] 
      });
    });

    // Reload to fetch the mocked history
    await page.reload();

    // Mock Delete API
    await page.route(/\/api\/history\/test-id-123/, async route => {
      await route.fulfill({ json: { success: true } });
    });

    // Hover over the item to show delete button
    const historyItem = page.locator('.group').first();
    await historyItem.hover();

    // Click delete button (force because it might be hidden by hover logic)
    await historyItem.getByLabel('Delete').click({ force: true });

    // Verify item is removed (mocked by UI state update)
    await expect(page.getByText('"Testing the flow"')).toBeHidden();
  });
});
