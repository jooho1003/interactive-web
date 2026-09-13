import {cp,mkdir,readFile,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
const source='public';
const output='dist';
await mkdir(resolve(output,'server'),{recursive:true});await cp(source,resolve(output,'client'),{recursive:true});
let worker=await readFile('server/index.js','utf8');worker=worker.replace('../public/content-schema.js','./content-schema.js');
await writeFile(resolve(output,'server/index.js'),worker);await cp(resolve(source,'content-schema.js'),resolve(output,'server/content-schema.js'));await cp(resolve(source,'projects.js'),resolve(output,'server/projects.js'));
await mkdir(resolve(output,'.openai'),{recursive:true});await cp('.openai/hosting.json',resolve(output,'.openai/hosting.json'));
console.log('Museum Worker and browser assets built: '+resolve(output));
