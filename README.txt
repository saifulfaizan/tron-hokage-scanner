Install dependencies before run:

npm install axios jsdom

To run dashboard bypass:
node bypassAndNavigate.js <login_url>

To crawl links after login:
node postLoginCrawler.js <login_url>

To auto inject all active links:
node autoInjectorFromActive.js

To run auto exploit based on detected vuln:
node autoExploitFromVuln.js

To run TRON shell uploader:
node tronUploader.js https://target.com
