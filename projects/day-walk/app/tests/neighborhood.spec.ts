import { expect, test, type Page } from "@playwright/test";
const at = (page: Page, now: string) => page.goto(`./?now=${now}`);
async function loadRoutine(page: Page) {
  await page.getByTestId("header-routines").click();
  await page.getByRole("button", { name: "오늘에 불러오기" }).click();
}
test.describe("12-16 reference-quality neighborhood", () => {
  test("renders the day-to-night neighborhood and timed markers", async ({ page }) => {
    await at(page, "2026-09-14T10:00");
    await expect(page.getByRole("img", { name: "아침에서 밤으로 이어지는 3D 애니메이션 주택가" })).toBeVisible();
    await loadRoutine(page);
    await expect(page.locator(".scene-task-marker")).toHaveCount(3);
    await expect(page.locator('.scene-task-marker[aria-label="07:30 Workout"]')).toBeVisible();
  });
});

test.describe("12-17 interactive scene time", () => {
  test("opens a timed-task popover and plants a flag from the neighborhood", async ({ page }) => {
    await at(page, "2026-09-14T10:00");
    const scene = page.getByTestId("cinematic-scene");
    await page.getByTestId("speech-bubble").locator(".speech-text").click();
    const box = await scene.boundingBox();
    if (!box) throw new Error("scene geometry unavailable");
    await page.mouse.click(box.x + box.width / 2, box.y + box.height / 4);
    await page.getByLabel("이미지에서 일정 추가").fill("이미지 일정");
    await page.getByLabel("이미지에서 일정 추가").press("Enter");
    await expect(page.locator('.scene-task-marker[aria-label="15:00 이미지 일정"]')).toBeVisible();
    await expect(page.getByTestId("scene-walker")).toHaveAttribute("data-minute", "600");
  });
});

test.describe("12-18 live walk state", () => {
  test("uses current time, folds passed flags, and hides the character on another date", async ({ page }) => {
    await at(page, "2026-09-14T10:00");
    await loadRoutine(page);
    const walker = page.getByTestId("scene-walker");
    await expect(walker).toHaveAttribute("data-minute", "600");
    await expect(page.locator('.scene-task-marker[aria-label="07:30 Workout"]')).toHaveClass(/is-reached/);
    await expect(page.locator('.scene-task-marker[aria-label="14:00 Meeting"]')).toHaveClass(/is-upcoming/);
    await page.getByRole("button", { name: "다음 날짜" }).click();
    await expect(page.getByTestId("scene-walker")).toHaveCount(0);
  });
});

test.describe("12-19 date picker", () => {
  test("opens below the header date and moves to the selected day", async ({ page }) => {
    await at(page, "2026-09-14T10:00");
    await page.getByTestId("date-label").click();
    await expect(page.getByRole("dialog", { name: "날짜 선택" })).toBeVisible();
    await page.getByRole("button", { name: "2026년 9월 20일", exact: true }).click();
    await expect(page.getByTestId("date-label")).toContainText(/9월 20일|9\/20/);
  });
});


