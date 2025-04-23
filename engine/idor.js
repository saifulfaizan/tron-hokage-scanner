const axios = require('axios');
exports.scan = async (url) => {
  console.log(`[IDOR] Brute-forcing resources...`);
  let found = false, dump = [];
  for (let i = 1; i <= 5; i++) {
    try {
      const res = await axios.get(url.replace(/\d+$/, i.toString()));
      dump.push(`ID ${i}: ` + res.status);
      found = true;
    } catch {}
  }
  return found ? { found: true, dump } : { found: false };
};
