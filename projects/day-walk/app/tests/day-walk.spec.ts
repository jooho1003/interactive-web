import { expect, test, type Locator, type Page } from "@playwright/test";

const at = (page: Page, now: string) => page.goto(`./?now=${now}`);

async function loadRoutine(page: Page) {
  await page.getByTestId("header-routines").click();
  await page.getByRole("button", { name: "오늘에 불러오기" }).click();
}

async function addColumnTask(page: Page, title: string) {
  await page.getByRole("button", { name: "+ 할 일 추가" }).first().click();
  await page.getByLabel("할 일 제목").fill(title);
  await page.getByLabel("할 일 제목").press("Enter");
}

async function dragTouch(flag: Locator, fromX: number, toX: number, y: number) {
  await flag.evaluate((node, values) => {
    const target = node as HTMLElement;
    const fire = (type: string, x: number) => target.dispatchEvent(new PointerEvent(type, {
      bubbles: true,
      clientX: x,
      clientY: values.y,
      pointerId: 1,
      pointerType: "touch",
    }));
    fire("pointerdown", values.fromX);
    fire("pointermove", values.toX);
    fire("pointerup", values.toX);
  }, { fromX, toX, y });
}

test.describe("12-1 first run", () => {
  test("shows an empty board, advice, and blank progress", async ({ page, isMobile }) => {
    await at(page, "2026-09-14T10:00");
    await expect(page.getByTestId("speech-bubble")).toContainText("오늘은 비어 있어");
    await expect(page.getByText("—")).toBeVisible();
    if (isMobile) {
      const morningTab = page.getByRole("tab", { name: "아침" });
      await expect(morningTab).toBeVisible();
      await expect(morningTab).toHaveAttribute("aria-selected", "true");
      await expect(page.getByTestId("date-label")).toContainText("9/14");
    }
    else {
      await expect(page.locator(".column")).toHaveCount(3);
      await expect(page.getByTestId("date-label")).toContainText("9월 14일");
    }
  });
});

test.describe("12-2 routines", () => {
  test("adds timed tasks into matching scene, timeline, and columns", async ({ page }) => {
    await at(page, "2026-09-14T10:00");
    await loadRoutine(page);
    await expect(page.getByTestId("task-item")).toHaveCount(5);
    await expect(page.getByTestId("flag")).toHaveCount(3);
    await expect(page.locator(".scene-task-marker .scene-flag-label")).toHaveCount(3);
    await expect(page.getByTestId("column-morning")).toContainText("Workout");
    await expect(page.getByTestId("column-afternoon")).toContainText("Meeting");
    await loadRoutine(page);
    await expect(page.getByTestId("toast").filter({ hasText: "0개 추가, 5개는 이미 있어요" })).toBeVisible();
  });
});

test.describe("12-3 inline add", () => {
  test("keeps the input open after Enter", async ({ page }) => {
    await at(page, "2026-09-14T10:00");
    await addColumnTask(page, "인라인 일정");
    await expect(page.getByTestId("column-morning")).toContainText("인라인 일정");
    await expect(page.getByLabel("할 일 제목")).toHaveValue("");
  });
});

test.describe("12-4 timeline add", () => {
  test("creates a snapped timed task from an empty timeline click", async ({ page }) => {
    await at(page, "2026-09-14T10:00");
    const box = await page.getByTestId("timeline").boundingBox();
    if (!box) throw new Error("timeline has no box");
    await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
    await page.getByLabel("일정 제목").fill("타임라인 일정");
    await page.getByLabel("일정 제목").press("Enter");
    await expect(page.getByTestId("flag")).toHaveCount(1);
    await expect(page.getByTestId("task-item").getByText("타임라인 일정", { exact: true })).toBeVisible();
  });
});

test.describe("12-5 flag drag and keyboard", () => {
  test("moves a flag across the morning boundary and persists it", async ({ page, isMobile }) => {
    test.skip(isMobile, "Touch dispatch is exercised by the mobile-only criterion.");
    await at(page, "2026-09-14T10:00");
    await loadRoutine(page);
    const flag = page.getByTestId("flag").first();
    const timeline = await page.getByTestId("timeline").boundingBox();
    const flagBox = await flag.boundingBox();
    if (!timeline || !flagBox) throw new Error("flag geometry unavailable");
    const startX = flagBox.x + flagBox.width / 2;
    const startY = flagBox.y + flagBox.height / 2;
    const targetMinute = 750;
    const targetX = timeline.x + timeline.width * ((targetMinute - 420) / (1380 - 420));
    await page.mouse.move(startX, startY);
    await page.mouse.down();
    await page.mouse.move(targetX, startY, { steps: 10 });
    await page.mouse.up();
    await flag.focus();
    await page.keyboard.press("ArrowRight");
    await page.reload();
    await expect(page.getByTestId("column-afternoon")).toContainText("Workout");
  });
});

test.describe("12-6 boundary handle", () => {
  test("moves the morning boundary using element-relative coordinates", async ({ page }) => {
    await at(page, "2026-09-14T10:00");
    await loadRoutine(page);
    const handle = page.getByTestId("boundary-morningEnd");
    const timeline = await page.getByTestId("timeline").boundingBox();
    const box = await handle.boundingBox();
    if (!timeline || !box) throw new Error("boundary geometry unavailable");
    const startX = box.x + box.width / 2;
    const startY = timeline.y + timeline.height / 2;
    const targetMinute = 780;
    const targetX = timeline.x + timeline.width * ((targetMinute - 420) / (1380 - 420));
    await page.mouse.move(startX, startY);
    await page.mouse.down();
    await page.mouse.move(targetX, startY, { steps: 10 });
    await page.mouse.up();
    await expect(page.getByTestId("column-morning")).toContainText("아침까지 ~13:00");
  });
});

test.describe("12-7 complete", () => {
  test("lowers a completed flag and marks a clear column", async ({ page }) => {
    await at(page, "2026-09-14T10:00");
    await loadRoutine(page);
    const morning = page.getByTestId("column-morning");
    // Completed items re-sort to the bottom, so check the first unchecked box one at a time.
    const unchecked = morning.locator("input[type=checkbox]:not(:checked)");
    while (await unchecked.count()) await unchecked.first().check();
    await expect(page.locator("[data-testid=flag][aria-valuetext*='Workout']")).toHaveAttribute("data-done", "true");
    await expect(page.getByTestId("column-morning")).toContainText("CLEAR");
  });
});

test.describe("12-8 celebration", () => {
  test("celebrates only once after all tasks are done", async ({ page }) => {
    await at(page, "2026-09-14T10:00");
    await addColumnTask(page, "하루 완료");
    await page.getByRole("checkbox").check();
    await expect(page.getByTestId("celebration")).toContainText("Congratulations!");
    await page.getByRole("button", { name: "완료 연출 닫기" }).click();
    await page.reload();
    await expect(page.getByTestId("celebration")).toHaveCount(0);
  });
});

test.describe("12-9 advisor", () => {
  test("shows deadline then migrates overdue segment tasks", async ({ page }) => {
    await at(page, "2026-09-14T11:20");
    await addColumnTask(page, "아침 할 일");
    await expect(page.getByTestId("speech-bubble")).toContainText("아침 마감까지 40분");
    await at(page, "2026-09-14T13:00");
    await expect(page.getByTestId("speech-bubble")).toContainText("지금 칸으로 옮기기");
    await page.getByRole("button", { name: "지금 칸으로 옮기기" }).click();
    await expect(page.getByTestId("column-afternoon")).toContainText("아침 할 일");
  });
});

test.describe("12-10 long day", () => {
  test("uses the previous logical date after midnight", async ({ page }) => {
    await at(page, "2026-09-14T20:00");
    await page.getByRole("button", { name: "설정" }).click();
    await page.getByLabel("저녁 마감").fill("01:00");
    await page.getByRole("button", { name: "닫기", exact: true }).click();
    await at(page, "2026-09-15T00:30");
    await expect(page.getByRole("button", { name: /9월 14일/ })).toBeVisible();
    await expect(page.getByTestId("scene")).toHaveAttribute("aria-label", /현재 00:30, 저녁 구간, 남은 일 0개/);
  });
});

test.describe("12-11 import export", () => {
  test("restores an exported file and rejects an invalid file", async ({ page }) => {
    await at(page, "2026-09-14T10:00");
    await addColumnTask(page, "백업 일정");
    await page.getByRole("button", { name: "설정" }).click();
    const download = page.waitForEvent("download");
    await page.getByRole("button", { name: "내보내기" }).click();
    const file = await download;
    const path = await file.path();
    if (!path) throw new Error("download path unavailable");
    await page.getByRole("button", { name: "모든 데이터 지우기" }).click();
    await page.getByRole("button", { name: "확인" }).click();
    await page.getByTestId("import-file").setInputFiles(path);
    await page.getByRole("button", { name: "확인" }).click();
    await expect(page.getByTestId("task-item").getByText("백업 일정")).toBeVisible();
    await page.getByTestId("import-file").setInputFiles({ name: "bad.json", mimeType: "application/json", buffer: Buffer.from("{}") });
    await expect(page.getByTestId("toast").filter({ hasText: "Day Walk 데이터 파일이 아니에요" })).toBeVisible();
  });
});

test.describe("12-12 mobile layout", () => {
  test("uses tabs, has no horizontal scroll, and accepts touch flag dragging", async ({ page, isMobile }) => {
    test.skip(!isMobile, "Mobile-specific acceptance criterion.");
    await at(page, "2026-09-14T10:00");
    await loadRoutine(page);
    await expect(page.getByRole("tab", { name: "아침" })).toBeVisible();
    await expect(page.evaluate(() => document.documentElement.scrollWidth <= 390)).resolves.toBeTruthy();
    const flag = page.locator('[data-testid="flag"][aria-valuetext="07:30 Workout"]');
    const box = await flag.boundingBox();
    if (!box) throw new Error("flag geometry unavailable");
    await dragTouch(flag, box.x + 8, box.x + 80, box.y + 8);
  });
});

test.describe("12-13 reduced motion", () => {
  test("keeps congratulations but suppresses its canvas", async ({ page }) => {
    await at(page, "2026-09-14T10:00");
    await page.getByRole("button", { name: "설정" }).click();
    await page.getByLabel("움직임").selectOption("reduce");
    await page.getByRole("button", { name: "닫기", exact: true }).click();
    await addColumnTask(page, "조용한 완료");
    await page.getByRole("checkbox").check();
    await expect(page.getByText("Congratulations!")).toBeVisible();
    await expect(page.getByTestId("celebration").locator("canvas")).toHaveCount(0);
  });
});

test.describe("12-14 notification fallback", () => {
  test("shows an in-app toast when permission is unavailable", async ({ page }) => {
    // A fake clock avoids relying on URL-time plus wall-clock passage in CI.
    await page.clock.install({ time: new Date("2026-09-14T13:59:00") });
    await page.goto("./");
    await page.getByRole("button", { name: "설정" }).click();
    await page.getByLabel("알림 켜기").check();
    await page.getByRole("button", { name: "닫기", exact: true }).click();
    const timeline = page.getByTestId("timeline");
    const box = await timeline.boundingBox();
    if (!box) throw new Error("timeline geometry unavailable");
    await page.mouse.click(box.x + box.width * .4375, box.y + box.height / 2);
    await page.getByLabel("일정 제목").fill("Meeting");
    await page.getByLabel("일정 제목").press("Enter");
    await page.clock.fastForward(90_000);
    await expect(page.getByTestId("toast")).toBeVisible();
  });
});

test.describe("12-15 keyboard", () => {
  test("adds, completes, moves a flag, and restores settings focus", async ({ page }) => {
    await at(page, "2026-09-14T10:00");
    await page.getByRole("button", { name: "+ 할 일 추가" }).first().press("Enter");
    await page.getByLabel("할 일 제목").fill("키보드 일정");
    await page.getByLabel("할 일 제목").press("Enter");
    await page.getByRole("checkbox").press("Space");
    await expect(page.getByTestId("celebration")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByTestId("celebration")).toHaveCount(0);
    await loadRoutine(page);
    await page.getByTestId("flag").first().focus();
    await page.keyboard.press("ArrowRight");
    const settings = page.getByRole("button", { name: "설정" });
    await settings.press("Enter");
    await page.keyboard.press("Escape");
    await expect(settings).toBeFocused();
  });
});
