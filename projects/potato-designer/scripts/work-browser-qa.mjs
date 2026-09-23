// Run only in a dedicated QA browser; resets this app's test drafts/favorites.
export default async function verifyWorks(page, baseURL = 'http://localhost:4176') {
  const checks = [];
  const errors = [];
  const check = (value, label) => { if (!value) throw new Error(label); checks.push(label); };
  const errorListener = error => errors.push(error.message);
  const openWorks = () => page.locator('.header [data-dialog="work-dialog"]').click();
  page.on('pageerror', errorListener);
  try {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto(baseURL, { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => {
      localStorage.removeItem('potato-designer:favorites:v1');
      localStorage.removeItem('potato-designer:project-draft:v1');
    });
    await page.reload({ waitUntil: 'domcontentloaded' });
    await openWorks();
    check(await page.locator('[data-detail]').count() === 3, 'Three catalog entries render');
    await page.locator('#work-search').fill('로고');
    check(await page.locator('[data-detail]').count() === 1 && await page.locator('[data-detail="brand"]').isVisible(), 'Korean tag search finds brand');
    await page.locator('#work-category').selectOption('digital');
    check(await page.locator('#work-empty').isVisible(), 'Category and query combine into empty state');
    await page.locator('#reset-filters').click();
    check(await page.locator('[data-detail]').count() === 3 && await page.locator('#work-search').evaluate(el => el === document.activeElement), 'Reset restores results and useful focus');
    await page.locator('[data-save="digital"]').click();
    check(await page.locator('[data-save="digital"]').getAttribute('aria-pressed') === 'true', 'Favorite button reflects saved state');
    await page.reload({ waitUntil: 'domcontentloaded' });
    await openWorks();
    check(await page.locator('#saved-count').innerText() === '1', 'Favorite persists across reload');
    await page.locator('#saved-only').click();
    check(await page.locator('[data-detail]').count() === 1 && await page.locator('[data-detail="digital"]').isVisible(), 'Saved-only filter selects favorite');
    await page.locator('[data-save="digital"]').click();
    check(await page.locator('#work-empty').isVisible(), 'Removing last favorite displays empty state');
    check(await page.locator('#saved-only').evaluate(el => el === document.activeElement), 'Removing focused card returns focus to filter');
    await page.locator('#reset-filters').click();
    await page.locator('[data-detail="brand"]').click();
    check(await page.locator('#detail-title').innerText() === 'A little bold', 'Details match selected work');
    check(await page.locator('#detail-title').evaluate(el => el === document.activeElement), 'Detail title receives focus');
    check(await page.locator('#work-dialog').getAttribute('aria-labelledby') === 'detail-title', 'Dialog accessible name follows details');
    check(await page.locator('#detail-deliverables li').count() === 3, 'Detail deliverables render');
    await page.locator('#detail-save').click();
    check(await page.locator('#detail-save').getAttribute('aria-pressed') === 'true', 'Detail can save favorite');
    await page.locator('#back-to-works').click();
    check(await page.locator('[data-detail="brand"]').evaluate(el => el === document.activeElement), 'Back returns focus to original card');
    check(await page.locator('[data-save="brand"]').getAttribute('aria-pressed') === 'true', 'List and detail share favorite state');
    await page.keyboard.press('Escape');
    await page.locator('.header [data-dialog="contact-dialog"]').click();
    await page.locator('#project-brief').fill('이전에 적은 메모를 유지합니다. ✨');
    await page.keyboard.press('Escape');
    await openWorks();
    await page.locator('[data-detail="digital"]').click();
    await page.locator('#detail-brief').click();
    check(await page.locator('#contact-dialog').isVisible() && await page.locator('dialog[open]').count() === 1, 'Detail transitions to a single contact dialog');
    check(await page.locator('#project-brief').inputValue() === '이전에 적은 메모를 유지합니다. ✨', 'Linking work preserves existing note');
    check(await page.locator('#project-type').inputValue() === '디지털 경험' && await page.locator('#brief-reference-title').innerText() === 'In motion', 'Reference and category match selected work');
    await page.keyboard.press('Escape');
    check(await page.locator('.header [data-dialog="work-dialog"]').evaluate(el => el === document.activeElement), 'Chained dialogs restore the original external trigger');
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.locator('.header [data-dialog="contact-dialog"]').click();
    check(await page.locator('#brief-reference').isVisible() && await page.locator('#brief-reference-title').innerText() === 'In motion', 'Reference restores after reload');
    const downloadPromise = page.waitForEvent('download');
    await page.locator('#brief-form button[type="submit"]').click();
    const download = await downloadPromise;
    const chunks = [];
    for await (const chunk of await download.createReadStream()) chunks.push(...chunk);
    const contents = await page.evaluate(bytes => new TextDecoder().decode(new Uint8Array(bytes)), chunks);
    check(contents.includes('참고 작업: In motion (디지털 경험)') && contents.includes('이전에 적은 메모를 유지합니다. ✨'), 'Download contains reference and untouched note');
    await page.locator('#remove-reference').click();
    check(await page.locator('#brief-reference').isHidden() && (await page.locator('#project-brief').inputValue()).includes('이전에'), 'Unlink preserves note');
    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.locator('.header [data-dialog="contact-dialog"]').click();
    check(await page.locator('#brief-reference').isHidden(), 'Unlink survives reload');
    await page.locator('#clear-draft').click();
    await page.keyboard.press('Escape');

    for (const width of [320, 390, 768, 1440]) {
      await page.setViewportSize({ width, height: 844 });
      await openWorks();
      check(await page.locator('#work-dialog').evaluate(el => el.scrollWidth <= el.clientWidth + 1), `${width}px: toolbar and cards fit`);
      await page.locator('[data-detail="character"]').click();
      check(await page.locator('#work-dialog').evaluate(el => el.scrollWidth <= el.clientWidth + 1), `${width}px: details fit`);
      await page.locator('#detail-brief').click();
      check(await page.locator('#contact-dialog').evaluate(el => el.scrollWidth <= el.clientWidth + 1), `${width}px: reference and form fit`);
      await page.locator('#clear-draft').click();
      await page.keyboard.press('Escape');
    }
    const context = await page.context().browser().newContext();
    try {
      await context.route('https://fonts.googleapis.com/**', route => route.abort());
      const isolated = await context.newPage();
      await isolated.addInitScript(() => {
        Storage.prototype.getItem = () => '{invalid JSON';
        Storage.prototype.setItem = () => { throw new Error('Storage full'); };
      });
      await isolated.goto(baseURL, { waitUntil: 'domcontentloaded' });
      await isolated.locator('.header [data-dialog="work-dialog"]').click();
      check(await isolated.locator('[data-detail]').count() === 3, 'Corrupt storage does not break catalog');
      await isolated.locator('[data-save="brand"]').click();
      check(await isolated.locator('[data-save="brand"]').getAttribute('aria-pressed') === 'true' && (await isolated.locator('#favorites-status').innerText()).includes('이번 방문'), 'Failed storage keeps session favorite and explains limitation');
      await isolated.locator('#saved-only').click();
      check(await isolated.locator('[data-detail]').count() === 1, 'Session favorite remains filterable');
    } finally { await context.close(); }
    await page.evaluate(() => localStorage.removeItem('potato-designer:favorites:v1'));
    check(errors.length === 0, `No uncaught errors (${errors.join(', ')})`);
    return { passed: checks.length, checks };
  } finally { page.off('pageerror', errorListener); }
}
