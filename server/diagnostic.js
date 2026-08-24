/**
 * Diagnostic: Inspect what's actually in Henrik API data.
 * The local DB is empty (0 bytes), so we go straight to live API.
 */
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Read .env manually
const envPath = path.resolve(__dirname, '..', '.env');
let HENRIK_API_KEY = '';
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  const match = envContent.match(/HENRIK_API_KEY=(.+)/);
  if (match) HENRIK_API_KEY = match[1].trim();
}

const BASE = 'https://api.henrikdev.xyz/valorant';
const headers = { 'User-Agent': 'VALOROAST/diagnostic' };
if (HENRIK_API_KEY) headers['Authorization'] = HENRIK_API_KEY;

console.log('='.repeat(80));
console.log('VALOROAST DATA DIAGNOSTIC (Live API)');
console.log('='.repeat(80));
console.log(`API Key: ${HENRIK_API_KEY ? 'present' : 'MISSING'}\n`);

// Step 1: Resolve a real account
const testName = 'Leo', testTag = 'DMCG';
console.log(`Resolving account: ${testName}#${testTag}...`);
const accRes = await fetch(`${BASE}/v1/account/${encodeURIComponent(testName)}/${encodeURIComponent(testTag)}`, { headers });
if (!accRes.ok) {
  console.error(`Account resolution failed: ${accRes.status}`);
  process.exit(1);
}
const accJson = await accRes.json();
const region = accJson.data?.region || 'ap';
const puuid = accJson.data?.puuid;
console.log(`Region: ${region}, PUUID: ${puuid?.substring(0, 16)}...`);

// ─── CHECK 1: Live v3/matches (full match data) ──────────
console.log('\n' + '━'.repeat(80));
console.log('CHECK 1: LIVE v3/matches RESPONSE');
console.log('━'.repeat(80));

const liveUrl = `${BASE}/v3/matches/${region}/${encodeURIComponent(testName)}/${encodeURIComponent(testTag)}?size=5`;
console.log(`GET ${liveUrl}`);
const liveRes = await fetch(liveUrl, { headers });
console.log(`Status: ${liveRes.status}`);

if (liveRes.ok) {
  const liveJson = await liveRes.json();
  const matches = liveJson.data || [];
  console.log(`Matches returned: ${matches.length}`);

  if (matches.length > 0) {
    const m = matches[0];
    console.log(`\nTOP-LEVEL KEYS: ${Object.keys(m).join(', ')}`);

    // Metadata
    if (m.metadata) {
      console.log(`\nMETADATA:`);
      Object.entries(m.metadata).forEach(([k, v]) => {
        const val = typeof v === 'object' ? JSON.stringify(v) : v;
        console.log(`  ${k}: ${val}`);
      });
    }

    // Players
    const players = m.players?.all_players || m.players || [];
    console.log(`\nPLAYERS: ${players.length}`);
    if (players.length > 0) {
      const p = players[0];
      console.log(`Player[0] KEYS: ${Object.keys(p).join(', ')}`);
      console.log(`  name: ${p.name}#${p.tag}`);
      console.log(`  character: ${p.character}`);
      console.log(`  currenttier: ${p.currenttier}`);
      console.log(`  currenttier_patched: ${p.currenttier_patched}`);
      if (p.stats) console.log(`  stats KEYS: ${Object.keys(p.stats).join(', ')}`);
      console.log(`  economy (player-level): ${p.economy !== undefined ? JSON.stringify(p.economy).substring(0, 300) : 'NOT PRESENT'}`);
      console.log(`  ability_casts: ${p.ability_casts !== undefined ? JSON.stringify(p.ability_casts).substring(0, 200) : 'NOT PRESENT'}`);

      // Show ranks for all 10 players
      console.log(`\n  PER-MATCH RANKS:`);
      players.forEach(pl => {
        console.log(`    ${pl.name}#${pl.tag}: ${pl.currenttier_patched} (tier ${pl.currenttier})`);
      });
    }

    // ROUNDS — The critical economy check
    const rounds = m.rounds || [];
    console.log(`\nROUNDS: ${rounds.length}`);
    if (rounds.length > 0) {
      const r1 = rounds[0];
      console.log(`Round[0] KEYS: ${Object.keys(r1).join(', ')}`);

      const rps = r1.player_stats || [];
      console.log(`Round player_stats count: ${rps.length}`);

      if (rps.length > 0) {
        const rp = rps[0];
        console.log(`player_stats[0] KEYS: ${Object.keys(rp).join(', ')}`);
        
        // THE KEY CHECK
        if (rp.economy !== undefined) {
          console.log(`\n✅ ECONOMY EXISTS IN ROUND PLAYER_STATS!`);
          console.log(`  economy KEYS: ${Object.keys(rp.economy).join(', ')}`);
          console.log(`  FULL economy: ${JSON.stringify(rp.economy)}`);
        } else {
          console.log(`\n❌ NO economy in round player_stats`);
        }

        // Show economy for first 6 rounds for one player
        console.log(`\n  Economy across first 6 rounds (player_stats[0]):`);
        rounds.slice(0, 6).forEach((r, i) => {
          const ps = r.player_stats?.[0];
          if (ps?.economy) {
            const e = ps.economy;
            console.log(`    R${i+1}: spent=${e.spent}, loadout=${e.loadout_value}, weapon=${e.weapon?.name || 'N/A'}, armor=${e.armor?.name || 'N/A'}, remaining=${e.remaining}`);
          } else {
            console.log(`    R${i+1}: no economy`);
          }
        });

        // Check the target player specifically
        console.log(`\n  Economy for ${testName} specifically across all rounds:`);
        let foundTarget = false;
        rounds.slice(0, 6).forEach((r, i) => {
          const targetPs = r.player_stats?.find(ps => {
            const dn = ps.player_display_name || ps.player_name || '';
            return dn.toLowerCase().includes(testName.toLowerCase());
          });
          if (targetPs?.economy) {
            foundTarget = true;
            const e = targetPs.economy;
            console.log(`    R${i+1}: spent=${e.spent}, loadout=${e.loadout_value}, weapon=${e.weapon?.name || 'N/A'}, remaining=${e.remaining}`);
          }
        });
        if (!foundTarget) console.log(`    (target player not found in round stats)`);
      }
    }

    // Dump full match
    const dumpPath = path.resolve(__dirname, 'diagnostic_match_dump.json');
    fs.writeFileSync(dumpPath, JSON.stringify(m, null, 2));
    console.log(`\n✅ Full match dumped to: ${dumpPath}`);
  }
} else {
  console.log(`Live matches failed: ${liveRes.status}`);
  const text = await liveRes.text();
  console.log(text.substring(0, 500));
}

// Small delay to avoid rate limit
await new Promise(r => setTimeout(r, 2000));

// ─── CHECK 2: Stored-matches endpoint ──────────────────────
console.log('\n' + '━'.repeat(80));
console.log('CHECK 2: STORED-MATCHES ENDPOINT');
console.log('━'.repeat(80));

// Try v1 first, then v3
for (const ver of ['v1', 'v3']) {
  const storedUrl = `${BASE}/${ver}/stored-matches/${region}/${encodeURIComponent(testName)}/${encodeURIComponent(testTag)}?size=20`;
  console.log(`\nGET ${storedUrl}`);
  try {
    const sRes = await fetch(storedUrl, { headers });
    console.log(`Status: ${sRes.status}`);
    
    if (sRes.ok) {
      const sJson = await sRes.json();
      const data = sJson.data || [];
      console.log(`Stored matches (${ver}): ${data.length}`);

      if (data.length > 0) {
        const sm = data[0];
        console.log(`\nTop-level KEYS: ${Object.keys(sm).join(', ')}`);

        const meta = sm.metadata || sm.meta || {};
        console.log(`metadata KEYS: ${Object.keys(meta).join(', ')}`);
        console.log(`  season_id: ${meta.season_id || meta.season || 'N/A'}`);
        console.log(`  map: ${typeof meta.map === 'object' ? meta.map.name : meta.map}`);
        console.log(`  mode: ${meta.mode}`);
        console.log(`  started_at: ${meta.started_at || meta.game_start_patched}`);

        // Date range
        const dates = data.map(x => (x.metadata || x.meta || {}).started_at || (x.metadata || x.meta || {}).game_start_patched).filter(Boolean);
        if (dates.length >= 2) {
          console.log(`\nDate range: ${dates[dates.length - 1]} → ${dates[0]}`);
        }

        // Season distribution
        const seasons = {};
        data.forEach(x => {
          const s = (x.metadata || x.meta || {}).season_id || (x.metadata || x.meta || {}).season || 'UNKNOWN';
          seasons[s] = (seasons[s] || 0) + 1;
        });
        console.log(`\nSeason distribution:`);
        Object.entries(seasons).forEach(([s, c]) => console.log(`  ${s}: ${c}`));

        // Rounds check
        if (sm.rounds?.length > 0) {
          console.log(`\nRounds in stored match: ${sm.rounds.length}`);
          const srps = sm.rounds[0].player_stats?.[0];
          if (srps?.economy) {
            console.log(`✅ Economy in stored round: ${JSON.stringify(srps.economy)}`);
          } else {
            console.log(`⚠ No economy in stored round player_stats`);
          }
        } else {
          console.log(`\n⚠ No rounds array in stored match`);
        }

        // Dump
        const sDump = path.resolve(__dirname, `diagnostic_stored_${ver}_dump.json`);
        fs.writeFileSync(sDump, JSON.stringify(sm, null, 2));
        console.log(`✅ Stored match (${ver}) dumped to: ${sDump}`);
      }
      break; // Got data, no need to try next version
    } else {
      const errText = await sRes.text();
      console.log(`Response: ${errText.substring(0, 500)}`);
    }
  } catch (e) {
    console.log(`Error: ${e.message}`);
  }
  await new Promise(r => setTimeout(r, 1000));
}

console.log('\n' + '='.repeat(80));
console.log('DIAGNOSTIC COMPLETE');
console.log('='.repeat(80));
