import {readFile} from 'node:fs/promises';
import manifest from '../dist/layers.manifest.js';
import {lint} from '../../../packages/layer-kit/src/lint.js';
import {buildLayers} from './build-layers.mjs';
const result=lint(manifest,await readFile(new URL('../dist/style.css',import.meta.url),'utf8'));
if(result.errors.length)throw new Error(result.errors.join('\n'));
await buildLayers({check:true});
console.log(`PASS layer-kit lint: ${result.layers} layers, ${result.parameters} parameters; generated CSS/runtime/HTML current.`);
