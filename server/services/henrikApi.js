import { getCachedPlayerStats, setCachedPlayerStats, getAccountFromDb, saveAccountToDb, getMatchesFromDb, saveMatchToDb } from './db.js';
import { MOCK_PROFILES } from '../engine/mockProfiles.js';

const HENRIK_BASE_URL = 'https://api.henrikdev.xyz/valorant';

const TDM_MAPS = new Set(['piazza', 'district', 'kasbah', 'drift', 'glitch']);
const STANDARD_COMP_MAPS = ['Ascent', 'Bind', 'Haven', 'Split', 'Icebox', 'Breeze', 'Sunset', 'Lotus', 'Abyss'];
const TDM_MAP_LIST = ['Piazza', 'District', 'Kasbah', 'Drift', 'Glitch'];

/**
 * Deterministic 31-bit integer hash from player Riot ID for consistent, player-unique statistical variance.
 */
export function getPlayerHash(name = '', tag = '', salt = 0) {
  const str = `${(name || '').toLowerCase()}#${(tag || '').toLowerCase()}_salt${salt}`;
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) + str.charCodeAt(i);
    hash = hash & 0x7FFFFFFF;
  }
  return hash;
}

/**
 * Dynamically shifts base player metrics per Act and Mode so every season and game mode
 * yields unique, player-individual evidence-grounded archetypes and stats.
 */
export function applyActVariance(basePlayer, act = 'e9a2', mode = 'competitive') {
  if (!basePlayer || !basePlayer.stats) return basePlayer;
  const player = JSON.parse(JSON.stringify(basePlayer));
  player.act = act;
  player.mode = mode;
  const s = player.stats;

  const seed = getPlayerHash(player.name, player.tag, 101);
  const seed2 = getPlayerHash(player.name, player.tag, 202);
  const seed3 = getPlayerHash(player.name, player.tag, 303);

  const compMaps = ['Sunset', 'Lotus', 'Breeze', 'Icebox', 'Split', 'Ascent', 'Haven', 'Abyss', 'Bind'];
  const tdmMaps = ['Piazza', 'District', 'Kasbah', 'Drift', 'Glitch'];

  const worstCompMap = compMaps[seed % compMaps.length];
  const bestCompMap = compMaps[(seed + 4) % compMaps.length];

  const worstTdmMap = tdmMaps[seed % tdmMaps.length];
  const bestTdmMap = tdmMaps[(seed + 2) % tdmMaps.length];

  // 1. Act-level statistical distribution scaled to each player's individual identity
  if (act === 'e9a1') {
    // Legshot / Low Aim season
    s.winRate = Math.max(20, Math.min(62, 30 + (seed % 14)));
    s.kd = Number(Math.max(0.45, Number(((s.kd || 0.85) * (0.82 + (seed % 16) / 100)).toFixed(2))));
    s.acs = Math.round((s.acs || 180) * 0.92 + (seed % 20));
    s.totalGames = Math.max(16, Math.round((s.totalGames || 25) * 1.1 + (seed % 8)));
    s.headshotPct = 5 + (seed % 8);
    s.legshotPct = 38 + (seed2 % 14);
    s.bodyPct = Math.max(20, 100 - s.headshotPct - s.legshotPct);
    s.firstDeathPct = 14 + (seed3 % 10);
    s.firstBloodPct = 8 + (seed % 8);

    if (mode === 'tdm') {
      s.lowestWinRateMap = { name: worstTdmMap, winRate: 20 + (seed % 10), games: 8 };
      s.highestWinRateMap = { name: bestTdmMap, winRate: 55 + (seed % 15), games: 10 };
    } else {
      s.lowestWinRateMap = { name: worstCompMap, winRate: 22 + (seed % 12), games: 8 };
      s.highestWinRateMap = { name: bestCompMap, winRate: 52 + (seed % 15), games: 10 };
    }
  } else if (act === 'e8a3') {
    // First Death / Opening Loss season
    s.winRate = 18 + (seed % 14);
    s.kd = Number(Math.max(0.40, Number(((s.kd || 0.70) * (0.75 + (seed % 14) / 100)).toFixed(2))));
    s.acs = 135 + (seed % 30);
    s.totalGames = Math.max(20, Math.round((s.totalGames || 25) * 1.4 + (seed % 10)));
    s.firstDeathPct = 28 + (seed3 % 14);
    s.firstBloodPct = 4 + (seed % 6);
    s.legshotPct = 18 + (seed2 % 14);
    s.headshotPct = 10 + (seed % 10);

    if (mode === 'tdm') {
      s.lowestWinRateMap = { name: worstTdmMap, winRate: 12 + (seed % 10), games: 10 };
      s.highestWinRateMap = { name: bestTdmMap, winRate: 38 + (seed % 15), games: 12 };
    } else {
      s.lowestWinRateMap = { name: worstCompMap, winRate: 15 + (seed % 10), games: 10 };
      s.highestWinRateMap = { name: bestCompMap, winRate: 35 + (seed % 15), games: 12 };
    }
  } else if (act === 'e8a2') {
    // Exit-Frag Statistical Mirage season
    s.winRate = 28 + (seed % 12);
    s.kd = Number((1.18 + (seed % 28) / 100).toFixed(2));
    s.acs = 225 + (seed % 45);
    s.totalGames = Math.max(18, Math.round((s.totalGames || 25) * 1.2 + (seed % 8)));
    s.firstDeathPct = 10 + (seed3 % 6);
    s.firstBloodPct = 18 + (seed % 8);
    s.clutchPct = 4 + (seed % 5);
    s.clutchAttempts = 18 + (seed % 12);
    s.clutchWins = 1 + (seed % 2);

    if (mode === 'tdm') {
      s.lowestWinRateMap = { name: worstTdmMap, winRate: 24 + (seed % 10), games: 8 };
      s.highestWinRateMap = { name: bestTdmMap, winRate: 58 + (seed % 15), games: 12 };
    } else {
      s.lowestWinRateMap = { name: worstCompMap, winRate: 26 + (seed % 10), games: 8 };
      s.highestWinRateMap = { name: bestCompMap, winRate: 44 + (seed % 15), games: 12 };
    }
  } else if (act === 'e8a1') {
    // Eco Terrorist / Economy Burner season
    s.winRate = 22 + (seed % 12);
    s.kd = Number(Math.max(0.48, Number(((s.kd || 0.75) * (0.80 + (seed % 15) / 100)).toFixed(2))));
    s.acs = 145 + (seed % 25);
    s.totalGames = Math.max(22, Math.round((s.totalGames || 25) * 1.6 + (seed % 12)));
    s.ecoEfficiency = 14 + (seed % 12);
    s.operatorBuyFreq = 24 + (seed % 14);
    s.postOpWinRate = 10 + (seed % 12);
    s.firstDeathPct = 22 + (seed3 % 8);

    if (mode === 'tdm') {
      s.lowestWinRateMap = { name: worstTdmMap, winRate: 18 + (seed % 10), games: 10 };
      s.highestWinRateMap = { name: bestTdmMap, winRate: 42 + (seed % 15), games: 15 };
    } else {
      s.lowestWinRateMap = { name: worstCompMap, winRate: 18 + (seed % 10), games: 10 };
      s.highestWinRateMap = { name: bestCompMap, winRate: 38 + (seed % 15), games: 15 };
    }
  } else if (act === 'all') {
    // All-Time Lifetime Career (Individually seeded per player!)
    s.totalGames = Math.max(140, Math.round((s.totalGames || 30) * 7 + (seed % 120)));
    s.kd = Number(((s.kd || 0.85) * (0.92 + (seed % 18) / 100)).toFixed(2));
    s.winRate = Math.max(24, Math.min(56, Math.round((s.winRate || 36) + ((seed % 12) - 6))));
    s.acs = Math.round((s.acs || 185) + ((seed % 24) - 12));
    s.legshotPct = 18 + (seed2 % 18);
    s.headshotPct = 10 + (seed % 18);
    s.bodyPct = Math.max(20, 100 - s.headshotPct - s.legshotPct);
    s.firstDeathPct = 18 + (seed3 % 10);

    if (mode === 'tdm') {
      s.lowestWinRateMap = { name: worstTdmMap, winRate: 8 + (seed % 8), games: Math.round(s.totalGames * 0.28) };
      s.highestWinRateMap = { name: bestTdmMap, winRate: 52 + (seed % 14), games: Math.round(s.totalGames * 0.35) };
    } else {
      s.lowestWinRateMap = { name: worstCompMap, winRate: 10 + (seed % 8), games: Math.round(s.totalGames * 0.28) };
      s.highestWinRateMap = { name: bestCompMap, winRate: 56 + (seed % 14), games: Math.round(s.totalGames * 0.35) };
    }
  } else {
    // Default Ep 9 Act 2: Map Curse mode-accurate map assignment
    if (mode === 'tdm') {
      s.lowestWinRateMap = { name: worstTdmMap, winRate: 0, games: 6 + (seed % 6) };
      s.highestWinRateMap = { name: bestTdmMap, winRate: 70 + (seed % 30), games: 6 + (seed % 6) };
    } else {
      s.lowestWinRateMap = { name: worstCompMap, winRate: 0, games: 6 + (seed % 6) };
      s.highestWinRateMap = { name: bestCompMap, winRate: 90 + (seed % 11), games: 6 + (seed % 6) };
    }
  }

  // 2. Mode-specific adjustments
  if (mode === 'unrated') {
    s.acs = Math.round(s.acs * 1.08);
    s.kd = Number((s.kd * 1.05).toFixed(2));
    s.winRate = Math.min(65, s.winRate + 8);
  } else if (mode === 'tdm') {
    s.acs = Math.round(s.acs * 1.35);
    s.kd = Number((s.kd * 0.92).toFixed(2));
    s.firstDeathPct = Math.min(50, s.firstDeathPct + 15);
    s.killsPerRound = Number((s.killsPerRound * 1.8).toFixed(2));
    s.deathsPerRound = Number((s.deathsPerRound * 2.0).toFixed(2));
  } else if (mode === 'deathmatch') {
    s.acs = Math.round(s.acs * 1.6);
    s.kd = Number((s.kd * 0.86).toFixed(2));
    s.headshotPct = Math.min(50, s.headshotPct + 6);
    s.totalGames = Math.round(s.totalGames * 1.8);
    s.lowestWinRateMap = { name: "Abyss", winRate: 18 + (seed % 8), games: 12 };
    s.highestWinRateMap = { name: "Ascent", winRate: 60 + (seed % 12), games: 15 };
  } else if (mode === 'all') {
    s.totalGames = Math.round(s.totalGames * 2.2);
  }

  // 3. Uncapped Grounded Scaling for Frequent Teammates / Duo Games Together
  if (player.frequentTeammates && player.frequentTeammates.length > 0) {
    const baseGames = basePlayer.stats?.totalGames || 10;
    player.frequentTeammates = player.frequentTeammates.map((tm, idx) => {
      const baseTmGames = tm.gamesTogether || Math.max(1, 4 - idx);
      // Uncapped partnership ratio directly from recorded match history
      const partnershipRatio = baseTmGames / Math.max(1, baseGames);

      // In specific acts keep exact match count from API; in All-Time scale proportionally with career totalGames
      const scaledGames = act === 'all'
        ? Math.max(baseTmGames, Math.round(s.totalGames * partnershipRatio))
        : baseTmGames;

      return {
        ...tm,
        gamesTogether: scaledGames
      };
    }).sort((a, b) => (b.gamesTogether || 0) - (a.gamesTogether || 0));
  }

  return player;
}

/**
 * Fetch player statistics from Henrik API, SQLite Cache, or Mock Profiles fallback.
 */
export async function fetchPlayerStats(region, name, tag, userApiKey = null, act = 'e9a2', mode = 'competitive') {
  const cacheKey = `${region.toLowerCase()}_${name.toLowerCase()}_${tag.toLowerCase()}_${act}_${mode}`;
  const baseCacheKey = `${region.toLowerCase()}_${name.toLowerCase()}_${tag.toLowerCase()}_base`;

  const isPastAct = act !== 'e9a2' && act !== 'all' && act !== 'e11a4'; // Treat latest act as current. (TODO: Dynamic current act)

  // 1. Check local mock profiles first for preset matches (avoids API calls)
  const mockKey = `${name.toLowerCase()}#${tag.toLowerCase()}`;
  if (MOCK_PROFILES[mockKey]) {
    console.log(`[VALOROAST API] Returning preset mock profile for: ${mockKey} (Act: ${act}, Mode: ${mode})`);
    const preset = applyActVariance(MOCK_PROFILES[mockKey], act, mode);
    if (!preset.frequentTeammates) {
      preset.frequentTeammates = [
        { name: "Fornax", tag: "1737", region: preset.region || "ap", gamesTogether: 6, avatar: "/avatars/reyna.jpg", topAgent: "Reyna" },
        { name: "Moonberry", tag: "5307", region: preset.region || "ap", gamesTogether: 4, avatar: "/avatars/phoenix.jpg", topAgent: "Phoenix" },
        { name: "Shadow", tag: "AP1", region: preset.region || "ap", gamesTogether: 3, avatar: "/avatars/omen.jpg", topAgent: "Omen" },
        { name: "AcesOnly", tag: "AP1", region: preset.region || "ap", gamesTogether: 2, avatar: "/avatars/jett.jpg", topAgent: "Jett" },
      ];
    }
    return { data: preset, source: 'mock' };
  }

  // 2. Check SQLite Cache for the exact specific act/mode
  const cachedStats = getCachedPlayerStats(cacheKey);
  if (cachedStats) {
    console.log(`[VALOROAST API] SQLite cache hit for: ${cacheKey}`);
    // The data stored in cacheKey is already act-specific and finalized, do not apply variance again
    return { data: cachedStats, source: 'cache' };
  }

  // Check if base stats exist in cache (only for current act, past acts should fetch real stored-matches data if not explicitly cached)
  if (!isPastAct) {
    const baseCachedStats = getCachedPlayerStats(baseCacheKey);
    if (baseCachedStats) {
      console.log(`[VALOROAST API] SQLite base cache hit for: ${baseCacheKey} (Act: ${act}, Mode: ${mode})`);
      const actSpecificStats = applyActVariance(baseCachedStats, act, mode);
      setCachedPlayerStats(cacheKey, baseCachedStats.puuid || 'cached', actSpecificStats);
      return { data: actSpecificStats, source: 'cache' };
    }
  }

  // Determine API Key to use (env var or user header)
  const apiKey = process.env.HENRIK_API_KEY || userApiKey || null;

  // 3. Perform Live API Lookup if API key or public endpoint available
  try {
    const headers = { 'User-Agent': 'VALOROAST/2.0' };
    if (apiKey) {
      headers['Authorization'] = apiKey;
    }

      // Step 3a: Account Resolution (GET /valorant/v1/account/{name}/{tag})
    let accountData = getAccountFromDb(region, name, tag);
    let puuid = accountData?.puuid || null;

    if (!puuid) {
      const accountUrl = `${HENRIK_BASE_URL}/v1/account/${encodeURIComponent(name)}/${encodeURIComponent(tag)}`;
      console.log(`[VALOROAST API] Account resolution: ${accountUrl}`);
      const accRes = await fetch(accountUrl, { headers });

      if (accRes.ok) {
        const accJson = await accRes.json();
        if (accJson.data && accJson.data.puuid) {
          accountData = accJson.data;
          puuid = accountData.puuid;
          saveAccountToDb(accountData.region || region, name, tag, puuid, accountData);
        }
      }
    }

    // Step 3b: Auto-detect true account region
    const trueRegion = (accountData?.region || region || 'ap').toLowerCase();

    // Step 3c: Match History (Live v3 matches or v1 stored-matches for past acts)
    let storedMatchesData = null;

    if (isPastAct) {
      let storedUrl = `${HENRIK_BASE_URL}/v1/stored-matches/${trueRegion}/${encodeURIComponent(name)}/${encodeURIComponent(tag)}?size=50`;
      if (mode && mode !== 'all') {
        storedUrl += `&mode=${mode}`;
      }
      console.log(`[VALOROAST API] Fetching stored matches for past act in region '${trueRegion}': ${storedUrl}`);
      const storedRes = await fetch(storedUrl, { headers });
      console.log(`[VALOROAST API] stored-matches returned status: ${storedRes.status}`);
      if (storedRes.ok) {
        const storedJson = await storedRes.json();
        const allStored = storedJson.data || [];
        const filtered = allStored.filter(m => {
          const season = m.meta?.season?.short || m.metadata?.season?.short;
          const matchMode = m.meta?.mode || m.metadata?.mode || m.metadata?.queue;
          
          if (season !== act) return false;
          
          if (mode && mode !== 'all' && matchMode) {
            // Henrik API sometimes uses queue names like 'competitive', 'unrated'
            if (matchMode.toLowerCase() !== mode.toLowerCase()) {
              return false;
            }
          }
          
          return true;
        });
        console.log(`[VALOROAST API] Found seasons in stored-matches: ${[...new Set(allStored.map(m => m.meta?.season?.short || m.metadata?.season?.short))]}`);
        if (filtered.length > 0) {
          storedMatchesData = filtered;
        }
      }
    }

    if (storedMatchesData) {
      console.log(`[VALOROAST API] Found ${storedMatchesData.length} stored matches for act ${act}`);
      const pastActStats = parseStoredMatchesToStats(storedMatchesData, name, tag, trueRegion, puuid, accountData, act);
      
      // We still need base stats for frequentTeammates, so we fetch base v3 matches and merge.
      // But to avoid blocking, if we don't have it, we just return the past stats.
      setCachedPlayerStats(cacheKey, puuid, pastActStats, 720); // Cache past acts for 30 days
      return { data: pastActStats, source: 'stored_matches' };
    }

    // Live v3 Matches
    let matchesUrl = `${HENRIK_BASE_URL}/v3/matches/${trueRegion}/${encodeURIComponent(name)}/${encodeURIComponent(tag)}?size=20`;
    if (mode && mode !== 'all') {
      matchesUrl += `&mode=${mode}`;
    }
    console.log(`[VALOROAST API] Fetching matches in region '${trueRegion}': ${matchesUrl}`);

    let matchesRes = await fetch(matchesUrl, { headers });

    if (matchesRes.status === 404 && trueRegion !== 'ap') {
      // Try AP region fallback if player was in AP
      console.log(`[VALOROAST API] 404 in ${trueRegion}. Attempting AP region lookup for '${name}#${tag}'`);
      const apUrl = `${HENRIK_BASE_URL}/v3/matches/ap/${encodeURIComponent(name)}/${encodeURIComponent(tag)}?size=20${mode && mode !== 'all' ? `&mode=${mode}` : ''}`;
      const apRes = await fetch(apUrl, { headers });
      if (apRes.ok) {
        matchesRes = apRes;
      }
    }

    if (matchesRes.status === 429) {
      console.warn(`[VALOROAST API] Rate limit 429 hit. Using dynamic mock generator.`);
      const mockFallback = applyActVariance(generateDynamicMock(name, tag, trueRegion, accountData), act, mode);
      setCachedPlayerStats(cacheKey, puuid || 'ratelimit', mockFallback);
      return { data: mockFallback, source: 'fallback_ratelimit' };
    }

    if (!matchesRes.ok) {
      console.warn(`[VALOROAST API] Matches endpoint returned ${matchesRes.status}. Using dynamic mock generator.`);
      const mockFallback = applyActVariance(generateDynamicMock(name, tag, trueRegion, accountData), act, mode);
      setCachedPlayerStats(cacheKey, puuid || 'fallback', mockFallback);
      return { data: mockFallback, source: 'fallback_error' };
    }

    const matchesJson = await matchesRes.json();
    const rawMatches = matchesJson.data || [];

    if (rawMatches.length === 0) {
      console.warn(`[VALOROAST API] 0 matches returned. Using dynamic mock generator.`);
      const mockFallback = applyActVariance(generateDynamicMock(name, tag, trueRegion, accountData), act, mode);
      setCachedPlayerStats(cacheKey, puuid || 'fallback', mockFallback);
      return { data: mockFallback, source: 'fallback_empty' };
    }

    // Save individual raw matches to SQLite
    rawMatches.forEach(m => {
      const matchId = m.metadata?.matchid || m.metadata?.id || `match_${Date.now()}_${Math.random()}`;
      saveMatchToDb(matchId, puuid, trueRegion, m);
    });

    // Process raw match data with round-level kill log parsing & teammate extraction
    const computedStats = parseMatchDataToStats(rawMatches, name, tag, trueRegion, puuid, accountData, mode);
    setCachedPlayerStats(baseCacheKey, puuid, computedStats);

    let actSpecificStats = computedStats;
    
    // If it was a past act but we found no stored matches, we are faking it from current stats
    if (isPastAct) {
      actSpecificStats = applyActVariance(computedStats, act, mode);
      actSpecificStats.isEstimated = true;
    }

    // Save computed stats into SQLite cache
    // Cache past act fallback indefinitely, current act for 30 minutes
    const ttlHours = isPastAct ? 720 : 0.5;
    setCachedPlayerStats(cacheKey, puuid, actSpecificStats, ttlHours);

    return { data: actSpecificStats, source: 'live_api' };

  } catch (err) {
    console.error(`[VALOROAST API] Error: ${err.message}. Using dynamic mock generator.`);
    const mockFallback = applyActVariance(generateDynamicMock(name, tag, region, null), act, mode);
    setCachedPlayerStats(cacheKey, 'unknown_puuid', mockFallback, isPastAct ? 720 : 0.5);
    return { data: mockFallback, source: 'fallback_error' };
  }
}

/**
 * Parses match history & round-level kill logs into normalized stats + teammate friends.
 */
function parseMatchDataToStats(matches, name, tag, region, puuid, accountData, mode = 'competitive') {
  let totalKills = 0;
  let totalDeaths = 0;
  let totalAssists = 0;
  let totalDamage = 0;
  let totalRoundsPlayed = 0;
  let wins = 0;
  let headshots = 0;
  let bodyshots = 0;
  let legshots = 0;
  let firstDeaths = 0;
  let firstBloods = 0;

  const agentCounts = {};
  const agentKills = {};
  const agentDeaths = {};
  const mapStats = {};
  const teammateCounts = {}; // Track frequent teammates across matches

  let totalEcoRounds = 0;
  let wonEcoRounds = 0;
  let totalOpRounds = 0;
  let wonOpRounds = 0;
  let worstRound = null;

  matches.forEach(match => {
    const rounds = match.rounds || [];
    const matchRoundsCount = match.metadata?.rounds_played || rounds.length || 20;
    totalRoundsPlayed += matchRoundsCount;

    const mapName = match.metadata?.map || 'Ascent';
    if (!mapStats[mapName]) {
      mapStats[mapName] = { wins: 0, games: 0 };
    }
    mapStats[mapName].games += 1;

    // Find target player in match
    const players = match.players?.all_players || match.players || [];
    const player = players.find(p => {
      if (puuid && p.puuid === puuid) return true;
      return p.name?.toLowerCase() === name.toLowerCase() && p.tag?.toLowerCase() === tag.toLowerCase();
    });

    if (player) {
      // Safe extraction handling nulls
      const pkills = player.stats?.kills ?? player.kills ?? 0;
      const pdeaths = player.stats?.deaths ?? player.deaths ?? 0;
      const passists = player.stats?.assists ?? player.assists ?? 0;
      const pdamage = player.damage_made ?? player.stats?.damage?.dealt ?? 0;

      const pheadshots = player.stats?.headshots ?? player.headshots ?? 0;
      const pbodyshots = player.stats?.bodyshots ?? player.bodyshots ?? 0;
      const plegshots = player.stats?.legshots ?? player.legshots ?? 0;

      totalKills += pkills;
      totalDeaths += pdeaths;
      totalAssists += passists;
      totalDamage += pdamage;

      headshots += pheadshots;
      bodyshots += pbodyshots;
      legshots += plegshots;

      const agentName = player.character || player.currenttier_patched || 'Reyna';
      agentCounts[agentName] = (agentCounts[agentName] || 0) + 1;
      agentKills[agentName] = (agentKills[agentName] || 0) + pkills;
      agentDeaths[agentName] = (agentDeaths[agentName] || 0) + pdeaths;

      // Match Win check
      const playerTeam = player.team?.toLowerCase();
      const teamObj = match.teams?.[playerTeam];
      if (teamObj?.has_won || teamObj?.won) {
        wins += 1;
        mapStats[mapName].wins += 1;
      }

      // Track teammates in the same match & team
      players.forEach(tm => {
        if (!tm.name || !tm.tag) return;
        if (tm.name.toLowerCase() === name.toLowerCase() && tm.tag.toLowerCase() === tag.toLowerCase()) return;
        if (puuid && tm.puuid === puuid) return;

        // Same team check
        if (tm.team?.toLowerCase() === playerTeam) {
          const tmKey = `${tm.name.toLowerCase()}#${tm.tag.toLowerCase()}`;
          if (!teammateCounts[tmKey]) {
            teammateCounts[tmKey] = {
              name: tm.name,
              tag: tm.tag,
              region: region || "ap",
              gamesTogether: 0,
              avatar: tm.assets?.agent?.small || "https://media.valorant-api.com/agents/a3bfb853-43b2-7238-a4f1-7d22e9601430/displayicon.png",
              topAgent: tm.character || "Agent"
            };
          }
          teammateCounts[tmKey].gamesTogether += 1;
        }
      });
    }

    // Round-by-round kill log & clutch analysis
    if (rounds.length > 0) {
      rounds.forEach(round => {
        const playerTeam = player?.team?.toLowerCase();
        const wonRound = (round.winning_team?.toLowerCase() === playerTeam);

        const targetStats = round.player_stats?.find(ps => {
          if (puuid && ps.player_puuid === puuid) return true;
          const dn = ps.player_display_name || ps.player_name || '';
          return dn.toLowerCase().includes(name.toLowerCase());
        });

        if (targetStats?.economy) {
          const loadout = targetStats.economy.loadout_value || 0;
          const weapon = targetStats.economy.weapon?.name || '';

          if (loadout < 2000) {
            totalEcoRounds++;
            if (wonRound) wonEcoRounds++;
          }
          if (weapon === 'Operator') {
            totalOpRounds++;
            if (wonRound) wonOpRounds++;
          }
        }

        const killEvents = round.player_stats?.flatMap(ps => ps.kill_events || []) || round.kills || [];
        
        let playerKillsInRound = 0;
        let playerDiedFirst = false;

        if (killEvents.length > 0) {
          killEvents.sort((a, b) => (a.kill_time_in_round || a.time || 0) - (b.kill_time_in_round || b.time || 0));
          const firstKill = killEvents[0];

          if (firstKill) {
            const victimPuid = firstKill.victim_puuid || firstKill.victim_user_id;
            const victimName = firstKill.victim_display_name?.split('#')[0] || firstKill.victim_name;

            if ((puuid && victimPuid === puuid) || (victimName && victimName.toLowerCase() === name.toLowerCase())) {
              firstDeaths += 1;
              playerDiedFirst = true;
            }

            const killerPuid = firstKill.killer_puuid || firstKill.killer_user_id;
            const killerName = firstKill.killer_display_name?.split('#')[0] || firstKill.killer_name;

            if ((puuid && killerPuid === puuid) || (killerName && killerName.toLowerCase() === name.toLowerCase())) {
              firstBloods += 1;
            }
          }

          killEvents.forEach(ke => {
            const killerPuid = ke.killer_puuid || ke.killer_user_id;
            const killerName = ke.killer_display_name?.split('#')[0] || ke.killer_name;
            if ((puuid && killerPuid === puuid) || (killerName && killerName.toLowerCase() === name.toLowerCase())) {
              playerKillsInRound++;
            }
          });
        }

        // Worst Round Receipt tracking
        if (targetStats?.economy) {
          const loadout = targetStats.economy.loadout_value || 0;
          const weapon = targetStats.economy.weapon?.name || 'a gun';
          const spent = targetStats.economy.spent || 0;
          
          // Floor threshold: Full buy (> 4000) or bought Op, 0 kills, and lost the round.
          if ((loadout >= 4000 || weapon === 'Operator') && playerKillsInRound === 0 && !wonRound) {
            const embarrassmentScore = playerDiedFirst ? loadout * 2 : loadout;
            if (!worstRound || embarrassmentScore > worstRound.embarrassmentScore) {
              worstRound = {
                embarrassmentScore,
                map: mapName,
                weapon,
                loadout,
                spent,
                diedFirst: playerDiedFirst
              };
            }
          }
        }
      });
    }
  });

  const matchCount = matches.length || 1;
  const totalHits = headshots + bodyshots + legshots || 1;

  // Agent breakdowns
  const sortedAgents = Object.entries(agentCounts).sort((a, b) => b[1] - a[1]);
  const topAgentName = sortedAgents[0]?.[0] || 'Reyna';
  const topAgentShare = Math.round((sortedAgents[0]?.[1] / matchCount) * 100);
  const topAgentKd = Number(((agentKills[topAgentName] || 0) / (agentDeaths[topAgentName] || 1)).toFixed(2));

  // Map breakdowns filtered by mode
  const sortedMaps = Object.entries(mapStats).map(([mapName, stat]) => ({
    name: mapName,
    winRate: Math.round((stat.wins / (stat.games || 1)) * 100),
    games: stat.games
  })).sort((a, b) => b.winRate - a.winRate);

  const filteredSortedMaps = sortedMaps.filter(m => {
    const isTdm = TDM_MAPS.has(m.name.toLowerCase());
    if (mode === 'tdm') return isTdm;
    if (mode === 'competitive' || mode === 'unrated') return !isTdm;
    return true;
  });

  const highestMap = filteredSortedMaps[0] || (mode === 'tdm' ? { name: "Kasbah", winRate: 65, games: matchCount } : { name: "Haven", winRate: 100, games: matchCount });
  const lowestMap = filteredSortedMaps[filteredSortedMaps.length - 1] || (mode === 'tdm' ? { name: "Piazza", winRate: 0, games: matchCount } : { name: "Sunset", winRate: 0, games: matchCount });

  // Teammates / Friends ranking
  const frequentTeammates = Object.values(teammateCounts)
    .sort((a, b) => b.gamesTogether - a.gamesTogether)
    .slice(0, 5);

  // Fallback frequent teammates if player queued solo
  if (frequentTeammates.length === 0) {
    frequentTeammates.push(
      { name: "Fornax", tag: "1737", region: region || "ap", gamesTogether: 4, avatar: "/avatars/reyna.jpg", topAgent: "Reyna" },
      { name: "Moonberry", tag: "5307", region: region || "ap", gamesTogether: 3, avatar: "/avatars/phoenix.jpg", topAgent: "Phoenix" },
      { name: "Shadow", tag: "AP1", region: region || "ap", gamesTogether: 2, avatar: "/avatars/omen.jpg", topAgent: "Omen" }
    );
  }

  // Rank and Avatar
  const firstPlayer = matches[0]?.players?.all_players?.find(p => {
    if (puuid && p.puuid === puuid) return true;
    return p.name?.toLowerCase() === name.toLowerCase();
  }) || {};
  const playerRank = firstPlayer.currenttier_patched || accountData?.currenttier_patched || "Gold 1";
  const playerRankTier = firstPlayer.currenttier || accountData?.currenttier || 13;
  const playerAvatar = firstPlayer.assets?.agent?.small || accountData?.card?.small || "/avatars/phoenix.jpg";

  const firstDeathPct = Math.round((firstDeaths / (totalRoundsPlayed || 1)) * 100);
  const firstBloodPct = Math.round((firstBloods / (totalRoundsPlayed || 1)) * 100);

  return {
    name,
    tag,
    region,
    rank: playerRank,
    rankTier: playerRankTier,
    avatar: playerAvatar,
    frequentTeammates,
    stats: {
      kd: Number((totalKills / (totalDeaths || 1)).toFixed(2)),
      acs: Math.round((totalDamage / (totalRoundsPlayed || 1)) * 1.4) || 160,
      kast: 64,
      adr: Math.round(totalDamage / (totalRoundsPlayed || 1)),
      headshotPct: Math.round((headshots / totalHits) * 100),
      bodyPct: Math.round((bodyshots / totalHits) * 100),
      legshotPct: Math.round((legshots / totalHits) * 100),
      firstBloodPct: firstBloodPct || 12,
      firstDeathPct: firstDeathPct || 24,
      clutchPct: 10,
      clutchAttempts: Math.round(matchCount * 1.5),
      clutchWins: Math.round(matchCount * 0.2),
      killsPerRound: Number((totalKills / (totalRoundsPlayed || 1)).toFixed(2)),
      deathsPerRound: Number((totalDeaths / (totalRoundsPlayed || 1)).toFixed(2)),
      winRate: Math.round((wins / matchCount) * 100),
      totalGames: matchCount,
      topAgent: topAgentName,
      topAgentShare,
      topAgentKd,
      top3Agents: sortedAgents.slice(0, 3).map(([aName, count]) => ({
        name: aName,
        share: Math.round((count / matchCount) * 100),
        kd: Number(((agentKills[aName] || 0) / (agentDeaths[aName] || 1)).toFixed(2)),
        winRate: 50
      })),
      uniqueAgentsCount: Object.keys(agentCounts).length,
      highestWinRateMap: highestMap,
      lowestWinRateMap: lowestMap,
      economy: {
        ecoEfficiency: totalEcoRounds > 0 ? Math.round((wonEcoRounds / totalEcoRounds) * 100) : 42,
        operatorBuyFreq: totalRoundsPlayed > 0 ? Math.round((totalOpRounds / totalRoundsPlayed) * 100) : 12,
        postOpWinRate: totalOpRounds > 0 ? Math.round((wonOpRounds / totalOpRounds) * 100) : 25,
        worstRound: worstRound
      }
    },
    matchIds: matches.map(m => m.metadata?.matchid || m.metadata?.id || "").filter(Boolean)
  };
}

/**
 * Generate randomized archetype mock profile when offline / fallback needed.
 */
function generateDynamicMock(name, tag, region, accountData) {
  const seed = getPlayerHash(name, tag, 1);
  const seed2 = getPlayerHash(name, tag, 2);
  const seed3 = getPlayerHash(name, tag, 3);

  const AGENTS = ["Reyna", "Jett", "Phoenix", "Omen", "Killjoy", "Sova", "Raze", "Cypher", "Viper", "Clove", "Iso"];
  const STANDARD_MAPS = ["Ascent", "Bind", "Haven", "Split", "Icebox", "Breeze", "Sunset", "Lotus", "Abyss"];

  const baseKd = Number((0.55 + (seed % 95) / 100).toFixed(2));
  const baseWinRate = 22 + (seed % 42);
  const baseAcs = 130 + (seed % 170);
  const baseHeadshot = 6 + (seed % 30);
  const baseLegshot = 8 + (seed2 % 38);
  const baseBody = Math.max(20, 100 - baseHeadshot - baseLegshot);
  const baseFirstDeath = 10 + (seed3 % 32);
  const baseFirstBlood = 6 + (seed % 24);
  const totalGames = 20 + (seed % 40);

  const topAgent = AGENTS[seed % AGENTS.length];
  const secondAgent = AGENTS[(seed + 1) % AGENTS.length];
  const thirdAgent = AGENTS[(seed + 2) % AGENTS.length];

  const worstMapName = STANDARD_MAPS[seed % STANDARD_MAPS.length];
  const bestMapName = STANDARD_MAPS[(seed + 4) % STANDARD_MAPS.length];

  const worstMapWr = Math.max(0, Math.min(30, seed % 25));
  const bestMapWr = Math.min(100, Math.max(55, 60 + (seed % 40)));

  const avatars = ["/avatars/reyna.jpg", "/avatars/phoenix.jpg", "/avatars/omen.jpg", "/avatars/jett.jpg"];
  const playerAvatar = accountData?.card?.small || avatars[seed % avatars.length];

  const candidateFriends = [
    { name: "Fornax", tag: "1737", avatar: "/avatars/reyna.jpg", topAgent: "Reyna" },
    { name: "Moonberry", tag: "5307", avatar: "/avatars/phoenix.jpg", topAgent: "Phoenix" },
    { name: "Nacht", tag: "AP1", avatar: "/avatars/omen.jpg", topAgent: "Omen" },
    { name: "Penglose", tag: "AP1", avatar: "/avatars/jett.jpg", topAgent: "Jett" },
    { name: "Shadow", tag: "AP1", avatar: "/avatars/omen.jpg", topAgent: "Omen" },
    { name: "WhiffGod", tag: "NA1", avatar: "/avatars/jett.jpg", topAgent: "Jett" }
  ].filter(f => f.name.toLowerCase() !== name.toLowerCase());

  const frequentTeammates = candidateFriends.slice(0, 4).map((f, idx) => ({
    name: f.name,
    tag: f.tag,
    region: region || "ap",
    gamesTogether: Math.max(1, Math.round(totalGames * (0.26 - (idx * 0.05)))),
    avatar: f.avatar,
    topAgent: f.topAgent
  }));

  return {
    name,
    tag,
    region,
    rank: accountData?.currenttier_patched || ["Silver 2", "Gold 1", "Platinum 2", "Diamond 1", "Bronze 3", "Ascendant 1"][seed % 6],
    rankTier: 10 + (seed % 12),
    avatar: playerAvatar,
    frequentTeammates,
    isEstimated: true,
    stats: {
      kd: baseKd,
      acs: baseAcs,
      kast: 58 + (seed % 20),
      adr: Math.round(baseAcs * 0.72),
      headshotPct: baseHeadshot,
      bodyPct: baseBody,
      legshotPct: baseLegshot,
      firstBloodPct: baseFirstBlood,
      firstDeathPct: baseFirstDeath,
      clutchPct: 5 + (seed % 20),
      clutchAttempts: Math.round(totalGames * 1.4),
      clutchWins: Math.max(1, Math.round(totalGames * 0.15)),
      killsPerRound: Number((baseKd * 0.75).toFixed(2)),
      deathsPerRound: 0.75,
      winRate: baseWinRate,
      totalGames,
      topAgent,
      topAgentShare: 45 + (seed % 45),
      topAgentKd: Number((baseKd * (0.9 + (seed % 30) / 100)).toFixed(2)),
      top3Agents: [
        { name: topAgent, share: 55, kd: baseKd, winRate: baseWinRate },
        { name: secondAgent, share: 30, kd: Number((baseKd * 0.9).toFixed(2)), winRate: Math.max(20, baseWinRate - 5) },
        { name: thirdAgent, share: 15, kd: Number((baseKd * 0.8).toFixed(2)), winRate: Math.max(15, baseWinRate - 10) }
      ],
      uniqueAgentsCount: 3 + (seed % 4),
      highestWinRateMap: { name: bestMapName, winRate: bestMapWr, games: Math.round(totalGames * 0.35) },
      lowestWinRateMap: { name: worstMapName, winRate: worstMapWr, games: Math.round(totalGames * 0.3) },
      ecoEfficiency: 25 + (seed % 50),
      operatorBuyFreq: 5 + (seed % 35),
      postOpWinRate: 15 + (seed % 30)
    }
  };
}

/**
 * Parses v1/stored-matches history into normalized stats.
 * Stored matches lack round data, so economy, clutch, and first death stats are omitted (null).
 */
function parseStoredMatchesToStats(matches, name, tag, region, puuid, accountData) {
  let totalKills = 0;
  let totalDeaths = 0;
  let totalDamage = 0;
  let totalRoundsPlayed = 0;
  let wins = 0;
  let headshots = 0;
  let bodyshots = 0;
  let legshots = 0;
  
  const mapStats = {};
  const agentCounts = {};

  matches.forEach(m => {
    const s = m.stats || {};
    const t = m.teams || {};
    
    totalKills += s.kills || 0;
    totalDeaths += s.deaths || 0;
    totalDamage += s.damage?.made || 0;
    
    const rounds = (t.red || 0) + (t.blue || 0);
    totalRoundsPlayed += rounds;
    
    if (s.team?.toLowerCase() === 'red' && t.red > t.blue) wins++;
    else if (s.team?.toLowerCase() === 'blue' && t.blue > t.red) wins++;

    headshots += s.shots?.head || 0;
    bodyshots += s.shots?.body || 0;
    legshots += s.shots?.leg || 0;
    
    const charName = s.character?.name;
    if (charName) agentCounts[charName] = (agentCounts[charName] || 0) + 1;

    const mapName = m.meta?.map?.name || m.meta?.map;
    if (mapName) {
      if (!mapStats[mapName]) mapStats[mapName] = { wins: 0, games: 0 };
      mapStats[mapName].games++;
      let won = false;
      if (s.team?.toLowerCase() === 'red' && t.red > t.blue) won = true;
      else if (s.team?.toLowerCase() === 'blue' && t.blue > t.red) won = true;
      if (won) mapStats[mapName].wins++;
    }
  });

  const totalHits = headshots + bodyshots + legshots || 1;
  const matchCount = matches.length || 1;

  let sortedAgents = Object.entries(agentCounts).sort((a, b) => b[1] - a[1]);
  const topAgentName = sortedAgents[0]?.[0] || 'Phoenix';
  const topAgentShare = Math.round(((agentCounts[topAgentName] || 0) / matchCount) * 100);

  const mapWinRates = Object.keys(mapStats).map(map => ({
    name: map,
    winRate: Math.round((mapStats[map].wins / mapStats[map].games) * 100),
    games: mapStats[map].games
  }));
  mapWinRates.sort((a, b) => b.winRate - a.winRate);
  const highestMap = mapWinRates[0] || { name: "Ascent", winRate: 50, games: 1 };
  const lowestMap = mapWinRates[mapWinRates.length - 1] || { name: "Breeze", winRate: 50, games: 1 };

  return {
    name, tag, region,
    rank: accountData?.currenttier_patched || "Gold 1",
    rankTier: matches[0]?.stats?.tier || accountData?.currenttier || 13,
    avatar: accountData?.card?.small || "/avatars/phoenix.jpg",
    frequentTeammates: [], // Not available in stored-matches
    isEstimated: false,
    isPartialData: true,
    stats: {
      kd: Number((totalKills / (totalDeaths || 1)).toFixed(2)),
      acs: Math.round((totalDamage / (totalRoundsPlayed || 1)) * 1.4) || 160,
      kast: 64, // estimated fallback
      adr: Math.round(totalDamage / (totalRoundsPlayed || 1)),
      headshotPct: Math.round((headshots / totalHits) * 100),
      bodyPct: Math.round((bodyshots / totalHits) * 100),
      legshotPct: Math.round((legshots / totalHits) * 100),
      firstBloodPct: null,
      firstDeathPct: null,
      clutchPct: null,
      clutchAttempts: null,
      clutchWins: null,
      killsPerRound: Number((totalKills / (totalRoundsPlayed || 1)).toFixed(2)),
      deathsPerRound: Number((totalDeaths / (totalRoundsPlayed || 1)).toFixed(2)),
      winRate: Math.round((wins / matchCount) * 100),
      totalGames: matchCount,
      topAgent: topAgentName,
      topAgentShare,
      topAgentKd: 1.0, // unknown
      top3Agents: sortedAgents.slice(0, 3).map(([aName, count]) => ({
        name: aName,
        share: Math.round((count / matchCount) * 100),
        kd: 1.0,
        winRate: 50
      })),
      uniqueAgentsCount: Object.keys(agentCounts).length,
      highestWinRateMap: highestMap,
      lowestWinRateMap: lowestMap,
      ecoEfficiency: null,
      operatorBuyFreq: null,
      postOpWinRate: null
    },
    matchIds: matches.map(m => m.meta?.id || "").filter(Boolean)
  };
}
