import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { fetchPlayerStats } from './services/henrikApi.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Auto-load .env file
const envPaths = [
  path.resolve(process.cwd(), '.env'),
  path.resolve(process.cwd(), 'projects/valoroast/.env'),
  path.resolve(__dirname, '../.env')
];

let loadedEnvPath = null;
for (const p of envPaths) {
  if (fs.existsSync(p)) {
    loadedEnvPath = p;
    break;
  }
}

if (loadedEnvPath) {
  let envContent = fs.readFileSync(loadedEnvPath, 'utf8');
  if (envContent.charCodeAt(0) === 0xFEFF) {
    envContent = envContent.slice(1);
  }
  envContent.split(/\r?\n/).forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const idx = trimmed.indexOf('=');
      const varKey = trimmed.slice(0, idx).trim();
      let varVal = trimmed.slice(idx + 1).trim();
      if ((varVal.startsWith('"') && varVal.endsWith('"')) || (varVal.startsWith("'") && varVal.endsWith("'"))) {
        varVal = varVal.slice(1, -1);
      }
      process.env[varKey] = varVal;
    }
  });
}

async function run() {
  console.log("Fetching past act e11a1 for Leo#DMCG...");
  const stats = await fetchPlayerStats('ap', 'Leo', 'DMCG', null, 'e11a1', 'competitive');
  console.log("Result source:", stats.source);
}

run();
