#!/usr/bin/env node
import {readFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {lint} from '../src/lint.js';
const [command,directory]=process.argv.slice(2);
if(command!=='lint'||!directory){console.error('Usage: layer-kit lint <app-dist-directory>');process.exitCode=1;}
else{
  const manifest=JSON.parse((await readFile(resolve(directory,'layers.manifest.js'),'utf8')).replace(/^export default /,'').replace(/;\s*$/,''));
  const result=lint(manifest,await readFile(resolve(directory,'style.css'),'utf8'));
  console.log(JSON.stringify(result,null,2));if(result.errors.length)process.exitCode=1;
}
