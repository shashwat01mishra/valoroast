/**
 * ContradictionEngine: Detects statistical paradoxes in player data.
 * Returns a list of detected contradictions with high priority multipliers.
 */
export function detectContradictions(compressedStats) {
  const { combat, agent, map, economy, meta } = compressedStats;
  const contradictions = [];

  const tier = meta.rankTier || 13;
  let badKd = 0.82;
  if (tier <= 8) badKd = 0.77; // Iron-Bronze
  else if (tier >= 15 && tier <= 20) badKd = 0.87; // Plat-Diamond
  else if (tier >= 21) badKd = 0.92; // Ascendant+

  let mirageKd = 1.15;
  if (tier <= 8) mirageKd = 1.25; // Iron-Bronze
  else if (tier >= 21) mirageKd = 1.10; // Ascendant+

  let aimFraudKd = 0.85;
  if (tier <= 8) aimFraudKd = 0.80; // Iron-Bronze
  else if (tier >= 15 && tier <= 20) aimFraudKd = 0.90; // Plat-Diamond
  else if (tier >= 21) aimFraudKd = 0.95; // Ascendant+

  // 1. High K/D + Low Win Rate ("Statistical Mirage")
  if (combat.kd >= mirageKd && meta.winRate < 45) {
    contradictions.push({
      id: "STATISTICAL_MIRAGE",
      title: "The Statistical Mirage",
      scoreBoost: 2.5,
      evidence: [
        { metric: "K/D Ratio", value: `${combat.kd} K/D`, status: "High Kill Output" },
        { metric: "Win Rate", value: `${meta.winRate}% WR`, status: "Abysmal Match Wins" }
      ],
      concept: "Wins every gunfight, loses every round, and blames everyone else."
    });
  }

  // 2. High Pick Rate + Low K/D ("The Fake Specialist")
  if (agent.topAgentShare >= 65 && agent.topAgentKd < 0.85) {
    contradictions.push({
      id: "FAKE_SPECIALIST",
      title: "The Fake Specialist",
      scoreBoost: 2.3,
      evidence: [
        { metric: "Main Agent", value: `${agent.topAgentShare}% on ${agent.topAgent}`, status: "Massive Pick Rate" },
        { metric: "Agent K/D", value: `${agent.topAgentKd} K/D`, status: "Zero Mastered Skill" }
      ],
      concept: `Has hundreds of games on ${agent.topAgent} and still plays like it's their first install.`
    });
  }

  // 3. High HS% + Low ADR / K/D ("The Aim Fraud")
  if (combat.headshotPct >= 25 && combat.kd < aimFraudKd) {
    contradictions.push({
      id: "AIM_FRAUD",
      title: "The Aim Fraud",
      scoreBoost: 2.2,
      evidence: [
        { metric: "Headshot %", value: `${combat.headshotPct}% HS`, status: "Crisp Crosshair" },
        { metric: "K/D Ratio", value: `${combat.kd} K/D`, status: "No Impact Kills" }
      ],
      concept: "Crosshair is technically on head level, but the damage simply isn't happening."
    });
  }

  // 4. High Clutch Attempts + Low Clutch Wins ("Clutch Choker")
  if (combat.clutchAttempts >= 20 && combat.clutchPct <= 8) {
    contradictions.push({
      id: "CLUTCH_CHOKER",
      title: "The Clutch Choker",
      scoreBoost: 2.1,
      evidence: [
        { metric: "1vN Situations", value: `${combat.clutchAttempts} Attempts`, status: "Frequent Last-Alive" },
        { metric: "Clutch Rate", value: `${combat.clutchPct}% Wins`, status: "Zero Round Finishes" }
      ],
      concept: "Always the last man standing, never the guy winning the round."
    });
  }

  // 5. Operator Spam + Low Op-Round Win Rate ("Eco Terrorist")
  if (economy.operatorBuyFreq >= 20 && economy.postOpWinRate <= 30) {
    contradictions.push({
      id: "ECO_TERRORIST",
      title: "The Eco Terrorist",
      scoreBoost: 2.0,
      evidence: [
        { metric: "Op Purchase Rate", value: `${economy.operatorBuyFreq}% Buys`, status: "Buys $4700 Gun" },
        { metric: "Op-Round Win %", value: `${economy.postOpWinRate}% Win Rate`, status: "Donates Op Immediately" }
      ],
      concept: "Treats team credits like a personal emergency fund and gifts Operators to enemy duelists."
    });
  }

  // 6. High Overall Winrate + Massive Map Failure ("The Map Curse")
  if (map.mapDelta >= 35 && map.lowestWinRateMap.winRate < 30) {
    contradictions.push({
      id: "MAP_CURSE",
      title: `The Curse of ${map.lowestWinRateMap.name}`,
      scoreBoost: 1.9,
      evidence: [
        { metric: "Best Map", value: `${map.highestWinRateMap.winRate}% on ${map.highestWinRateMap.name}`, status: "Solid Performance" },
        { metric: "Cursed Map", value: `${map.lowestWinRateMap.winRate}% on ${map.lowestWinRateMap.name}`, status: "Complete Mental Collapse" }
      ],
      concept: `Every map is playable. Somehow ${map.lowestWinRateMap.name} is a health hazard.`
    });
  }

  // 7. High ACS + High First Death % ("Feast or Famine")
  if (combat.acs >= 230 && combat.firstDeathPct >= 25) {
    contradictions.push({
      id: "HIGH_ACS_HIGH_DEATH",
      title: "Feast or Famine",
      scoreBoost: 2.2,
      evidence: [
        { metric: "Combat Score", value: `${combat.acs} ACS`, status: "High Output" },
        { metric: "First Death %", value: `${combat.firstDeathPct}% FD`, status: "Instant Victim" }
      ],
      concept: "Drops 30 kills or dies in 2 seconds. Zero middle ground."
    });
  }

  // 8. High Total Games + Abysmal K/D ("Veteran Hardstuck")
  if (meta.totalGames >= 120 && combat.kd < badKd) {
    contradictions.push({
      id: "VETERAN_HARDSTUCK",
      title: "Veteran Hardstuck",
      scoreBoost: 2.1,
      evidence: [
        { metric: "Matches Played", value: `${meta.totalGames} Games`, status: "Experienced" },
        { metric: "K/D Ratio", value: `${combat.kd} K/D`, status: "Perpetually Negative" }
      ],
      concept: "Has logged hundreds of games of dedicated practice at going negative."
    });
  }

  // 9. Low Headshot % + High Legshot % ("Subterranean Crosshair")
  if (combat.legshotPct >= 30 && combat.headshotPct <= 12) {
    contradictions.push({
      id: "LEGSHOT_HEADSHOT_INVERSION",
      title: "Subterranean Aim",
      scoreBoost: 2.3,
      evidence: [
        { metric: "Headshot %", value: `${combat.headshotPct}% HS`, status: "Missing Skywards" },
        { metric: "Legshot %", value: `${combat.legshotPct}% LS`, status: "Floor Specialist" }
      ],
      concept: "Crosshair placement is legally mandated to stay below kneecap height."
    });
  }

  return contradictions;
}
