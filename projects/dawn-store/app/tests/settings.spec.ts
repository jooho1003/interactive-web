import { expect, test, type Page } from "@playwright/test";

const browserErrors = new WeakMap<Page, string[]>();
test.beforeEach(async ({ page }) => {
  const errors: string[] = [];
  browserErrors.set(page, errors);
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
});

async function openSettings(page: Page) {
  await page.getByRole("button", { name: "설정", exact: true }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
}

test("presets persist, language migrates, and dialog fits with keyboard focus", async ({ page }, info) => {
  await page.goto("/");
  await openSettings(page);
  const dialog = page.getByRole("dialog");
  await expect(page.getByRole("button", { name: "닫기", exact: true })).toBeFocused();
  await page.getByRole("button", { name: "읽기 편하게", exact: true }).click();
  await expect(page.getByLabel("자막 크기")).toHaveValue("large");
  await expect(page.locator(".player-shell")).toHaveAttribute("data-motion", "reduce");
  await expect(page.locator(".subtitle-sample")).toHaveCSS("font-size", info.project.name === "mobile" ? "20px" : "26px");
  const bounds = await dialog.boundingBox();
  expect(bounds!.x).toBeGreaterThanOrEqual(0);
  expect(bounds!.width).toBeLessThanOrEqual(page.viewportSize()!.width);
  expect(bounds!.height).toBeLessThanOrEqual(page.viewportSize()!.height);
  await page.screenshot({ path: test.info().outputPath("settings.png") });
  for (let i = 0; i < 18; i++) {
    await page.keyboard.press("Tab");
    expect(await dialog.evaluate((el) => el.contains(document.activeElement))).toBe(true);
  }
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
  await expect(page.getByRole("button", { name: "설정", exact: true })).toBeFocused();
  await page.reload();
  await openSettings(page);
  await expect(page.getByLabel("자막 크기")).toHaveValue("large");
  await page.getByRole("combobox", { name: "언어", exact: true }).selectOption("en");
  await expect(page.getByRole("heading", { name: "Make it yours" })).toBeVisible();
  await page.getByRole("button", { name: "Reset preferences" }).click();
  await expect(page.getByLabel("Subtitle size")).toHaveValue("normal");
  await expect(page.getByRole("combobox", { name: "Language", exact: true })).toHaveValue("en");
});

test("imports are atomic and exports match saved preferences", async ({ page }) => {
  await page.goto("/");
  await openSettings(page);
  await page.getByRole("button", { name: "조용히", exact: true }).click();
  const before = await page.evaluate(() => localStorage.getItem("dawn-store-preferences-v1"));
  await page.locator('input[type="file"]').setInputFiles({ name: "invalid.json", mimeType: "application/json", buffer: Buffer.from('{"version":2}') });
  await expect(page.getByText(/설정 파일을 확인/)).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem("dawn-store-preferences-v1"))).toBe(before);
  await page.locator('input[type="file"]').setInputFiles({ name: "large.json", mimeType: "application/json", buffer: Buffer.alloc(8193) });
  expect(await page.evaluate(() => localStorage.getItem("dawn-store-preferences-v1"))).toBe(before);
  const downloaded = page.waitForEvent("download");
  await page.getByRole("button", { name: "설정 내보내기" }).click();
  const download = await downloaded;
  await page.getByRole("button", { name: "기본값 복원" }).click();
  await page.locator('input[type="file"]').setInputFiles((await download.path())!);
  await expect(page.getByText("설정을 가져왔습니다.")).toBeVisible();
  await expect(page.getByLabel("전체 음소거")).toBeChecked();
  expect(await page.evaluate(() => localStorage.getItem("dawn-store-preferences-v1"))).toBe(before);
});

test("blocked storage keeps the player usable and reports session-only settings", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, "localStorage", { get() { throw new Error("Storage blocked"); } });
  });
  await page.goto("/");
  await openSettings(page);
  await expect(page.getByText(/이번 관람에만 적용/)).toBeVisible();
  await page.getByRole("button", { name: "읽기 편하게", exact: true }).click();
  await expect(page.getByLabel("자막 크기")).toHaveValue("large");
});

test("legacy preferences and device motion preference are respected", async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem("dawn-store-lang", "en");
    localStorage.setItem("dawn-store-muted", "true");
  });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.getByRole("button", { name: "Unmute", exact: true })).toBeVisible();
  await expect(page.locator(".player-shell")).toHaveAttribute("data-motion", "reduce");
  await page.getByRole("button", { name: "Settings", exact: true }).click();
  await page.getByRole("combobox", { name: "Motion", exact: true }).selectOption("full");
  await expect(page.locator(".player-shell")).toHaveAttribute("data-motion", "full");
});

test("settings pause the clock and a completed chapter can play again", async ({ page }) => {
  await page.clock.install();
  await page.goto("/");
  await expect(page.locator(".node-intro")).toBeVisible();
  await openSettings(page);
  await page.clock.runFor(9000);
  await expect(page.locator(".menu-button")).toHaveCount(0);
  await page.getByRole("button", { name: "닫기", exact: true }).click();
  await page.clock.runFor(8100);
  await page.locator(".menu-button").filter({ hasText: "문을 연다" }).click();
  await expect(page.locator(".node-hub")).toBeVisible();
  await page.clock.runFor(6200);
  await page.locator(".menu-button").filter({ hasText: "잡지" }).click();
  await expect(page.locator(".node-magazine")).toBeVisible();
  await page.clock.runFor(43000);
  await page.getByRole("button", { name: "표지", exact: true }).click();
  await page.clock.runFor(3300);
  await expect(page.locator(".subtitle")).toHaveText("표지가 바랬다. 삼 년 전 호다.");
  await openSettings(page);
  const width = await page.locator(".timeline-track > span").getAttribute("style");
  await page.clock.runFor(5000);
  expect(await page.locator(".timeline-track > span").getAttribute("style")).toBe(width);
  await page.getByRole("button", { name: "닫기", exact: true }).click();
  await page.clock.runFor(1000);
  expect(await page.locator(".timeline-track > span").getAttribute("style")).not.toBe(width);
  await page.evaluate(() => {
    Object.defineProperty(document, "hidden", { configurable: true, get: () => true });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  const hiddenWidth = await page.locator(".timeline-track > span").getAttribute("style");
  await page.clock.runFor(5000);
  expect(await page.locator(".timeline-track > span").getAttribute("style")).toBe(hiddenWidth);
  await page.evaluate(() => {
    Object.defineProperty(document, "hidden", { configurable: true, get: () => false });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await page.clock.runFor(1000);
  expect(await page.locator(".timeline-track > span").getAttribute("style")).not.toBe(hiddenWidth);
});

test("background audio follows volume, mute, and settings pause", async ({ page }) => {
  await page.addInitScript(() => {
    const instances: HTMLAudioElement[] = [];
    class TrackedAudio extends Audio {
      constructor(src?: string) { super(src); instances.push(this); }
    }
    window.Audio = TrackedAudio;
    Reflect.set(window, "__testAudio", instances);
  });
  const bgmState = () => page.evaluate(() => {
    const instances = Reflect.get(window, "__testAudio") as HTMLAudioElement[];
    const bgm = instances.filter((audio) => audio.src.endsWith("bgm.mp3")).at(-1);
    return bgm ? { paused: bgm.paused, volume: bgm.volume } : null;
  });
  await page.goto("/");
  await openSettings(page);
  await page.getByRole("button", { name: "읽기 편하게", exact: true }).click();
  await expect.poll(bgmState).toEqual({ paused: true, volume: 0.2 });
  await page.getByRole("button", { name: "닫기", exact: true }).click();
  await expect.poll(bgmState).toEqual({ paused: false, volume: 0.2 });
  await page.getByRole("button", { name: "소리 끄기", exact: true }).click();
  await expect.poll(bgmState).toEqual({ paused: true, volume: 0.2 });
});

test.afterEach(async ({ page }) => {
  expect(browserErrors.get(page)).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
