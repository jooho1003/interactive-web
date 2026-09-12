import { useEffect, useRef, useState } from "react";
import { MAX_SETTINGS_BYTES, defaults, parsePreferences, presets, type Preferences, type Preset } from "../settings/preferences";
import "./settings.css";

type Props = { settings: Preferences; saved: boolean; onChange: (patch: Partial<Preferences>) => void; onClose: () => void };

export function SettingsPanel({ settings, saved, onChange, onClose }: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const [notice, setNotice] = useState<"imported" | "invalid" | null>(null);
  const ko = settings.lang === "ko";
  const t = (a: string, b: string) => ko ? a : b;
  useEffect(() => {
    const element = dialog.current!;
    const previous = document.activeElement;
    element.showModal();
    return () => {
      element.close();
      if (previous instanceof HTMLElement && previous.isConnected) previous.focus();
    };
  }, []);

  const applyPreset = (preset: Preset) => onChange({ ...presets[preset], lang: settings.lang });
  const exportSettings = () => {
    const url = URL.createObjectURL(new Blob([JSON.stringify(settings, null, 2)], { type: "application/json" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = "dawn-store-settings.json";
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  const importSettings = async (file?: File) => {
    if (!file) return;
    try {
      if (file.size > MAX_SETTINGS_BYTES) throw new Error("Too large");
      const next = parsePreferences(await file.text());
      onChange(next);
      setNotice("imported");
    } catch { setNotice("invalid"); }
  };

  return (
    <dialog ref={dialog} className="settings-panel" aria-labelledby="settings-title" aria-describedby="settings-description"
      onKeyDown={(event) => {
        if (event.key !== "Tab") return;
        const controls = Array.from(event.currentTarget.querySelectorAll<HTMLElement>("button, select, input:not([hidden])"))
          .filter((element) => !element.hasAttribute("disabled") && element.getClientRects().length > 0);
        const first = controls[0];
        const last = controls[controls.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
      }}
      onCancel={(event) => { event.preventDefault(); onClose(); }}>
      <header className="settings-header">
        <h1 id="settings-title">{t("나에게 맞는 관람", "Make it yours")}</h1>
        <button type="button" onClick={onClose} autoFocus>{t("닫기", "Close")}</button>
      </header>
      <p id="settings-description">{t("설정하는 동안 이야기는 잠시 기다립니다.", "The story pauses while you adjust your settings.")}</p>
      <fieldset><legend>{t("빠른 설정", "Quick presets")}</legend>
        <div className="settings-actions">
          <button type="button" onClick={() => applyPreset("standard")}>{t("기본", "Standard")}</button>
          <button type="button" onClick={() => applyPreset("reading")}>{t("읽기 편하게", "Easy reading")}</button>
          <button type="button" onClick={() => applyPreset("quiet")}>{t("조용히", "Quiet")}</button>
        </div>
      </fieldset>
      <fieldset><legend>{t("자막과 화면", "Reading and display")}</legend>
        <label>{t("언어", "Language")}<select value={settings.lang} onChange={(e) => onChange({ lang: e.target.value as Preferences["lang"] })}><option value="ko">한국어</option><option value="en">English</option></select></label>
        <label>{t("자막 표시", "Show subtitles")}<input type="checkbox" checked={settings.subtitles} onChange={(e) => onChange({ subtitles: e.target.checked })} /></label>
        <label>{t("자막 크기", "Subtitle size")}<select value={settings.subtitleSize} onChange={(e) => onChange({ subtitleSize: e.target.value as Preferences["subtitleSize"] })}><option value="normal">{t("보통", "Normal")}</option><option value="large">{t("크게", "Large")}</option></select></label>
        <p className={`subtitle-sample size-${settings.subtitleSize}`} aria-hidden="true">{t("새벽 세 시. 여기만 켜져 있다.", "Three in the morning. Only this place is lit.")}</p>
        <label>{t("움직임", "Motion")}<select value={settings.motion} onChange={(e) => onChange({ motion: e.target.value as Preferences["motion"] })}><option value="system">{t("기기 설정 따르기", "Follow device")}</option><option value="reduce">{t("움직임 줄이기", "Reduced")}</option><option value="full">{t("전체 효과", "Full effects")}</option></select></label>
      </fieldset>
      <fieldset><legend>{t("소리", "Sound")}</legend>
        <label>{t("전체 음소거", "Mute all sound")}<input type="checkbox" checked={settings.muted} onChange={(e) => onChange({ muted: e.target.checked })} /></label>
        <label>{t("배경음", "Background audio")}<output>{settings.bgmVolume}%</output><input aria-label={t("배경음 음량", "Background volume")} type="range" min="0" max="100" step="5" value={settings.bgmVolume} onChange={(e) => onChange({ bgmVolume: Number(e.target.value) })} /></label>
        <label>{t("효과음", "Sound effects")}<output>{settings.sfxVolume}%</output><input aria-label={t("효과음 음량", "Effects volume")} type="range" min="0" max="100" step="5" value={settings.sfxVolume} onChange={(e) => onChange({ sfxVolume: Number(e.target.value) })} /></label>
        <p>{t("음량은 작품의 기본 음량을 기준으로 조절합니다.", "Volumes are relative to the story’s original mix.")}</p>
      </fieldset>
      <p role="status">{saved ? t("이 브라우저에 자동 저장되었습니다.", "Saved automatically in this browser.") : t("브라우저 저장이 차단되어 이번 관람에만 적용됩니다.", "Storage is unavailable. Settings apply to this visit only.")}</p>
      <div className="settings-actions">
        <button type="button" onClick={exportSettings}>{t("설정 내보내기", "Export settings")}</button>
        <button type="button" onClick={() => fileInput.current?.click()}>{t("설정 가져오기", "Import settings")}</button>
        <button type="button" onClick={() => onChange({ ...defaults, lang: settings.lang })}>{t("기본값 복원", "Reset preferences")}</button>
      </div>
      <input ref={fileInput} type="file" accept=".json,application/json" hidden onChange={(e) => { void importSettings(e.target.files?.[0]); e.target.value = ""; }} />
      {notice && <p role="status">{notice === "imported" ? t("설정을 가져왔습니다.", "Settings imported.") : t("설정 파일을 확인해 주세요. 8KB 이하의 올바른 설정 JSON만 사용할 수 있습니다.", "Use a valid settings JSON file of 8KB or less.")}</p>}
    </dialog>
  );
}
