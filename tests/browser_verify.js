const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function runBrowserVerification() {
  console.log('Launching browser for verification...');
  const screenshotsDir = path.resolve(__dirname, '..', 'data', 'screenshots');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  // Use the system installed Chrome or Edge
  const browser = await chromium.launch({
    headless: true,
    channel: 'chrome',
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });

  const page = await context.newPage();

  console.log('1. Testing Landing Page: http://localhost:3000');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await page.screenshot({ path: path.join(screenshotsDir, '01_landing_page.png'), fullPage: false });
  console.log('Saved 01_landing_page.png');

  console.log('2. Testing Studio Dashboard: http://localhost:3000/app');
  await page.goto('http://localhost:3000/app', { waitUntil: 'networkidle' });
  await page.screenshot({ path: path.join(screenshotsDir, '02_dashboard.png'), fullPage: false });
  console.log('Saved 02_dashboard.png');

  console.log('3. Testing New Project Flow: http://localhost:3000/app/projects/new');
  await page.goto('http://localhost:3000/app/projects/new', { waitUntil: 'networkidle' });
  await page.screenshot({ path: path.join(screenshotsDir, '03_new_project.png'), fullPage: false });
  console.log('Saved 03_new_project.png');

  console.log('4. Testing Dubbing Studio Editor: http://localhost:3000/app/projects/0641fc30-8187-4708-b344-169a98f8f6d0/editor');
  await page.goto('http://localhost:3000/app/projects/0641fc30-8187-4708-b344-169a98f8f6d0/editor', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(screenshotsDir, '04_studio_editor.png'), fullPage: false });
  console.log('Saved 04_studio_editor.png');

  console.log('5. Testing API & Providers Settings: http://localhost:3000/app/settings/api');
  await page.goto('http://localhost:3000/app/settings/api', { waitUntil: 'networkidle' });
  await page.screenshot({ path: path.join(screenshotsDir, '05_api_settings.png'), fullPage: false });
  console.log('Saved 05_api_settings.png');

  await browser.close();
  console.log('Browser verification completed successfully!');
}

runBrowserVerification().catch((err) => {
  console.error('Browser verification failed:', err);
  process.exit(1);
});
