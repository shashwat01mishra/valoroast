/**
 * Quick test to see economy thresholds across real accounts.
 */
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(__dirname, '..', '.env');
let HENRIK_API_KEY = '';
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  const match = envContent.match(/HENRIK_API_KEY=(.+)/);
  if (match) HENRIK_API_KEY = match[1].trim();
}

const headers = { 'User-Agent': 'VALOROAST/diagnostic' };
if (HENRIK_API_KEY) headers['Authorization'] = HENRIK_API_KEY;

const accounts = [
  { name: 'Leo', tag: 'DMCG', region: 'ap' },
  { name: 'WhiffGod', tag: 'NA1', region: 'na' } // might be a fake one, let's just try
];

async function run() {
  for (const acct of accounts) {
    console.log(`\n======================================`);
    console.log(`Fetching ${acct.name}#${acct.tag}...`);
    const res = await fetch(`https://api.henrikdev.xyz/valorant/v3/matches/${acct.region}/${acct.name}/${acct.tag}?size=5`, { headers });
    
    if (!res.ok) {
      console.log(`Failed: ${res.status}`);
      if (res.status === 404) {
          // Try fetching account to get region
          const accRes = await fetch(`https://api.henrikdev.xyz/valorant/v1/account/${acct.name}/${acct.tag}`, { headers });
          if (accRes.ok) {
              const accJson = await accRes.json();
              if (accJson.data?.region) {
                  const r = accJson.data.region;
                  const res2 = await fetch(`https://api.henrikdev.xyz/valorant/v3/matches/${r}/${acct.name}/${acct.tag}?size=5`, { headers });
                  if (res2.ok) {
                      await analyze(await res2.json(), acct);
                      continue;
                  }
              }
          }
      }
      continue;
    }
    
    const data = await res.json();
    await analyze(data, acct);
  }
}

async function analyze(data, acct) {
  const matches = data.data || [];
  let totalEcoRounds = 0;
  let wonEcoRounds = 0;
  let totalOpRounds = 0;
  let wonOpRounds = 0;
  let totalRoundsPlayed = 0;

  // Let's also collect loadout values to see distribution
  const loadouts = [];

  matches.forEach(match => {
    const rounds = match.rounds || [];
    totalRoundsPlayed += rounds.length;

    rounds.forEach(round => {
      // Find player's team
      let playerTeam = null;
      let targetStats = null;
      const allPlayers = match.players?.all_players || [];
      const me = allPlayers.find(p => p.name.toLowerCase() === acct.name.toLowerCase());
      if (me) playerTeam = me.team?.toLowerCase();

      if (!targetStats) {
        targetStats = round.player_stats?.find(ps => {
          const dn = ps.player_display_name || ps.player_name || '';
          return dn.toLowerCase().includes(acct.name.toLowerCase());
        });
      }

      if (targetStats?.economy) {
        const loadout = targetStats.economy.loadout_value || 0;
        const weapon = targetStats.economy.weapon?.name || '';
        
        loadouts.push(loadout);

        const wonRound = (round.winning_team?.toLowerCase() === playerTeam);

        if (loadout < 2000) {
          totalEcoRounds++;
          if (wonRound) wonEcoRounds++;
        }
        if (weapon === 'Operator') {
          totalOpRounds++;
          if (wonRound) wonOpRounds++;
        }
      }
    });
  });

  const ecoEfficiency = totalEcoRounds > 0 ? Math.round((wonEcoRounds / totalEcoRounds) * 100) : 0;
  const opBuyFreq = totalRoundsPlayed > 0 ? Math.round((totalOpRounds / totalRoundsPlayed) * 100) : 0;
  const postOpWinRate = totalOpRounds > 0 ? Math.round((wonOpRounds / totalOpRounds) * 100) : 0;

  console.log(`Total Rounds: ${totalRoundsPlayed}`);
  console.log(`Eco Rounds (<2000): ${totalEcoRounds}`);
  console.log(`Eco Win Rate (ecoEfficiency): ${ecoEfficiency}%`);
  console.log(`Op Rounds: ${totalOpRounds}`);
  console.log(`Op Buy Freq: ${opBuyFreq}%`);
  console.log(`Op Win Rate (postOpWinRate): ${postOpWinRate}%`);

  // Loadout distribution
  loadouts.sort((a,b) => a-b);
  console.log(`Loadout values distribution (percentiles):`);
  if (loadouts.length > 0) {
    console.log(`  Min: ${loadouts[0]}`);
    console.log(`  25th: ${loadouts[Math.floor(loadouts.length * 0.25)]}`);
    console.log(`  50th: ${loadouts[Math.floor(loadouts.length * 0.50)]}`);
    console.log(`  75th: ${loadouts[Math.floor(loadouts.length * 0.75)]}`);
    console.log(`  Max: ${loadouts[loadouts.length - 1]}`);
  }
}

run();
