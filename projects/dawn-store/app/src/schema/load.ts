import { storySchema, themeSchema, type Story, type Theme } from "./index";

export async function loadStoryAndTheme(): Promise<{ story: Story; theme: Theme }> {
  const [storyResponse, themeResponse] = await Promise.all([
    fetch("/story.json"),
    fetch("/theme.json"),
  ]);

  if (!storyResponse.ok || !themeResponse.ok) {
    throw new Error("작품 설정을 불러오지 못했습니다.");
  }

  const [storyJson, themeJson] = await Promise.all([
    storyResponse.json(),
    themeResponse.json(),
  ]);

  return {
    story: storySchema.parse(storyJson),
    theme: themeSchema.parse(themeJson),
  };
}

