import { expect, test, type Page } from "@playwright/test";
import { defaultAppData } from "../src/store/storage.js";
import type { Task } from "../src/schema/index.js";

const task = (id: string, minute: number): Task => ({ id, title: id, slot: { kind: "time", minute }, done: false, starred: false, createdAt: 1, doneAt: null });
async function seed(page: Page, tasks: Task[], now = "2026-09-14T10:00") {
  const data = defaultAppData();
  data.days["2026-09-14"] = tasks;
  await page.addInitScript((value) => {
    if (!localStorage.getItem("day-walk:v1")) localStorage.setItem("day-walk:v1", JSON.stringify(value));
  }, data);
  await page.goto(`./?now=${now}`);
}

test("dotted dividers move the night mask and board together without moving the other boundary", async ({ page, isMobile }) => {
  await seed(page, [task("늦은 회의", 900)]);
  const evening = page.getByTestId("boundary-afternoonEnd");
  const rail = (await page.getByTestId("timeline").boundingBox())!;
  const box = (await evening.boundingBox())!;
  const x = box.x + box.width / 2;
  const y = rail.y + rail.height / 2;
  const maskBefore = await page.locator(".neighborhood-night").evaluate((node) => getComputedStyle(node).maskImage);
  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.mouse.move(rail.x + rail.width * .4375, y, { steps: 12 });
  await expect(evening).toHaveAttribute("aria-valuenow", "840");
  await page.mouse.up();
  await expect(page.getByTestId("boundary-morningEnd")).toHaveAttribute("aria-valuenow", "720");
  await expect(page.getByTestId("column-evening")).toContainText("늦은 회의");
  expect(await page.locator(".neighborhood-night").evaluate((node) => getComputedStyle(node).maskImage)).not.toBe(maskBefore);
  if (!isMobile) {
    const columns = await page.locator(".columns > div").evaluateAll((nodes) => nodes.map((node) => node.getBoundingClientRect().width));
    expect(columns[0]).toBeCloseTo(rail.width * .3125, 0);
    expect(columns[1]).toBeCloseTo(rail.width * .125, 0);
    expect(columns[2]).toBeCloseTo(rail.width * .5625, 0);
    const board = (await page.locator(".board").boundingBox())!;
    expect(box.y).toBeLessThan(rail.y);
    expect(box.y + box.height).toBeGreaterThanOrEqual(board.y + board.height - 1);
  }
  await page.waitForTimeout(350);
  await page.reload();
  await expect(evening).toHaveAttribute("aria-valuenow", "840");
  await evening.focus();
  await page.keyboard.press("Home");
  await expect(evening).toHaveAttribute("aria-valuenow", "780");
  await page.keyboard.press("ArrowLeft");
  await expect(evening).toHaveAttribute("aria-valuenow", "780");
  await expect(page.getByTestId("boundary-morningEnd")).toHaveAttribute("aria-valuenow", "720");
});

test("visible flag responds to real touch drag, persists, and grays its crossed-out label on completion", async ({ page, isMobile }) => {
  await seed(page, [task("발표 준비", 660), task("남은 일", 1200)]);
  const flag = page.getByTestId("flag").filter({ hasText: "발표 준비" });
  const box = (await flag.boundingBox())!;
  const rail = (await page.getByTestId("timeline").boundingBox())!;
  const from = { x: box.x + box.width / 2, y: box.y + box.height / 2 };
  const to = { x: from.x + rail.width * 120 / 960, y: from.y };
  if (isMobile) {
    const cdp = await page.context().newCDPSession(page);
    await cdp.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [from] });
    for (let step = 1; step <= 6; step++) await cdp.send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: from.x + (to.x - from.x) * step / 6, y: from.y }] });
    await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
    await cdp.detach();
  } else {
    await page.mouse.move(from.x, from.y);
    await page.mouse.down();
    await page.mouse.move(to.x, to.y, { steps: 6 });
    await page.mouse.up();
  }
  await expect(flag).toHaveAttribute("aria-valuenow", "780");
  await expect(page.getByTestId("column-afternoon")).toContainText("발표 준비");
  await page.waitForTimeout(350);
  await page.reload();
  await expect(flag).toHaveAttribute("aria-valuenow", "780");
  if (isMobile) await page.getByRole("tab", { name: "오후" }).click();
  await page.getByLabel("발표 준비 완료").check();
  await expect(flag).toHaveAttribute("data-done", "true");
  await expect(flag.locator(".scene-flag-label b")).toHaveCSS("text-decoration-line", "line-through");
  await expect(flag).toHaveCSS("filter", "grayscale(1)");
  await page.getByLabel("발표 준비 완료").uncheck();
  await expect(flag).toHaveAttribute("data-done", "false");
});

test("dismissed bird speech stays hidden across ticks and returns for each new appointment", async ({ page }) => {
  await page.clock.install({ time: new Date("2026-09-14T09:59:00") });
  await seed(page, [task("첫 일정", 600), task("다음 일정", 601)], "2026-09-14T09:59");
  const bubble = page.getByTestId("speech-bubble");
  await bubble.locator(".speech-text").click();
  await expect(bubble).toHaveCount(0);
  await page.clock.fastForward(30_000);
  await expect(bubble).toHaveCount(0);
  await page.getByTestId("bird").click();
  await expect(bubble).toBeVisible();
  await bubble.locator(".speech-text").click();
  await page.clock.fastForward(30_000);
  await expect(bubble).toContainText("첫 일정 할 시간이야");
  await bubble.locator(".speech-text").click();
  await page.clock.fastForward(60_000);
  await expect(bubble).toContainText("다음 일정 할 시간이야");
  await bubble.locator(".speech-text").click();
  await page.getByTestId("bird").click();
  await expect(bubble).toContainText("다음 일정 할 시간이야");
});

test("calendar selects a month and day, isolates date tasks, and returns to today", async ({ page }) => {
  await seed(page, [task("오늘 일정", 600)]);
  await page.getByTestId("date-label").click();
  await page.getByLabel("월", { exact: true }).selectOption("10");
  await page.getByRole("button", { name: "2026년 11월 8일", exact: true }).click();
  await expect(page.getByTestId("date-label")).toHaveAccessibleName(/11월 8일/);
  await expect(page.getByTestId("task-item")).toHaveCount(0);
  await expect(page.getByTestId("bird")).toHaveCount(0);
  await page.getByRole("button", { name: "+ 할 일 추가" }).first().click();
  await page.getByLabel("할 일 제목").fill("다른 날의 일정");
  await page.getByLabel("할 일 제목").press("Enter");
  await page.getByTestId("date-label").click();
  await page.getByRole("button", { name: "오늘로 이동" }).click();
  await expect(page.getByTestId("flag")).toContainText("오늘 일정");
  await expect(page.getByTestId("task-item")).toHaveCount(1);
  await page.getByTestId("date-label").click();
  await page.getByLabel("월", { exact: true }).selectOption("10");
  await page.getByRole("button", { name: "2026년 11월 8일", exact: true }).click();
  await expect(page.getByTestId("task-item")).toContainText("다른 날의 일정");
  await page.getByTestId("date-label").click();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog", { name: "날짜 선택" })).toHaveCount(0);
  await expect(page.getByTestId("date-label")).toBeFocused();
});

test("completion birds fly within the lower board and leave automatically without replaying on reload", async ({ page }) => {
  await page.clock.install({ time: new Date("2026-09-14T10:00:00") });
  await seed(page, [task("마지막 일정", 600)]);
  await page.getByLabel("마지막 일정 완료").check();
  const celebration = page.getByTestId("celebration");
  await expect(celebration.locator(".celebration-bird")).toHaveCount(5);
  const board = (await page.locator(".board").boundingBox())!;
  const box = (await celebration.boundingBox())!;
  expect(box.y).toBeGreaterThanOrEqual(board.y);
  expect(box.height).toBeLessThanOrEqual(board.height);
  expect(await celebration.locator(".celebration-bird").first().evaluate((node) => getComputedStyle(node).offsetPath)).not.toBe("none");
  await page.clock.fastForward(7000);
  await expect(celebration).toHaveCount(0);
  await page.reload();
  await expect(celebration).toHaveCount(0);
});

test("reduced motion shows a quiet completion message and no flying birds", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await seed(page, [task("조용한 하루", 600)]);
  await page.getByLabel("조용한 하루 완료").check();
  await expect(page.getByTestId("celebration")).toBeVisible();
  await expect(page.getByTestId("celebration-flock")).toHaveCount(0);
});

test("a flag aligned with a divider can still be dragged and a canceled drag preserves its time", async ({ page }) => {
  await seed(page, [task("경계의 일정", 720)]);
  const flag = page.getByTestId("flag");
  const box = (await flag.boundingBox())!;
  const rail = (await page.getByTestId("timeline").boundingBox())!;
  const x = box.x + box.width / 2;
  const y = box.y + box.height / 2;
  await page.mouse.move(x, y);
  await page.mouse.down();
  await page.mouse.move(x + rail.width / 16, y, { steps: 4 });
  await page.mouse.up();
  await expect(flag).toHaveAttribute("aria-valuenow", "780");
  await expect(page.getByTestId("boundary-morningEnd")).toHaveAttribute("aria-valuenow", "720");
  const moved = (await flag.boundingBox())!;
  await page.mouse.move(moved.x + moved.width / 2, moved.y + moved.height / 2);
  await page.mouse.down();
  await page.mouse.move(x + rail.width / 8, y, { steps: 4 });
  await flag.dispatchEvent("pointercancel", { pointerId: 1 });
  await page.mouse.up();
  await expect(flag).toHaveAttribute("aria-valuenow", "780");
});
