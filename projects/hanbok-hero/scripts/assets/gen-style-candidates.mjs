import { run, download } from './fal.mjs';
const subject = `a young Joseon dynasty queen of KOREA: jade-green dangui jacket with gold geumbak patterns, red goreum ribbon, crimson chima skirt, long black hair parted in the middle and gathered in a low Korean jjok-meori chignon with a jade binyeo, a few loose strands blowing in the wind (no tall buns, no crown, strictly Korean hanbok, not Chinese, not Japanese). Composed, slightly defiant and mysterious expression, lips closed, eyes looking straight at the viewer, shoulders square, hands folded at the waist. Upper body from top of hair to waist, centered, generous margin, plain flat light gray backdrop (#d9d9d9), no scenery, no text, no floor.`;
export const styles = {
  B1: `Semi-realistic anime illustration, painterly digital art in the style of modern Chinese-Korean concept artists (Guweiz, Krenz Cushart): anime facial proportions with large sharp almond eyes, detailed irises, small nose, pointed chin, soft painterly skin, loose textured brush strokes on clothing, dramatic moody lighting with strong rim light, slight film grain, game character splash art, of ` + subject,
  B2: `Painterly anime illustration in the style of WLOP: luminous soft-glow rendering, anime face with large expressive eyes and delicate features, flowing hair strands, rich fabric painted with visible strokes, dramatic contrast, cinematic atmosphere, of ` + subject,
  B3: `Dark fantasy game splash art, semi-realistic anime style: sharp anime eyes with intense gaze, angular stylized face, wind-blown hair, textured brushwork on silk and gold embroidery, dramatic rim lighting and deep shadows, gritty painterly finish, of ` + subject,
};
for (const [k, prompt] of Object.entries(styles)) {
  const out = await run('fal-ai/flux-pro/v1.1-ultra', { prompt, aspect_ratio: '1:1', seed: 41, enable_safety_checker: true, output_format: 'png', raw: false });
  const img = out.images[0]; console.log(k, img.url); await download(img.url, `style-${k}.png`);
}
