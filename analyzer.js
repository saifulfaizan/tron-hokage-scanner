// analyzer.js - Cloaked wrapper
const fs = require('fs');
const { runPayloads } = require('./exploitModule');

const inputFile = "active_links.json";
const outputFile = "vuln_result.json";

if (!fs.existsSync(inputFile)) {
  console.error("❌ Missing active_links.json file");
  process.exit(1);
}

const links = JSON.parse(fs.readFileSync(inputFile, "utf-8")).map(link => link.url);

(async () => {
  const results = await runPayloads(links);
  fs.writeFileSync(outputFile, JSON.stringify(results, null, 2));
  console.log(`\n📁 Results saved to ${outputFile}`);
})();
