import {cp,mkdir,readFile,writeFile,access} from 'node:fs/promises';
import {resolve} from 'node:path';
let source='public';try{await access(source)}catch{source='dist'}
const output=source==='public'?'dist':'.build/dist';
await mkdir(resolve(output,'server'),{recursive:true});await cp(source,resolve(output,'client'),{recursive:true});
let worker=await readFile('server/index.js','utf8');worker=worker.replace('../dist/content-schema.js','./content-schema.js');
await writeFile(resolve(output,'server/index.js'),worker);await cp(resolve(source,'content-schema.js'),resolve(output,'server/content-schema.js'));
await mkdir(resolve(output,'.openai'),{recursive:true});await cp('.openai/hosting.json',resolve(output,'.openai/hosting.json'));
console.log('Museum Worker and browser assets built: '+resolve(output));
