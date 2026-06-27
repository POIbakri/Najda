// Generate clean mobile screenshots of the live app for the README gallery.
// Runs against the demo-mode build (self-contained). Arabic UI, geolocation
// pinned to Al Qua'a centre so the locator shows the القوع short code.
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const BASE = process.env.BASE_URL || "http://localhost:3100";
const OUT = "docs/screenshots";
mkdirSync(OUT, { recursive: true });

const launch = {};
if (process.env.PW_CHROMIUM) { launch.executablePath = process.env.PW_CHROMIUM; launch.args = ["--no-sandbox", "--disable-setuid-sandbox"]; }
const browser = await chromium.launch(launch);

const ctxOpts = {
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 2,
  geolocation: { latitude: 23.5333, longitude: 55.4869, accuracy: 8 },
  permissions: ["geolocation"],
  reducedMotion: "reduce",
};

async function newCtx() {
  const c = await browser.newContext(ctxOpts);
  await c.addInitScript(() => { try { localStorage.setItem("najda:onboarded", "1"); } catch {} });
  return c;
}

const ctx = await newCtx();
const page = await ctx.newPage();
const shotOf = async (p, name) => { await p.screenshot({ path: `${OUT}/${name}.png` }); console.log("✓", name); };
const shot = (name) => shotOf(page, name);
const settle = (ms = 700) => page.waitForTimeout(ms);

// 1) home (SOS button)
await page.goto(`${BASE}/`, { waitUntil: "networkidle" }); await settle();
await page.waitForSelector("text=اطلب المساعدة", { timeout: 6000 }).catch(() => {});
await shot("home");

// 1b) home in English (bilingual proof)
await page.getByRole("button", { name: "EN", exact: true }).click().catch(() => {});
await settle(600);
await shot("home-en");
// back to Arabic for the rest
await page.getByRole("button", { name: "العربية", exact: true }).click().catch(() => {});
await settle(500);

// 2) onboarding (4 steps)
await page.goto(`${BASE}/onboarding`, { waitUntil: "networkidle" }); await settle();
await shot("onboarding-language");
await page.getByRole("button", { name: "متابعة" }).click(); await settle();
await shot("onboarding-role");
await page.getByRole("button", { name: "متابعة" }).click(); await settle();
await shot("onboarding-permission");
await page.getByRole("button", { name: "متابعة" }).click(); await settle();
await shot("onboarding-details");

// 3) responder list (availability + nearby)
await page.goto(`${BASE}/respond`, { waitUntil: "networkidle" }); await settle();
await shot("responder");

// 4) sos type picker
await page.goto(`${BASE}/sos`, { waitUntil: "networkidle" }); await settle(900);
await shot("sos-types");

// 5) locator (pick a type → locator card with القوع)
await page.getByRole("button", { name: "حالة طبية" }).click();
await page.waitForSelector("text=رمز موقعك", { timeout: 8000 }).catch(() => {});
await settle(1200);
await shot("locator");

// 6) send the alert and let the demo responder run it to resolution, so the
//    dashboard shows real metrics (response time, accuracy, totals).
await page.getByRole("button", { name: "أرسل النجدة" }).click().catch(() => {});
await page.waitForURL("**/status/**", { timeout: 10000 }).catch(() => {});
await page.waitForTimeout(16000); // demo responder accepts → approaches → resolves

// 7) dashboard (now populated with the alert's metrics)
await page.goto(`${BASE}/dashboard`, { waitUntil: "networkidle" }); await settle(900);
await shot("dashboard");

await browser.close();
console.log("done");
