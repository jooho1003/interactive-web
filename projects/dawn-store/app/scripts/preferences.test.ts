import test from "node:test";
import assert from "node:assert/strict";
import { defaults, parsePreferences, presets, readPreferences, savePreferences, SETTINGS_KEY } from "../src/settings/preferences";

test("legacy choices migrate and invalid languages use story default", () => {
  const values = new Map([["dawn-store-lang", "en"], ["dawn-store-muted", "true"]]);
  const storage = { getItem: (key: string) => values.get(key) ?? null };
  assert.equal(readPreferences(storage, "ko").lang, "en");
  assert.equal(readPreferences(storage, "ko").muted, true);
  values.set("dawn-store-lang", "invalid");
  assert.equal(readPreferences(storage, "ko").lang, "ko");
  assert.equal(readPreferences({ getItem: () => null }, "en").lang, "en");
});
test("valid saved settings take precedence over legacy keys", () => {
  assert.deepEqual(readPreferences({ getItem: (key) => key === SETTINGS_KEY ? JSON.stringify(presets.reading) : "en" }, "en"), presets.reading);
});
test("corrupt storage and inaccessible storage recover", () => {
  assert.deepEqual(readPreferences({ getItem: () => "{bad" }, "ko"), defaults);
  assert.deepEqual(readPreferences({ getItem: () => { throw new Error("denied"); } }, "ko"), defaults);
  assert.equal(savePreferences({ setItem: () => { throw new Error("quota"); } }, defaults), false);
});
test("export/import round trip preserves preferences", () => {
  let value = "";
  assert.equal(savePreferences({ setItem: (_key, next) => { value = next; } }, presets.quiet), true);
  assert.deepEqual(parsePreferences(value), presets.quiet);
});
test("invalid imports cannot enter state", () => {
  for (const patch of [{ version: 2 }, { bgmVolume: 101 }, { sfxVolume: -1 }, { muted: "false" }, { subtitleSize: "huge" }, { lang: "fr" }, { extra: true }]) {
    assert.throws(() => parsePreferences(JSON.stringify({ ...defaults, ...patch })));
  }
  assert.throws(() => parsePreferences("{}"));
  assert.throws(() => parsePreferences("x".repeat(8193)));
  assert.throws(() => parsePreferences("{"));
});
