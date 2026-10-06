import { createStudioServer } from './studio-server.mjs';
import { buildLayers } from './build-layers.mjs';
await buildLayers();
const port = Number(process.env.PORT || 4188);
createStudioServer().listen(port, '127.0.0.1', () => console.log(`작품: http://localhost:${port}/\n로컬 관리자: http://localhost:${port}/admin`));
