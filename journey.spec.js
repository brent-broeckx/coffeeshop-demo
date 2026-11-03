const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const URL = 'http://localhost:5287/';
const OUT = path.join(__dirname, 'evidence');
fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });

const results = [];
const check = (name, ok, detail = '') => {
  results.push({ name, ok, detail });
  console.log(`${ok ? 'PASS' : 'FAIL'} ${name} ${detail}`);
};
const shot = (page, name, opts = {}) => page.screenshot({ path: path.join(OUT, `${name}.png`), ...opts });

(async () => {
  const browser = await chromium.launch();

  // Desktop run with video recording.
  const ctx = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    colorScheme: 'dark',
    recordVideo: { dir: OUT, size: { width: 1440, height: 900 } },
  });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));

  await page.goto(URL);
  await page.waitForTimeout(1200);
  await page.mouse.wheel(0, 900);
  await page.waitForTimeout(600);

  const journey = page.locator('#journey');
  check('journey section rendered', (await journey.count()) === 1);
  await page.evaluate(() => {
    const el = document.querySelector('#journey');
    window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 40, behavior: 'smooth' });
  });
  await page.waitForTimeout(900);
  await shot(page, '01-desktop-start');

  const clock = page.locator('[data-clock]');
  const timer = page.locator('[data-timer]');
  const status = page.locator('[data-status]');

  await page.waitForTimeout(2600);
  check('order bubble shown on the way', await page.locator('[data-bubble]').evaluate((e) => e.classList.contains('is-visible')));
  check('timer counting after order', /^\d\d:\d\d$/.test(await timer.textContent()), await timer.textContent());
  await shot(page, '02-desktop-ordered-on-the-way');

  await page
    .waitForFunction(() => /Pulling/.test(document.querySelector('[data-status]').textContent), null, { timeout: 12000 })
    .catch(() => {});
  const midStatus = await status.textContent();
  check('barista stage progresses', /Grinding|Pulling|Steaming|Poured/.test(midStatus), midStatus);
  await shot(page, '03-desktop-brewing');

  await page.locator('[data-done]').waitFor({ state: 'visible', timeout: 8000 });
  await page.waitForTimeout(800);
  const doneTemp = parseInt(await page.locator('[data-done-temp]').textContent());
  check('arrival temperature in 60-70°C sweet spot', doneTemp >= 60 && doneTemp <= 70, `${doneTemp}°C`);
  check('clock advanced to arrival time', (await clock.textContent()) === '08:24', await clock.textContent());
  check('countdown hits zero on arrival', (await timer.textContent()) === '00:00');
  await shot(page, '04-desktop-arrived-walk');
  await page.waitForTimeout(1500);

  // Bike mode restarts with a shorter trip.
  await page.locator('[data-mode="bike"]').click();
  await page.waitForTimeout(400);
  check('bike mode restarts trip', (await page.locator('[data-done]').isHidden()) && (await page.locator('[data-me-icon]').getAttribute('class')).includes('ph-bicycle'));
  await page.waitForTimeout(4000);
  await shot(page, '05-desktop-bike-on-the-way');
  await page.locator('[data-done]').waitFor({ state: 'visible', timeout: 9000 });
  await page.waitForTimeout(800);
  check('bike arrival at 08:16', (await clock.textContent()) === '08:16', await clock.textContent());
  await shot(page, '06-desktop-arrived-bike');
  await page.waitForTimeout(1200);

  // Flat 2D view.
  await page.locator('[data-view]').click();
  await page.waitForTimeout(1500);
  check('2D toggle works', (await page.locator('[data-view]').getAttribute('aria-pressed')) === 'false');
  await shot(page, '07-desktop-2d-view');
  await page.locator('[data-view]').click();
  await page.waitForTimeout(1300);

  // Replay.
  await page.locator('[data-done] [data-replay]').click();
  await page.waitForTimeout(300);
  check('replay resets to start', (await page.locator('[data-done]').isHidden()));
  await page.waitForTimeout(4000);

  check('no console errors', errors.length === 0, errors.join(' | '));
  await ctx.close();

  // Light theme.
  const light = await browser.newContext({ viewport: { width: 1440, height: 900 }, colorScheme: 'light' });
  const lp = await light.newPage();
  await lp.goto(URL + '#journey');
  await lp.waitForTimeout(6000);
  await shot(lp, '08-desktop-light-theme');
  await light.close();

  // Mobile.
  const mob = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, recordVideo: { dir: path.join(OUT, 'mobile'), size: { width: 390, height: 844 } } });
  const mp = await mob.newPage();
  await mp.goto(URL);
  await mp.waitForTimeout(800);
  await mp.evaluate(() => {
    const el = document.querySelector('.journey__stage');
    window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - 90);
  });
  await mp.waitForTimeout(4500);
  await shot(mp, '09-mobile-on-the-way');
  await mp.locator('[data-done]').waitFor({ state: 'visible', timeout: 12000 });
  await mp.waitForTimeout(800);
  await shot(mp, '10-mobile-arrived');
  const overflow = await mp.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  check('no horizontal overflow on mobile', !overflow);
  await mob.close();

  // Reduced motion jumps straight to the final state.
  const rm = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
  const rp = await rm.newPage();
  await rp.goto(URL + '#journey');
  await rp.waitForTimeout(1200);
  check('reduced motion shows final state', await rp.locator('[data-done]').isVisible());
  await rm.close();

  await browser.close();
  fs.writeFileSync(path.join(OUT, 'results.json'), JSON.stringify(results, null, 2));
  const failed = results.filter((r) => !r.ok).length;
  console.log(`\n${results.length - failed}/${results.length} checks passed`);
  process.exit(failed ? 1 : 0);
})();
