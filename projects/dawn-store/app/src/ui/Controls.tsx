import type { Lang } from "../schema/story";
import { VolumeIcon } from "./icons";

type Props = { lang: Lang; muted: boolean; onLangChange: (lang: Lang) => void; onMute: () => void };

export function Controls({ lang, muted, onLangChange, onMute }: Props) {
  return (
    <div className="controls" aria-label="재생 설정">
      <div className="lang-toggle" role="group" aria-label="언어 선택">
        <button className={lang === "ko" ? "is-active" : ""} onClick={() => onLangChange("ko")} type="button">KO</button>
        <span>/</span>
        <button className={lang === "en" ? "is-active" : ""} onClick={() => onLangChange("en")} type="button">EN</button>
      </div>
      <button className={`mute-button ${muted ? "is-muted" : ""}`} onClick={onMute} type="button" aria-label={muted ? "소리 켜기" : "소리 끄기"}>
        <VolumeIcon muted={muted} />
      </button>
    </div>
  );
}

