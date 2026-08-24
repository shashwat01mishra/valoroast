/**
 * StatCompressor: Reduces raw match and MMR payloads into normalized, high-signal metric objects.
 */
export function compressStats(rawStats, actOverride = null, modeOverride = null) {
  const data = rawStats.stats ? { ...rawStats, ...rawStats.stats } : rawStats;
  const {
    kd = 1.0,
    acs = 200,
    kast = 70,
    adr = 130,
    headshotPct = 20,
    bodyPct = 60,
    legshotPct = 20,
    firstBloodPct = 15,
    firstDeathPct = 15,
    clutchPct = 15,
    clutchAttempts = 20,
    clutchWins = 3,
    killsPerRound = 0.7,
    deathsPerRound = 0.7,
    winRate = 50,
    totalGames = 100,
    topAgent = "Reyna",
    topAgentShare = 50,
    topAgentKd = 1.0,
    top3Agents = [],
    uniqueAgentsCount = 3,
    roleDistribution = {},
    highestWinRateMap = { name: "Ascent", winRate: 55, games: 20 },
    lowestWinRateMap = { name: "Breeze", winRate: 40, games: 20 },
    ecoEfficiency = 50,
    operatorBuyFreq = 10,
    postOpWinRate = 30
  } = data;
  
  const worstRound = data.economy?.worstRound || data.worstRound || null;

  const mapDelta = (highestWinRateMap.winRate || 50) - (lowestWinRateMap.winRate || 40);

  const ACT_LABELS = {
    'e9a2': 'Episode 9 Act 2',
    'e9a1': 'Episode 9 Act 1',
    'e8a3': 'Episode 8 Act 3',
    'e8a2': 'Episode 8 Act 2',
    'e8a1': 'Episode 8 Act 1',
    'all': 'All-Time Lifetime',
  };
  const MODE_LABELS = {
    'competitive': 'Competitive',
    'unrated': 'Unrated',
    'tdm': 'Team Deathmatch',
    'deathmatch': 'Deathmatch',
    'all': 'All Modes',
  };

  const act = actOverride || rawStats.act || data.act || 'e9a2';
  const actLabel = ACT_LABELS[act] || data.actLabel || 'Episode 9 Act 2';
  const mode = modeOverride || rawStats.mode || data.mode || 'competitive';
  const modeLabel = MODE_LABELS[mode] || 'Competitive';

  return {
    combat: {
      kd,
      acs,
      kast,
      adr,
      headshotPct,
      bodyPct,
      legshotPct,
      firstBloodPct,
      firstDeathPct,
      clutchPct,
      clutchAttempts,
      clutchWins,
      killsPerRound,
      deathsPerRound
    },
    agent: {
      topAgent,
      topAgentShare,
      topAgentKd,
      top3Agents,
      uniqueAgentsCount,
      roleDistribution
    },
    map: {
      highestWinRateMap,
      lowestWinRateMap,
      mapDelta
    },
    economy: {
      ecoEfficiency,
      operatorBuyFreq,
      postOpWinRate,
      worstRound
    },
    meta: {
      name: rawStats.name || 'Player',
      tag: rawStats.tag || '0000',
      winRate,
      totalGames,
      act,
      actLabel,
      mode,
      modeLabel,
      rank: rawStats.rank || 'Unranked',
      rankTier: rawStats.rankTier || rawStats.stats?.rankTier || 0,
      matchIds: rawStats.matchIds || []
    }
  };
}
