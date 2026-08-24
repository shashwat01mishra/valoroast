import fs from 'fs';
import path from 'path';

const CACHE_FILE = path.resolve('server/cache.json');
const TTL_MS = 30 * 60 * 1000; // 30 minutes

let cacheMemory = {};

try {
  if (fs.existsSync(CACHE_FILE)) {
    const raw = fs.readFileSync(CACHE_FILE, 'utf8');
    cacheMemory = JSON.parse(raw);
  }
} catch (e) {
  cacheMemory = {};
}

function persistCache() {
  try {
    fs.writeFileSync(CACHE_FILE, JSON.stringify(cacheMemory, null, 2));
  } catch (e) {
    console.error("Failed to write cache file:", e);
  }
}

export function getCachedPlayer(key) {
  const normalizedKey = key.toLowerCase();
  const cached = cacheMemory[normalizedKey];
  if (!cached) return null;

  const age = Date.now() - cached.timestamp;
  if (age > TTL_MS) {
    delete cacheMemory[normalizedKey];
    persistCache();
    return null;
  }
  return cached.data;
}

export function setCachedPlayer(key, data) {
  const normalizedKey = key.toLowerCase();
  cacheMemory[normalizedKey] = {
    timestamp: Date.now(),
    data
  };
  persistCache();
}
