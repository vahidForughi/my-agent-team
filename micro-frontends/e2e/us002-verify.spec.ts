import { test, expect } from '@playwright/test';

// AC-1: Navigate to /store?cat=laptops — store product list renders (no ErrorBoundary shown)
// AC-2: No RUNTIME-010 error in console
// AC-3: Navigate away and back — no "remote already registered" warning

test.describe('US-002 — RUNTIME-010 Fix Verification', () => {
  test('AC-1+AC-2: /store?cat=laptops renders without ErrorBoundary and no RUNTIME-010', async ({ page }) => {
    const consoleErrors: string[] = [];
    const consoleWarnings: string[] = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
      if (msg.type() === 'warning') {
        consoleWarnings.push(msg.text());
      }
    });

    page.on('pageerror', (err) => {
      consoleErrors.push(`PAGEERROR: ${err.message}`);
    });

    await page.goto('http://localhost:4200/store?cat=laptops');
    await page.waitForTimeout(10000);

    // Screenshot of the store page
    await page.screenshot({
      path: '/private/tmp/claude-502/-Users-vahid-Projects-cloud-native-ecommerce-platform/f643c3da-b4e2-4330-b8c8-0da2a239c0cc/scratchpad/store-initial.png',
      fullPage: true,
    });

    // Check for error boundary
    const errorBoundary = page.locator('[role="alert"], .error-boundary, [class*="error-boundary"]');
    const errorBoundaryCount = await errorBoundary.count();

    // Check for "Failed to Load Micro Frontend" text
    const failedToLoadText = await page.locator('text=Failed to Load').count();
    const failedMicroFrontendText = await page.locator('text=Failed to load micro frontend').count();

    // Check for loading spinner still visible (indicating stuck loading)
    const spinner = page.locator('.ant-spin');
    const spinnerVisible = await spinner.isVisible().catch(() => false);

    console.log('Error boundary elements:', errorBoundaryCount);
    console.log('Failed to Load text count:', failedToLoadText);
    console.log('Failed micro frontend text count:', failedMicroFrontendText);
    console.log('Spinner still visible:', spinnerVisible);
    console.log('Console errors:', JSON.stringify(consoleErrors, null, 2));
    console.log('Console warnings:', JSON.stringify(consoleWarnings, null, 2));

    // AC-2: No RUNTIME-010 error
    const runtime010Errors = consoleErrors.filter(e => e.includes('RUNTIME-010'));
    expect(runtime010Errors, `RUNTIME-010 errors found: ${runtime010Errors.join(', ')}`).toHaveLength(0);

    // AC-1: No error boundary shown
    expect(failedToLoadText + failedMicroFrontendText, 'Error boundary "Failed to Load" text found').toBe(0);
    expect(errorBoundaryCount, 'Error boundary element found').toBe(0);
  });

  test('AC-3: Navigate away and back — no "remote already registered" warning', async ({ page }) => {
    const consoleWarnings: string[] = [];
    const consoleErrors: string[] = [];

    page.on('console', (msg) => {
      if (msg.type() === 'warning') {
        consoleWarnings.push(msg.text());
      }
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    // First visit to store
    await page.goto('http://localhost:4200/store?cat=laptops');
    await page.waitForTimeout(5000);

    // Navigate away
    await page.goto('http://localhost:4200/');
    await page.waitForTimeout(2000);

    // Navigate back to store
    await page.goto('http://localhost:4200/store');
    await page.waitForTimeout(5000);

    await page.screenshot({
      path: '/private/tmp/claude-502/-Users-vahid-Projects-cloud-native-ecommerce-platform/f643c3da-b4e2-4330-b8c8-0da2a239c0cc/scratchpad/store-second-visit.png',
      fullPage: true,
    });

    // Check for "remote already registered" warning
    const remoteAlreadyRegisteredWarnings = consoleWarnings.filter(w =>
      w.toLowerCase().includes('remote already registered') || w.toLowerCase().includes('already registered')
    );
    const runtime010Warnings = consoleWarnings.filter(w => w.includes('RUNTIME-010'));

    console.log('All warnings:', JSON.stringify(consoleWarnings, null, 2));
    console.log('"remote already registered" warnings:', remoteAlreadyRegisteredWarnings);
    console.log('RUNTIME-010 warnings:', runtime010Warnings);

    expect(remoteAlreadyRegisteredWarnings, `"remote already registered" warnings found: ${remoteAlreadyRegisteredWarnings.join(', ')}`).toHaveLength(0);
    expect(runtime010Warnings, `RUNTIME-010 warnings found: ${runtime010Warnings.join(', ')}`).toHaveLength(0);
  });
});
