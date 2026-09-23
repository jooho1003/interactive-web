// Pass a Playwright Page from the browser QA runner. No production dependency.
export default async function verify(page, baseURL = 'http://localhost:4176') {
  const passed = [];
  const errors = [];
  const onError = error => errors.push(error.message);
  const onResponse = response => {
    if (response.url().startsWith(baseURL) && response.status() >= 400) errors.push(`${response.status()} ${response.url()}`);
  };
  const check = (condition, message) => {
    if (!condition) throw new Error(message);
    passed.push(message);
  };
  const openContact = () => page.locator('.header [data-dialog="contact-dialog"]').click();
  page.on('pageerror', onError);
  page.on('response', onResponse);
  try {
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(baseURL, { waitUntil: 'domcontentloaded' });
    // Clear only this app's draft in the dedicated QA browser.
    await openContact();
    await page.locator('#clear-draft').click();
    await page.keyboard.press('Escape');
    await page.waitForFunction(() => document.querySelector('.character-motion').getAnimations().every(animation => animation.playState === 'finished'));
    check(await page.locator('.character').evaluate(el => el.complete && el.naturalWidth === 1254), 'Character asset loads');
    check(await page.locator('.character-parallax').evaluate(el => el.clientHeight <= el.parentElement.clientHeight + 1), 'Character fits its grid track');
    await page.locator('[data-scene="digital"]').click();
    check(await page.locator('.stage-word').innerText() === 'MOVE', 'Scene changes content');
    check(await page.locator('[data-scene][aria-pressed="true"]').count() === 1, 'Exactly one scene is selected');
    await page.locator('#motion-toggle').click();
    check(await page.locator('.character').evaluate(el => getComputedStyle(el).animationPlayState === 'paused'), 'Pause stops character animation');
    const frozen = await page.locator('.character-parallax').evaluate(el => getComputedStyle(el).transform);
    await page.mouse.move(900, 300);
    check(await page.locator('.character-parallax').evaluate(el => getComputedStyle(el).transform) === frozen, 'Pause preserves the current pose');
    await page.locator('.header [data-dialog="work-dialog"]').click();
    await page.locator('[data-work="character"]').click();
    check(await page.locator('#motion-toggle').getAttribute('aria-pressed') === 'true', 'Selecting work respects user pause');
    check(await page.locator('.stage-word').innerText() === 'HEY!', 'Work selection applies its scene');
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.waitForFunction(() => document.querySelector('#replay').disabled);
    check(await page.locator('#motion-toggle').isDisabled() && await page.locator('#replay').isDisabled(), 'Reduced motion disables both playback controls');
    check((await page.locator('#motion-toggle').innerText()).includes('REDUCED MOTION'), 'Reduced motion has an accurate label');
    const sceneA = await page.locator('.character-parallax').evaluate(el => getComputedStyle(el).transform);
    await page.locator('[data-scene="digital"]').click();
    check(await page.locator('.character-parallax').evaluate(el => getComputedStyle(el).transform) !== sceneA, 'Reduced motion preserves static scene variations');
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.waitForFunction(() => !document.querySelector('#replay').disabled);
    check(await page.locator('#motion-toggle').getAttribute('aria-pressed') === 'true', 'OS setting change preserves manual pause');
    await page.locator('#replay').click();
    check(await page.locator('#motion-toggle').getAttribute('aria-pressed') === 'false', 'Explicit replay resumes animation');

    for (const id of ['work', 'about', 'contact']) {
      const trigger = page.locator(`.header [data-dialog="${id}-dialog"]`);
      await trigger.click();
      check(await page.locator(`#${id}-dialog`).evaluate(el => el.contains(document.activeElement)), `${id}: focus enters dialog`);
      check(await page.locator('.character').evaluate(el => getComputedStyle(el).animationPlayState === 'paused'), `${id}: background motion pauses`);
      let backgroundReached = false;
      for (let i = 0; i < 8; i++) {
        await page.keyboard.press('Tab');
        // Native dialogs can yield to browser chrome, represented by BODY.
        backgroundReached ||= await page.locator(`#${id}-dialog`).evaluate(el => document.activeElement !== document.body && !el.contains(document.activeElement));
      }
      check(!backgroundReached, `${id}: keyboard cannot reach background controls`);
      await page.keyboard.press('Escape');
      check(await trigger.evaluate(el => el === document.activeElement), `${id}: Escape restores trigger focus`);
    }
    await page.locator('.header [data-dialog="about-dialog"]').click();
    await page.mouse.click(5, 5);
    check(await page.locator('dialog[open]').count() === 0, 'Backdrop closes dialog');

    await openContact();
    await page.locator('#project-type').selectOption({ label: '디지털 경험' });
    await page.locator('#project-brief').fill('검수용 프로젝트\n한글과 emoji ✨');
    await page.reload({ waitUntil: 'domcontentloaded' });
    await openContact();
    check(await page.locator('#project-type').inputValue() === '디지털 경험' && await page.locator('#project-brief').inputValue() === '검수용 프로젝트\n한글과 emoji ✨', 'Draft and category survive reload');
    const downloadPromise = page.waitForEvent('download');
    await page.locator('#brief-form button[type="submit"]').click();
    const download = await downloadPromise;
    const stream = await download.createReadStream();
    const chunks = [];
    for await (const chunk of stream) chunks.push(chunk);
    const content = await page.evaluate(bytes => new TextDecoder().decode(new Uint8Array(bytes)), chunks.flatMap(chunk => Array.from(chunk)));
    check(download.suggestedFilename() === 'potato-project-note.txt' && content.includes('분야: 디지털 경험') && content.includes('검수용 프로젝트\n한글과 emoji ✨'), 'Downloaded file contains selected category and full Unicode note');
    await page.locator('#project-brief').fill('   ');
    await page.locator('#brief-form button[type="submit"]').click();
    check((await page.locator('#form-status').innerText()).includes('입력해주세요'), 'Whitespace-only note is rejected');
    await page.locator('#clear-draft').click();
    await page.reload({ waitUntil: 'domcontentloaded' });
    await openContact();
    check(await page.locator('#project-brief').inputValue() === '', 'Cleared draft stays cleared after reload');
    await page.keyboard.press('Escape');

    for (const width of [320, 390, 768, 1024, 1440, 1920]) {
      await page.setViewportSize({ width, height: 900 });
      check(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${width}px: no horizontal page overflow`);
      await page.locator('.header [data-dialog="work-dialog"]').click();
      check(await page.locator('#work-dialog').evaluate(el => el.scrollWidth <= el.clientWidth + 1), `${width}px: work dialog fits horizontally`);
      await page.locator('[data-work="character"]').scrollIntoViewIfNeeded();
      await page.locator('[data-work="character"]').click();
      check(await page.locator('dialog[open]').count() === 0, `${width}px: last work card is reachable`);
    }

    const context = await page.context().browser().newContext();
    try {
      await context.route('https://fonts.googleapis.com/**', route => route.abort());
      const isolated = await context.newPage();
      await isolated.addInitScript(() => {
        Storage.prototype.getItem = () => { throw new Error('Storage blocked'); };
        Storage.prototype.setItem = () => { throw new Error('Storage blocked'); };
        Storage.prototype.removeItem = () => { throw new Error('Storage blocked'); };
      });
      await isolated.goto(baseURL, { waitUntil: 'domcontentloaded' });
      await isolated.locator('.header [data-dialog="contact-dialog"]').click();
      await isolated.locator('#project-brief').fill('저장소 없이 메모 저장');
      check((await isolated.locator('#draft-status').innerText()).includes('자동 저장할 수 없습니다'), 'Blocked storage displays recovery guidance');
      const fallbackDownload = isolated.waitForEvent('download');
      await isolated.locator('#brief-form button[type="submit"]').click();
      check((await fallbackDownload).suggestedFilename() === 'potato-project-note.txt', 'Download works when storage is blocked');
      await isolated.locator('#clear-draft').click();
      check(await isolated.locator('#project-brief').inputValue() === '', 'Clear form works when storage is blocked');
    } finally { await context.close(); }
    check(errors.length === 0, `No uncaught browser errors or failed local responses (${errors.join(', ')})`);
    return { passed: passed.length, checks: passed };
  } finally {
    page.off('pageerror', onError);
    page.off('response', onResponse);
  }
}
