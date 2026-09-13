import type { Lang } from "../schema/story";
import { VolumeIcon } from "./icons";

type Props = { lang: Lang; muted: boolean; onLangChange: (lang: Lang) => void; onMute: () => void; onSettings: () => void };

export function Controls({ lang, muted, onLangChange, onMute, onSettings }: Props) {
  return (
    <div className="controls" aria-label={lang === "ko" ? "재생 설정" : "Playback settings"}>
      <div className="lang-toggle" role="group" aria-label={lang === "ko" ? "언어 선택" : "Language"}>
        <button className={lang === "ko" ? "is-active" : ""} onClick={() => onLangChange("ko")} type="button">KO</button>
        <span>/</span>
        <button className={lang === "en" ? "is-active" : ""} onClick={() => onLangChange("en")} type="button">EN</button>
      </div>
      <button className={`mute-button ${muted ? "is-muted" : ""}`} onClick={onMute} type="button" aria-pressed={muted} aria-label={lang === "ko" ? (muted ? "소리 켜기" : "소리 끄기") : (muted ? "Unmute" : "Mute")}>
        <VolumeIcon muted={muted} />
      </button>
      <button className="settings-trigger" type="button" onClick={(event) => { event.currentTarget.focus(); onSettings(); }} aria-haspopup="dialog">{lang === "ko" ? "설정" : "Settings"}</button>
    </div>
  );
}
