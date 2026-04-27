// playwright-login-otp.spec.js
// Automated test: Login and OTP verification for TimeChime (Version 2)
// Usage: npx playwright test testing/playwright-login-otp.spec.js

const { test, expect } = require('@playwright/test');

test('Login and OTP verification', async ({ page }) => {
  // Go to the login page
  await page.goto('http://localhost:3001');

  // Fill in login form
  await page.fill('#loginUsername', 'pranav.agarwal'); // Change as needed
  await page.fill('#loginPassword', 'hashed_password_123'); // Change as needed
  await page.click('#loginForm button[type="submit"]');

  // Wait for OTP phase
  await page.waitForSelector('#phase2-otp:not(.hidden)', { timeout: 5000 });

  // Fill in OTP
  await page.fill('#otpInput', '123456');
  await page.click('#otpForm button[type="submit"]');

  // Wait for dashboard
  await page.waitForSelector('#phase3-dashboard:not(.hidden)', { timeout: 5000 });

  // Check dashboard is visible
  const dashboardVisible = await page.isVisible('#phase3-dashboard');
  expect(dashboardVisible).toBeTruthy();

  // Optionally, check for a welcome message
  await expect(page.locator('.app-header h1')).toHaveText(/Welcome to TimeChime/i);

  // Print result
  console.log('Login and OTP flow succeeded.');
});
