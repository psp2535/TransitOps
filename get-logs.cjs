const puppeteer = require('puppeteer-core');

(async () => {
  const browser = await puppeteer.launch({ 
    headless: 'new',
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();

  page.on('console', msg => {
    console.log(`[Browser Console] ${msg.type().toUpperCase()}: ${msg.text()}`);
  });

  page.on('pageerror', error => {
    console.log(`[Browser Error] ${error.message}`);
  });

  page.on('requestfailed', request => {
    console.log(`[Network Error] ${request.url()} - ${request.failure()?.errorText || 'Unknown'}`);
  });

  console.log('Navigating to http://localhost:5174...');
  try {
    await page.goto('http://localhost:5174', { waitUntil: 'networkidle0', timeout: 10000 });
  } catch (e) {
    console.log('Navigation error:', e.message);
  }

  // wait a bit for react to render
  await new Promise(r => setTimeout(r, 2000));

  await browser.close();
})();
