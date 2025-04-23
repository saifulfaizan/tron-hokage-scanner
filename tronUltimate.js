const fs = require('fs');
const config = require('./config');
const engineModules = {
  sqli: require('./engine/sqli'),
  xss: require('./engine/xss'),
  lfi: require('./engine/lfi'),
  rce: require('./engine/rce'),
  idor: require('./engine/idor'),
  waf: require('./engine/wafBypass'),
  auth: require('./engine/auth'),
  headers: require('./engine/headers'),
};

const modules = Object.keys(engineModules);

async function runAll(url) {
  console.log("🔥 TRON DOMINATION MODE INITIATED 🔥");

  let resultLog = { target: url, results: [], dumps: {} };

  for (const key of modules) {
    const mod = engineModules[key];
    const label = key.toUpperCase();
    try {
      const res = await mod.scan(url);
      const outcome = res && res.found ? "🟢 VULN FOUND" : "🔴 Not Vulnerable";
      console.log(`[${label}]`, outcome);
      resultLog.results.push({ module: label, status: outcome });

      if (res.found && res.dump) {
        resultLog.dumps[label] = res.dump;
      }
    } catch (e) {
      console.log(`[${label}] ❌ ERROR`);
      resultLog.results.push({ module: label, status: "❌ ERROR", error: e.message });
    }
  }

  fs.writeFileSync("tron_result.json", JSON.stringify(resultLog, null, 2));
  console.log("\n✅ Scan Complete.");
  console.log("📁 Saved result & dump to tron_result.json");
}

const input = process.argv[2];
if (!input) {
  console.error("❌ Please provide a URL.");
  process.exit(1);
}

runAll(input);
