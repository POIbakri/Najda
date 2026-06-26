// End-to-end verification of Najda's core demo path in a headless browser.
// Runs against the demo-mode app (no backend keys). Proves the single most
// important flow works: SOS → type → locator → send → live status → a nearby
// responder accepts and approaches → resolved — with no uncaught page errors.
//
// Requires Playwright + Chromium:
//   npm install
//   npx playwright install chromium      # first time only
//   npm run build && npm start &         # serve the app on :3000
//   node scripts/e2e-demo.mjs            # or: npm run e2e
//
// Set BASE_URL to test a deployed URL instead of localhost.
import { chromium } from "playwright";

const BASE = process.env.BASE_URL || "http://localhost:3000";
let failures = 0;
function check(ok, msg) {
  console.log(`${ok ? "PASS" : "FAIL"}  ${msg}`);
  if (!ok) failures++;
}

const launch = {};
// Optional: use a pre-installed Chromium (CI/sandbox) instead of Playwright's download.
if (process.env.PW_CHROMIUM) {
  launch.executablePath = process.env.PW_CHROMIUM;
  launch.args = ["--no-sandbox", "--disable-setuid-sandbox"]; // required when running as root
}

const browser = await chromium.launch(launch);
const ctx = await browser.newContext({
  geolocation: { latitude: 23.531, longitude: 55.49, accuracy: 18 },
  permissions: ["geolocation"],
  locale: "ar",
  reducedMotion: "reduce",
  viewport: { width: 390, height: 844 },
  ignoreHTTPSErrors: true,
});
const page = await ctx.newPage();
await page.addInitScript(() => localStorage.setItem("najda:onboarded", "1"));
const errors = [];
page.on("pageerror", (e) => errors.push(String(e)));

await page.goto(BASE, { waitUntil: "domcontentloaded" });
check((await page.title()).match(/najda|نجدة/i) != null, "home loads");

await page.click('button[aria-label*="اطلب"]', { force: true });
await page.waitForURL("**/sos", { timeout: 10000 });
check(true, "SOS → /sos");

await page.click('button:has-text("حالة طبية")');
await page.waitForSelector("text=أرسل النجدة", { timeout: 15000 });
const code = (await page.locator(".tabular").first().textContent())?.trim() ?? "";
check(code.includes("+"), `locator (Plus Code) rendered: ${code}`);

await page.click('button:has-text("أرسل النجدة")');
await page.waitForURL("**/status/**", { timeout: 10000 });
check(true, "alert sent → /status/[id]");

const searching = await page
  .locator("text=مستجيب قريب")
  .first()
  .waitFor({ timeout: 4000 })
  .then(() => true)
  .catch(() => false);
check(searching, "shows the 'searching' state");

await page
  .waitForSelector("text=قادم إليك, text=في الطريق إليك, text=وصل إلى موقعك", { timeout: 16000 })
  .catch(() => {});
const accepted =
  (await page.locator("text=قادم إليك").count()) +
  (await page.locator("text=في الطريق").count()) +
  (await page.locator("text=وصل إلى موقعك").count());
check(accepted > 0, "a nearby responder accepts and approaches");

await page.waitForSelector("text=وصلت المساعدة", { timeout: 18000 }).catch(() => {});
check((await page.locator("text=وصلت المساعدة").count()) > 0, "alert reaches the resolved state");

check(errors.length === 0, `no uncaught page errors${errors.length ? ": " + errors.join("; ") : ""}`);

await browser.close();
console.log(failures === 0 ? "\n✓ demo path verified" : `\n✗ ${failures} check(s) failed`);
process.exit(failures === 0 ? 0 : 1);
