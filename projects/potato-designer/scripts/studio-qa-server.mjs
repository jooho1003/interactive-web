// Dedicated disposable fixture for browser QA; never writes the working app's draft.
import {mkdtemp,cp,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join,resolve,sep} from 'node:path';
import {fileURLToPath} from 'node:url';
import {createStudioServer} from './studio-server.mjs';
const dir=await mkdtemp(join(tmpdir(),'potato-studio-browser-'));
const project=fileURLToPath(new URL('../',import.meta.url));
await cp(join(project,'dist'),join(dir,'dist'),{recursive:true});await cp(join(project,'admin'),join(dir,'admin'),{recursive:true});
const server=createStudioServer({projectDir:dir,password:''});
server.listen(Number(process.env.PORT||4178),'127.0.0.1',()=>console.log('Isolated Scene Studio QA: http://localhost:'+(process.env.PORT||4178)+'/admin'));
async function cleanup(){server.closeAllConnections();await new Promise(resolve=>server.close(resolve));const path=resolve(dir);if(!path.startsWith(resolve(tmpdir())+sep)||!path.includes('potato-studio-browser-'))throw new Error('Unsafe cleanup path');await rm(path,{recursive:true,force:true});process.exit(0);}
process.on('SIGINT',cleanup);process.on('SIGTERM',cleanup);
