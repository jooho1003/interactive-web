import { useEffect, useState } from "react";
import type { Lang, Story } from "../schema";

type Props = {
  story: Story;
  onEnter: (lang: Lang, muted?: boolean) => void;
};

export function CinematicPrelude({ story, onEnter }: Props) {
  const [pointer, setPointer] = useState({ x: 50, y: 50 });
  const [soundChoice, setSoundChoice] = useState<boolean | null>(null);
  const soundOn = soundChoice ?? true;

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onEnter(story.meta.defaultLang, soundChoice === null ? undefined : !soundOn);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [onEnter, soundChoice, soundOn, story.meta.defaultLang]);

  const enter = (lang: Lang) => onEnter(lang, soundChoice === null ? undefined : !soundOn);

  return (
    <main
      className="cinematic-prelude"
      onPointerMove={(event) => {
        setPointer({ x: (event.clientX / window.innerWidth) * 100, y: (event.clientY / window.innerHeight) * 100 });
      }}
      style={{ "--pointer-x": `${pointer.x}%`, "--pointer-y": `${pointer.y}%` } as React.CSSProperties}
    >
      <div className="prelude-media" aria-hidden="true">
        <img src="/media/gate-generated-v2.webp" alt="" />
        <video src="/media/gate-generated-v2.webm" poster="/media/gate-generated-v2.webp" autoPlay muted playsInline />
      </div>
      <div className="prelude-vignette" aria-hidden="true" />
      <div className="prelude-grain" aria-hidden="true" />
      <div className="prelude-topline">
        <span>JUHO LAB / 01</span>
        <span>INTERACTIVE SHORT</span>
      </div>
      <section className="prelude-gate" aria-labelledby="prelude-title">
        <p className="prelude-kicker">03:00 AM · STILL OPEN</p>
        <h1 id="prelude-title">{story.meta.title.ko}</h1>
        <p className="prelude-subtitle">{story.meta.subtitle.ko}</p>
        <p className="prelude-prompt">언어를 선택하세요</p>
        <div className="prelude-actions">
          <button type="button" className="prelude-language" onClick={() => enter("ko")}>한국어</button>
          <span aria-hidden="true">/</span>
          <button type="button" className="prelude-language" onClick={() => enter("en")}>English</button>
        </div>
        <button
          type="button"
          className={`prelude-sound ${soundOn ? "is-on" : "is-off"}`}
          aria-pressed={soundOn}
          onClick={() => setSoundChoice((value) => !(value ?? true))}
        >
          <span className="prelude-sound-mark" aria-hidden="true" />
          {soundOn ? "소리 켜기" : "소리 끄기"}
        </button>
      </section>
      <div className="prelude-bottomline">
        <span>AN ORIGINAL NIGHT STORY</span>
        <span>ESC · ENTER</span>
      </div>
      <span className="prelude-cursor" aria-hidden="true" />
    </main>
  );
}
