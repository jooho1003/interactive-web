import { run, download } from './fal.mjs';
const prompt = `Premium stylized 3D collectible figure of a young Korean woman in her twenties wearing a traditional hanbok: ivory-white jeogori jacket with a deep red goreum ribbon, full crimson chima skirt, hair in a low braid with a red daenggi ribbon, soft natural makeup, gentle closed-mouth smile.
She faces the camera directly, eyes looking straight at the viewer, shoulders square, hands folded in front at the waist. Framed from the top of the head to just below the knees, centered, generous margin around the figure.
Full figure within a square frame, standing in front of a perfectly plain flat uniform light gray studio backdrop (#d9d9d9), soft neutral studio lighting, detailed fabric folds, no text, no UI, no floor line, no cast shadow on the ground. Avoid any green color in the outfit.`;
const models = [process.argv[2] || 'fal-ai/flux-pro/v1.1'];
for (const model of models) for (const seed of [11, 22]) {
  const out = await run(model, { prompt, image_size: 'square_hd', num_images: 1, seed, enable_safety_checker: true, output_format: 'png' });
  const img = out.images?.[0]; console.log(model, seed, img?.width, img?.height, img?.url);
  await download(img.url, `still-${seed}.png`);
}
