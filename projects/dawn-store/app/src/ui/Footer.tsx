import type { Lang, Story } from "../schema/story";

export function Footer({ story, lang, showDisclosure }: { story: Story; lang: Lang; showDisclosure: boolean }) {
  return (
    <footer className="footer">
      <span>{story.meta.title[lang]} · {story.meta.subtitle[lang]}</span>
      {showDisclosure && story.meta.aiDisclosure[lang] && <small>{story.meta.aiDisclosure[lang]}</small>}
    </footer>
  );
}
