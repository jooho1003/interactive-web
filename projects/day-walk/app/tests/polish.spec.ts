import { expect, test, type Page } from "@playwright/test";
import { defaultAppData } from "../src/store/storage.js";

async function start(page: Page) {
  const data = defaultAppData();
  data.days["2026-09-14"] = [
    { id: "edit", title: "시각 편집 일정", slot: { kind: "time", minute: 660 }, done: false, starred: false, createdAt: 1, doneAt: null },
    { id: "untimed", title: "시각 없는 일정", slot: { kind: "segment", segment: "morning" }, done: false, starred: false, createdAt: 2, doneAt: null },
  ];
  await page.addInitScript((value) => { if (!localStorage.getItem("day-walk:v1")) localStorage.setItem("day-walk:v1", JSON.stringify(value)); }, data);
  await page.goto("./?now=2026-09-14T10:00");
}

test("typing a precise task time moves its flag and column, supports cancellation and persists", async ({ page, isMobile }) => {
  await start(page);
  const input = page.getByRole("textbox", { name: "시각 편집 일정 시각", exact: true });
  await input.fill("14:23");
  await input.press("Enter");
  const flag = page.getByTestId("flag").filter({ hasText: "시각 편집 일정" });
  await expect(flag).toHaveAttribute("aria-valuenow", "863");
  await expect(page.getByTestId("column-afternoon")).toContainText("시각 편집 일정");
  await expect(input).toHaveValue("14:23");
  await input.fill("16:14");
  await input.press("Escape");
  await expect(input).toHaveValue("14:23");
  await expect(flag).toHaveAttribute("aria-valuenow", "863");
  await input.fill("25:10");
  await input.press("Enter");
  await expect(input).toHaveAttribute("aria-invalid", "true");
  await expect(flag).toHaveAttribute("aria-valuenow", "863");
  await input.press("Escape");
  if (isMobile) await page.getByRole("tab", { name: "아침" }).click();
  const untimed = page.getByRole("textbox", { name: "시각 없는 일정 시각", exact: true });
  await untimed.fill("10:17");
  await untimed.press("Tab");
  await expect(page.getByTestId("flag").filter({ hasText: "시각 없는 일정" })).toHaveAttribute("aria-valuenow", "617");
  await page.waitForTimeout(350);
  await page.reload();
  await expect(flag).toHaveAttribute("aria-valuenow", "863");
});

test("typing a boundary time moves the divider and natural evening transition without applying magnetic snapping", async ({ page, isMobile }) => {
  await start(page);
  if (isMobile) await page.getByRole("tab", { name: "오후" }).click();
  const input = page.getByRole("textbox", { name: "점심 구간 마감 시각", exact: true });
  await input.fill("15:27");
  await input.press("Enter");
  await expect(page.getByTestId("boundary-afternoonEnd")).toHaveAttribute("aria-valuenow", "927");
  await expect(page.locator(".neighborhood-night")).toHaveCSS("filter", "none");
  const scene = (await page.getByTestId("scene").boundingBox())!;
  expect(scene.height).toBeGreaterThan(isMobile ? 390 : 500);
  expect(await page.locator(".neighborhood-night").evaluate((node) => getComputedStyle(node).maskImage)).toContain("44.8125%");
  const bird = (await page.getByTestId("bird").boundingBox())!;
  const person = (await page.getByTestId("scene-walker").boundingBox())!;
  expect(bird.y + bird.height).toBeLessThanOrEqual(person.y + 1);
});

test("flag drag snaps near the hour and half hour but moves freely outside the magnetic window", async ({ page }) => {
  await start(page);
  const flag = page.getByTestId("flag");
  const rail = (await page.getByTestId("timeline").boundingBox())!;
  for (const [target, expected] of [[717, 720], [746, 750], [739, 739]]) {
    const current = Number(await flag.getAttribute("aria-valuenow"));
    const box = (await flag.boundingBox())!;
    const x = box.x + box.width / 2, y = box.y + box.height / 2;
    await page.mouse.move(x, y);
    await page.mouse.down();
    await page.mouse.move(x + (target - current) * rail.width / 960, y, { steps: 6 });
    await page.mouse.up();
    await expect(flag).toHaveAttribute("aria-valuenow", String(expected));
  }
});

test("direct overnight input keeps the schedule on the logical day", async ({ page, isMobile }) => {
  await start(page);
  if (isMobile) await page.getByRole("tab", { name: "저녁" }).click();
  await page.getByRole("textbox", { name: "저녁 구간 마감 시각", exact: true }).fill("01:00");
  await page.getByRole("textbox", { name: "저녁 구간 마감 시각", exact: true }).press("Enter");
  if (isMobile) await page.getByRole("tab", { name: "아침" }).click();
  const input = page.getByRole("textbox", { name: "시각 편집 일정 시각", exact: true });
  await input.fill("00:27");
  await input.press("Enter");
  await expect(page.getByTestId("flag")).toHaveAttribute("aria-valuenow", "1467");
  await expect(input).toHaveValue("00:27");
  await expect(page.getByTestId("column-evening")).toContainText("시각 편집 일정");
});
