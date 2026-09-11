import type { Lang, Story } from "../schema/story";

export function EndScreen({ story, lang, onReplay }: { story: Story; lang: Lang; onReplay: () => void }) {
  const creator = story.meta.creator;
  return (
    <section className="end-screen" aria-label={lang === "ko" ? "엔딩" : "Ending"}>
      <button className="replay-button" onClick={onReplay} type="button">{lang === "ko" ? "다시 보기" : "Replay"}</button>
      {creator && <a href={story.meta.creatorLink || undefined}>{creator}</a>}
    </section>
  );
}

