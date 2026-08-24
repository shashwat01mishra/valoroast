import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import fs from 'fs';

const serverDir = path.resolve('server');
if (!fs.existsSync(serverDir)) {
  fs.mkdirSync(serverDir, { recursive: true });
}

const DB_PATH = path.join(serverDir, 'valoroast.db');

let db;
try {
  db = new DatabaseSync(DB_PATH);
  console.log(`[VALOROAST SQLite] Database opened at: ${DB_PATH}`);
} catch (err) {
  console.warn(`[VALOROAST SQLite] File DB open failed (${err.message}). Using memory DB fallback.`);
  db = new DatabaseSync(':memory:');
}

// Create tables if not existing
db.exec(`
  CREATE TABLE IF NOT EXISTS puuid_cache (
    key TEXT PRIMARY KEY,
    puuid TEXT NOT NULL,
    account_json TEXT NOT NULL,
    created_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS matches_cache (
    match_id TEXT PRIMARY KEY,
    puuid TEXT NOT NULL,
    region TEXT NOT NULL,
    match_json TEXT NOT NULL,
    created_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS player_stats_cache (
    cache_key TEXT PRIMARY KEY,
    puuid TEXT NOT NULL,
    stats_json TEXT NOT NULL,
    ttl_timestamp INTEGER NOT NULL
  );
`);

/**
 * PUUID / Account Cache
 */
export function getAccountFromDb(region, name, tag) {
  const key = `${region.toLowerCase()}_${name.toLowerCase()}_${tag.toLowerCase()}`;
  try {
    const stmt = db.prepare('SELECT account_json FROM puuid_cache WHERE key = ?');
    const row = stmt.get(key);
    if (row) {
      return JSON.parse(row.account_json);
    }
  } catch (e) { /* ignore */ }
  return null;
}

export function saveAccountToDb(region, name, tag, puuid, accountData) {
  const key = `${region.toLowerCase()}_${name.toLowerCase()}_${tag.toLowerCase()}`;
  try {
    const stmt = db.prepare(`
      INSERT INTO puuid_cache (key, puuid, account_json, created_at)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(key) DO UPDATE SET
        puuid = excluded.puuid,
        account_json = excluded.account_json,
        created_at = excluded.created_at
    `);
    stmt.run(key, puuid, JSON.stringify(accountData), Date.now());
  } catch (e) { /* ignore */ }
}

/**
 * Match Cache (keyed by match_id + puuid)
 */
export function getMatchesFromDb(puuid, matchIds = []) {
  if (!matchIds || matchIds.length === 0) return [];
  try {
    const placeholders = matchIds.map(() => '?').join(',');
    const stmt = db.prepare(`SELECT match_json FROM matches_cache WHERE match_id IN (${placeholders})`);
    const rows = stmt.all(...matchIds);
    return rows.map(r => JSON.parse(r.match_json));
  } catch (e) {
    return [];
  }
}

export function saveMatchToDb(matchId, puuid, region, matchData) {
  try {
    const stmt = db.prepare(`
      INSERT INTO matches_cache (match_id, puuid, region, match_json, created_at)
      VALUES (?, ?, ?, ?, ?)
      ON CONFLICT(match_id) DO UPDATE SET
        match_json = excluded.match_json
    `);
    stmt.run(matchId, puuid, region, JSON.stringify(matchData), Date.now());
  } catch (e) { /* ignore */ }
}

/**
 * Player Computed Stats Cache (TTL: 30 minutes)
 */
export function getCachedPlayerStats(cacheKey) {
  const normalizedKey = cacheKey.toLowerCase();
  try {
    const stmt = db.prepare('SELECT stats_json, ttl_timestamp FROM player_stats_cache WHERE cache_key = ?');
    const row = stmt.get(normalizedKey);
    if (!row) return null;

    if (Date.now() > row.ttl_timestamp) {
      const delStmt = db.prepare('DELETE FROM player_stats_cache WHERE cache_key = ?');
      delStmt.run(normalizedKey);
      return null;
    }

    return JSON.parse(row.stats_json);
  } catch (e) {
    return null;
  }
}

export function setCachedPlayerStats(cacheKey, puuid, statsData, ttlHours = 0.5) {
  const normalizedKey = cacheKey.toLowerCase();
  const ttlTimestamp = Date.now() + ttlHours * 60 * 60 * 1000;
  
  try {
    const stmt = db.prepare(`
      INSERT INTO player_stats_cache (cache_key, puuid, stats_json, ttl_timestamp)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(cache_key) DO UPDATE SET
        puuid = excluded.puuid,
        stats_json = excluded.stats_json,
        ttl_timestamp = excluded.ttl_timestamp
    `);
    stmt.run(normalizedKey, puuid || 'unknown', JSON.stringify(statsData), ttlTimestamp);
  } catch (e) { /* ignore */ }
}
