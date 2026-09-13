import { useEffect, useRef, useState } from "react";
import { MAX_SETTINGS_BYTES, defaults, parsePreferences, presets, type Preferences, type Preset } from "../settings/preferences";
import { cleanCustomization, type DawnCustomization, type DawnCustomizationPatch } from "../settings/customization";
import type { Story } from "../schema/story";
import type { Theme } from "../schema/theme";
import "./settings.css";

type Props = {
  settings: Preferences;
  saved: boolean;
  story: Story;
  theme: Theme;
  customization: DawnCustomization;
  onChange: (patch: Partial<Preferences>) => void;
  onCustomizationChange: (patch: DawnCustomizationPatch) => void;
  onCustomizationReset: () => void;
  onClose: () => void;
};

type ContentNotice = "saved" | "invalid" | "tooLarge" | null;

function readFile(file: File, maxBytes = 1_800_000): Promise<string> {
  if (file.size > maxBytes) throw new Error("파일은 1.8MB 이하로 선택해 주세요.");
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("파일을 읽지 못했습니다."));
    reader.readAsDataURL(file);
  });
}

export function SettingsPanel({ settings, saved, story, theme, customization, onChange, onCustomizationChange, onCustomizationReset, onClose }: Props) {
  const dialog = useRef<HTMLDialogElement>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const contentFileInput = useRef<HTMLInputElement>(null);
  const [notice, setNotice] = useState<"imported" | "invalid" | null>(null);
  const [contentNotice, setContentNotice] = useState<ContentNotice>(null);
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
  const updateContent = (patch: DawnCustomizationPatch) => {
    onCustomizationChange(patch);
    setContentNotice("saved");
  };
  const uploadImage = async (id: string, file?: File) => {
    if (!file) return;
    try { updateContent({ images: { [id]: await readFile(file) } }); }
    catch { setContentNotice("tooLarge"); }
  };
  const uploadBgm = async (file?: File) => {
    if (!file) return;
    try { updateContent({ audio: { bgmSrc: await readFile(file), loop: false } }); }
    catch { setContentNotice("tooLarge"); }
  };
  const exportCustomization = () => {
    const url = URL.createObjectURL(new Blob([JSON.stringify({ format: "dawn-store-customization-v1", customization }, null, 2)], { type: "application/json" }));
    const link = document.createElement("a"); link.href = url; link.download = "dawn-store-customization.json"; link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  const importCustomization = async (file?: File) => {
    if (!file) return;
    try {
      const value = JSON.parse(await file.text());
      if (value.format !== "dawn-store-customization-v1") throw new Error("format");
      const next = cleanCustomization(value.customization);
      onCustomizationReset();
      onCustomizationChange(next);
      setContentNotice("saved");
    } catch { setContentNotice("invalid"); }
  };
  const setColor = (key: keyof DawnCustomization["colors"], value: string) => updateContent({ colors: { [key]: value } });
  const setLayout = (key: keyof DawnCustomization["layout"], value: number) => updateContent({ layout: { [key]: value } });
  const nodeLabel = (node: Story["nodes"][number]) => node.title[ko ? "ko" : "en"];

  return (
    <dialog ref={dialog} className="settings-panel" aria-labelledby="settings-title" aria-describedby="settings-description"
      onKeyDown={(event) => {
        if (event.key !== "Tab") return;
        const controls = Array.from(event.currentTarget.querySelectorAll<HTMLElement>("button, select, input:not([hidden]), summary"))
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

      <details className="creator-editor" open>
        <summary>{t("작품 편집", "Edit the work")}</summary>
        <p>{t("이 브라우저에만 저장되는 편집입니다. 이미지·폰트·색상·UI 위치·BGM을 즉시 미리볼 수 있습니다.", "These edits are saved in this browser and preview instantly: images, font, colors, UI positions, and BGM.")}</p>
        <fieldset><legend>{t("제목", "Title")}</legend>
          <label>{t("한국어 제목", "Korean title")}<input value={customization.meta.titleKo || story.meta.title.ko} onChange={(e) => updateContent({ meta: { titleKo: e.target.value } })} /></label>
          <label>{t("영어 제목", "English title")}<input value={customization.meta.titleEn || story.meta.title.en} onChange={(e) => updateContent({ meta: { titleEn: e.target.value } })} /></label>
          <label>{t("한국어 부제", "Korean subtitle")}<input value={customization.meta.subtitleKo || story.meta.subtitle.ko} onChange={(e) => updateContent({ meta: { subtitleKo: e.target.value } })} /></label>
          <label>{t("영어 부제", "English subtitle")}<input value={customization.meta.subtitleEn || story.meta.subtitle.en} onChange={(e) => updateContent({ meta: { subtitleEn: e.target.value } })} /></label>
        </fieldset>
        <fieldset><legend>{t("색상과 폰트", "Colors and font")}</legend>
          {([['accent', "강조 색상"], ['glow', "글로우 색상"], ['hotspot', "핫스팟 색상"], ['text', "기본 글자 색상"], ['textMuted', "보조 글자 색상"], ['menuText', "선택지 글자 색상"], ['subtitle', "자막 색상"], ['endingBackground', "엔딩 배경 색상"]] as const).map(([key, label]) => (
            <label key={key}>{t(label, label)}<input type="color" value={customization.colors[key]} onChange={(e) => setColor(key, e.target.value)} /></label>
          ))}
          <label>{t("폰트 스택", "Font stack")}<input value={customization.font.stack} onChange={(e) => updateContent({ font: { stack: e.target.value } })} placeholder={theme.font.stack} /></label>
        </fieldset>
        <fieldset><legend>{t("화면 요소 위치", "UI positions")}</legend>
          {([['controlsTop', "상단 설정 묶음 위쪽", 0, 160, "px"], ['controlsLeft', "상단 설정 묶음 왼쪽", 0, 240, "px"], ['menuBottom', "선택지 아래 위치", 8, 70, "%"], ['subtitleBottom', "자막 아래 위치", 5, 45, "%"], ['timelineTop', "타임라인 위쪽", 0, 180, "px"], ['skipTop', "건너뛰기 위쪽", 0, 180, "px"], ['skipRight', "건너뛰기 오른쪽", 0, 240, "px"], ['footerBottom', "하단 문구 아래 위치", 0, 120, "px"]] as const).map(([key, label, min, max, unit]) => (
            <label key={key}>{t(label, label)}<output>{customization.layout[key]}{unit}</output><input type="range" min={min} max={max} step={unit === "%" ? 1 : 2} value={customization.layout[key]} onChange={(e) => setLayout(key, Number(e.target.value))} /></label>
          ))}
        </fieldset>
        <fieldset><legend>{t("장면 이미지", "Scene images")}</legend>
          {story.nodes.filter((node) => node.media.kind === "still").map((node) => (
            <label className="media-upload" key={node.id}>{nodeLabel(node)}
              <img src={customization.images[node.id] || node.media.src} alt="" />
              <input type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={(e) => { void uploadImage(node.id, e.target.files?.[0]); e.target.value = ""; }} />
              {customization.images[node.id] && <button type="button" onClick={() => updateContent({ images: { [node.id]: "" } })}>{t("기본 이미지로", "Use original")}</button>}
            </label>
          ))}
        </fieldset>
        <fieldset><legend>{t("배경음 교체", "Replace BGM")}</legend>
          <p>{customization.audio.bgmSrc ? t("사용자 BGM을 재생합니다.", "Using your custom BGM.") : t("기본 BGM을 재생합니다.", "Using the original BGM.")}</p>
          <label className="media-upload">{t("MP3/WAV/OGG 파일", "MP3/WAV/OGG file")}
            <input type="file" accept="audio/mpeg,audio/wav,audio/ogg,audio/mp4,audio/webm" onChange={(e) => { void uploadBgm(e.target.files?.[0]); e.target.value = ""; }} />
          </label>
          <label>{t("BGM 반복 재생", "Loop BGM")}<input type="checkbox" checked={customization.audio.loop} onChange={(e) => updateContent({ audio: { loop: e.target.checked } })} /></label>
          {customization.audio.bgmSrc && <button type="button" onClick={() => updateContent({ audio: { bgmSrc: "", loop: false } })}>{t("기본 BGM으로", "Use original BGM")}</button>}
          <p>{t("기본값은 한 번만 재생하고 끝나면 멈춥니다. 장면이 끝나면 ‘다시 보기’를 누를 수 있습니다.", "The default plays once and stops. Use Replay when a scene ends.")}</p>
        </fieldset>
        <div className="settings-actions">
          <button type="button" onClick={onCustomizationReset}>{t("작품 편집 초기화", "Reset work edits")}</button>
          <button type="button" onClick={exportCustomization}>{t("작품 편집 내보내기", "Export work edits")}</button>
          <button type="button" onClick={() => contentFileInput.current?.click()}>{t("작품 편집 가져오기", "Import work edits")}</button>
        </div>
        <input ref={contentFileInput} type="file" accept=".json,application/json" hidden onChange={(e) => { void importCustomization(e.target.files?.[0]); e.target.value = ""; }} />
        <p role="status">{contentNotice === "saved" ? t("작품 편집을 저장했습니다.", "Work edits saved in this browser.") : contentNotice === "tooLarge" ? t("파일이 너무 큽니다. 1.8MB 이하 파일을 사용해 주세요.", "The file is too large. Use a file under 1.8MB.") : contentNotice === "invalid" ? t("작품 편집 파일을 확인해 주세요.", "Check the work edit file.") : t("편집은 즉시 미리보고 이 브라우저에 자동 저장됩니다.", "Edits preview instantly and save automatically in this browser.")}</p>
      </details>

      <p role="status">{saved ? t("이 브라우저에 자동 저장되었습니다.", "Saved automatically in this browser.") : t("브라우저 저장이 차단되어 이번 관람에만 적용됩니다.", "Storage is unavailable. Settings apply to this visit only.")}</p>
      <div className="settings-actions">
        <button type="button" onClick={exportSettings}>{t("설정 내보내기", "Export settings")}</button>
        <button type="button" onClick={() => fileInput.current?.click()}>{t("설정 가져오기", "Import settings")}</button>
        <button type="button" onClick={() => onChange({ ...defaults, lang: settings.lang })}>{t("기본값 복원", "Reset preferences")}</button>
      </div>
      <input ref={fileInput} data-preferences-import type="file" accept=".json,application/json" hidden onChange={(e) => { void importSettings(e.target.files?.[0]); e.target.value = ""; }} />
      {notice && <p role="status">{notice === "imported" ? t("설정을 가져왔습니다.", "Settings imported.") : t("설정 파일을 확인해 주세요. 8KB 이하의 올바른 설정 JSON만 사용할 수 있습니다.", "Use a valid settings JSON file of 8KB or less.")}</p>}
    </dialog>
  );
}
