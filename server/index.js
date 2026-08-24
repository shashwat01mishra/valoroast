import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { fetchPlayerStats } from './services/henrikApi.js';
import { runRoastPipeline } from './engine/pipeline.js';
import { MOCK_PROFILES } from './engine/mockProfiles.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Global Error Safeguards
process.on('uncaughtException', (err) => {
  console.error('[VALOROAST UncaughtException]', err.message);
});
process.on('unhandledRejection', (reason) => {
  console.error('[VALOROAST UnhandledRejection]', reason);
});

// Auto-load .env file from project root or working directory
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
      const varVal = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, '');
      if (varKey) {
        process.env[varKey] = varVal;
      }
    }
  });
}

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// In-memory / file Wall of Shame storage
const WALL_FILE = path.resolve(__dirname, 'wallOfShame.json');
let wallOfShame = [];

try {
  if (fs.existsSync(WALL_FILE)) {
    wallOfShame = JSON.parse(fs.readFileSync(WALL_FILE, 'utf8'));
  }
} catch (e) {
  wallOfShame = [];
}

// Healthcheck endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    engine: 'VALOROAST Engine v2.0',
    hasApiKey: !!process.env.HENRIK_API_KEY,
    timestamp: new Date().toISOString()
  });
});

// Presets list endpoint
app.get('/api/presets', (req, res) => {
  const presets = Object.values(MOCK_PROFILES).map(p => ({
    name: p.name,
    tag: p.tag,
    region: p.region,
    rank: p.rank,
    avatar: p.avatar,
    key: `${p.name.toLowerCase()}#${p.tag.toLowerCase()}`
  }));
  res.json(presets);
});

// Main Roast API Endpoint
app.get('/api/roast/:region/:name/:tag', async (req, res) => {
  try {
    const { region, name, tag } = req.params;
    let { intensity = 'spicy', variantSeed = 0, apiKey = null, act = 'e9a2', mode = 'competitive', style = 'classic' } = req.query;

    if (!mode || (mode !== 'competitive' && mode !== 'unrated')) {
      return res.status(400).json({ error: 'Mode must be competitive or unrated.' });
    }

    const userApiKey = req.headers['x-api-key'] || apiKey;

    // Fetch stats from Henrik API, SQLite Cache, or Mock Presets
    const { data: rawStats, source } = await fetchPlayerStats(region, name, tag, userApiKey, act, mode);

    // Run through Roast Engine Pipeline
    const pipelineResult = runRoastPipeline(rawStats, {
      intensity,
      variantSeed: parseInt(variantSeed, 10) || 0,
      act,
      mode,
      style
    });

    res.json({
      success: true,
      dataSource: source,
      ...pipelineResult
    });
  } catch (error) {
    console.error('[VALOROAST Express] Error generating roast:', error.message);
    const statusCode = error.message.includes('not found') ? 404 : 400;
    res.status(statusCode).json({ success: false, error: error.message });
  }
});

// Wall of Shame Endpoints
app.get('/api/wall-of-shame', (req, res) => {
  res.json(wallOfShame.slice(-20).reverse());
});

const WALL_MAX_ENTRIES = 500;

function isValidWallEntry(cardData) {
  if (!cardData || typeof cardData !== 'object') return false;
  const { player, roast } = cardData;
  if (!player || typeof player !== 'object') return false;
  if (typeof player.name !== 'string' || !player.name.trim()) return false;
  if (typeof player.tag !== 'string' || !player.tag.trim()) return false;
  if (!roast || typeof roast !== 'object') return false;
  return true;
}

app.post('/api/wall-of-shame', (req, res) => {
  try {
    const cardData = req.body;
    if (!isValidWallEntry(cardData)) {
      return res.status(400).json({ error: 'Invalid card payload' });
    }

    // Only persist the fields the Wall of Shame UI actually renders —
    // drop pipelineDebug and anything else the client might send.
    const savedEntry = {
      id: `roast_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      createdAt: new Date().toISOString(),
      player: cardData.player,
      roast: cardData.roast,
      frequentTeammates: Array.isArray(cardData.frequentTeammates) ? cardData.frequentTeammates : []
    };

    wallOfShame.push(savedEntry);
    if (wallOfShame.length > WALL_MAX_ENTRIES) {
      wallOfShame = wallOfShame.slice(-WALL_MAX_ENTRIES);
    }
    fs.writeFileSync(WALL_FILE, JSON.stringify(wallOfShame, null, 2));

    res.json({ success: true, entry: savedEntry });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Serve frontend static build if in production mode
const distPath = path.resolve(__dirname, '../dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res) => res.sendFile(path.join(distPath, 'index.html')));
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🚀 VALOROAST Express Backend active on http://localhost:${PORT}`);
  if (process.env.HENRIK_API_KEY) {
    console.log(`🔑 Henrik API Key loaded from .env (${process.env.HENRIK_API_KEY.slice(0, 12)}...)`);
  } else {
    console.log(`⚠️ No HENRIK_API_KEY set in .env (using public tier / local fallback)`);
  }
  console.log(`🔥 Roast Engine v2.0 Ready with SQLite Match & Account Caching!\n`);
});
