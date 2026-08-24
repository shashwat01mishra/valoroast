/**
 * ArchetypeDetector: Rule-based classifier that identifies humorous behavioral archetypes
 * and calculates fit scores based on statistical evidence.
 */
export function detectArchetypes(compressedStats, contradictions = []) {
  const { combat, agent, map, economy, meta } = compressedStats;
  const archetypes = [];

  const addArchetype = (id, title, baseScore, evidence, description, badgeTitle) => {
    // Check if boosted by contradiction engine
    const contradictionMatch = contradictions.find(c => c.id === id);
    const score = contradictionMatch ? baseScore * contradictionMatch.scoreBoost : baseScore;
    const finalScore = Math.min(100, Math.round(score));

    archetypes.push({
      id,
      title,
      score: finalScore,
      badgeTitle: badgeTitle || title,
      evidence,
      description,
      isContradiction: !!contradictionMatch
    });
  };

  const clamp = (val, min, max) => Math.max(min, Math.min(max, val));
  const scaleScore = (val, threshold, extreme, maxScore) => {
    if (extreme > threshold) {
      if (val <= threshold) return 0;
      return clamp(((val - threshold) / (extreme - threshold)) * maxScore, 0, maxScore);
    } else {
      if (val >= threshold) return 0;
      return clamp(((threshold - val) / (threshold - extreme)) * maxScore, 0, maxScore);
    }
  };

  const tier = meta.rankTier || 13;
  let badKd = 0.80;
  if (tier <= 8) badKd = 0.75; // Iron-Bronze
  else if (tier >= 15 && tier <= 20) badKd = 0.85; // Plat-Diamond
  else if (tier >= 21) badKd = 0.90; // Ascendant+

  let mirageKd = 1.15;
  if (tier <= 8) mirageKd = 1.25; // Iron-Bronze
  else if (tier >= 21) mirageKd = 1.10; // Ascendant+

  let aimFraudKd = 0.85;
  if (tier <= 8) aimFraudKd = 0.80; // Iron-Bronze
  else if (tier >= 15 && tier <= 20) aimFraudKd = 0.90; // Plat-Diamond
  else if (tier >= 21) aimFraudKd = 0.95; // Ascendant+

  // 1. The Derank Consultant / Mode-tailored Equivalent
  if (combat.kd < badKd && meta.winRate < 43 && combat.firstDeathPct > 24) {
    const mode = meta.mode || 'competitive';
    let title = "The Certified Derank Consultant";
    let desc = "Queuing with this player is essentially an RR loss with a custom loading screen.";
    let badge = "Derank Specialist";

    if (mode === 'unrated') {
      title = "The Lobby Hostage Taker";
      desc = "Drags his squad through 40-minute 3-13 unrated losses by voting NO on every surrender.";
      badge = "Hostage Taker";
    } else if (mode === 'tdm') {
      title = "The Free Weapon Feeder";
      desc = "Spawns into Team Deathmatch only to donate free kills and weapons to the enemy team.";
      badge = "Respawn Bleeder";
    } else if (mode === 'deathmatch') {
      title = "The Warmup Saboteur";
      desc = "Camps corners in Deathmatch with an Operator and still finishes in the bottom 3.";
      badge = "Warmup Feeder";
    } else if (mode === 'all') {
      title = "The Universal Match Feeder";
      desc = "Across every game mode, queuing with him guarantees a swift and painful defeat.";
      badge = "Universal Hazard";
    }

    const kdSev = scaleScore(combat.kd, badKd, 0.40, 50);
    const wrSev = scaleScore(meta.winRate, 43, 20, 50);
    const fdSev = scaleScore(combat.firstDeathPct, 24, 45, 20); // Extra boost
    const severity = Math.min(100, 50 + kdSev + wrSev + fdSev); // Base 50 to guarantee selection if matched

    addArchetype(
      "DERANK_CONSULTANT",
      title,
      severity,
      [
        { metric: "K/D Ratio", value: `${combat.kd}`, comparison: "very_low" },
        { metric: "Win Rate", value: `${meta.winRate}%`, comparison: "critical" },
        { metric: "First Death Rate", value: `${combat.firstDeathPct}%`, comparison: "very_high" }
      ],
      desc,
      badge
    );
  }

  // 2. The First Blood Donation Program
  if (combat.firstDeathPct >= 28) {
    const fdSev = scaleScore(combat.firstDeathPct, 28, 45, 60);
    const severity = 40 + fdSev;

    addArchetype(
      "FIRST_BLOOD_DONOR",
      "First Blood Donation Program",
      severity,
      [
        { metric: "First Death Rate", value: `${combat.firstDeathPct}%`, comparison: "extremely_high" },
        { metric: "First Blood Rate", value: `${combat.firstBloodPct}%`, comparison: "low" }
      ],
      "Bro treats first blood like a monthly subscription service.",
      "Entry Victim"
    );
  }

  // 3. The Statistical Mirage
  if (combat.kd >= mirageKd && meta.winRate < 45) {
    const kdSev = scaleScore(combat.kd, mirageKd, mirageKd + 0.40, 50);
    const wrSev = scaleScore(meta.winRate, 45, 25, 50);
    const severity = 40 + kdSev + wrSev;

    addArchetype(
      "STATISTICAL_MIRAGE",
      "The Statistical Mirage",
      severity,
      [
        { metric: "K/D Ratio", value: `${combat.kd}`, comparison: "high" },
        { metric: "Win Rate", value: `${meta.winRate}%`, comparison: "very_low" }
      ],
      "He wins gunfights, loses rounds, and blames team chat for both.",
      "KD Farmer"
    );
  }

  // 4. The Legshot Specialist
  if (combat.legshotPct >= 35) {
    const sev = scaleScore(combat.legshotPct, 35, 60, 60);
    const severity = 40 + sev;

    addArchetype(
      "LEGSHOT_SPECIALIST",
      "The Legshot Specialist",
      severity,
      [
        { metric: "Legshot Rate", value: `${combat.legshotPct}%`, comparison: "unusually_high" },
        { metric: "Headshot Rate", value: `${combat.headshotPct}%`, comparison: "below_average" }
      ],
      "Every enemy has knees, and he has made it his sworn mission to protect them.",
      "Knee Surgeon"
    );
  }

  // 5. The Fake Specialist
  if (agent.topAgentShare >= 65 && agent.topAgentKd < 0.85) {
    const shareSev = scaleScore(agent.topAgentShare, 65, 100, 50);
    const kdSev = scaleScore(agent.topAgentKd, 0.85, 0.50, 50);
    const severity = shareSev + kdSev;

    addArchetype(
      "FAKE_SPECIALIST",
      "The Fake Specialist",
      severity,
      [
        { metric: "Main Agent", value: `${agent.topAgentShare}% ${agent.topAgent}`, comparison: "one_trick" },
        { metric: "Agent K/D", value: `${agent.topAgentKd}`, comparison: "underperforming" }
      ],
      `300 games on ${agent.topAgent} and still hasn't figured out where the abilities land.`,
      "Mastery Fraud"
    );
  }

  // 6. The Agent One-Trick
  if (agent.topAgentShare >= 70 && agent.topAgentKd >= 0.85) {
    const sev = scaleScore(agent.topAgentShare, 70, 100, 80);
    const severity = 20 + sev;

    addArchetype(
      "AGENT_ONE_TRICK",
      "The Agent One-Trick",
      severity,
      [
        { metric: "Primary Agent Share", value: `${agent.topAgentShare}% ${agent.topAgent}`, comparison: "dominant" },
        { metric: "Unique Agents", value: `${agent.uniqueAgentsCount}`, comparison: "restricted" }
      ],
      `Has mastered ${agent.topAgent} and is currently pursuing a PhD in avoiding every other agent.`,
      "One-Trick Pony"
    );
  }

  // 7. The Map Curse
  if (map.lowestWinRateMap.winRate < 30 && map.mapDelta >= 25) {
    const sev = scaleScore(map.lowestWinRateMap.winRate, 30, 0, 100);
    
    addArchetype(
      "MAP_CURSE",
      `The Curse of ${map.lowestWinRateMap.name}`,
      sev,
      [
        { metric: "Worst Map WR", value: `${map.lowestWinRateMap.winRate}% on ${map.lowestWinRateMap.name}`, comparison: "disaster" },
        { metric: "Best Map WR", value: `${map.highestWinRateMap.winRate}% on ${map.highestWinRateMap.name}`, comparison: "solid" }
      ],
      `Every map in Valorant is playable. Somehow ${map.lowestWinRateMap.name} triggers an emergency server exit.`,
      "Map Disaster"
    );
  }

  // 8. The Eco Destroyer
  if (economy.ecoEfficiency <= 30 || (economy.operatorBuyFreq >= 20 && economy.postOpWinRate <= 30)) {
    const ecoSev = scaleScore(economy.ecoEfficiency, 30, 0, 100);
    const opSev = economy.operatorBuyFreq >= 20 ? scaleScore(economy.postOpWinRate, 30, 0, 100) : 0;
    const severity = Math.max(ecoSev, opSev, 40);

    addArchetype(
      "ECO_DESTROYER",
      "The Eco Terrorist",
      severity,
      [
        { metric: "Eco Efficiency", value: `${economy.ecoEfficiency}%`, comparison: "poor" },
        { metric: "Op Buy Win Rate", value: `${economy.postOpWinRate}%`, comparison: "disastrous" }
      ],
      "Team economy: $9,000. His economy: immediate bankruptcy and a donated Operator.",
      "Financial Hazard"
    );
  }

  // 9. The Overqualified Bottom Fragger
  if (meta.totalGames >= 120 && combat.kd < badKd) {
    const kdSev = scaleScore(combat.kd, badKd, 0.40, 50);
    const gamesSev = scaleScore(meta.totalGames, 120, 500, 50);
    const severity = kdSev + gamesSev;

    addArchetype(
      "OVERQUALIFIED_BOTTOM_FRAGGER",
      "The Overqualified Bottom Fragger",
      severity,
      [
        { metric: "Total Matches", value: `${meta.totalGames} Games`, comparison: "high_experience" },
        { metric: "Combat K/D", value: `${combat.kd} K/D`, comparison: "consistently_low" }
      ],
      "Hundreds of matches of experience and somehow still installing the game.",
      "Iron Veteran"
    );
  }

  // 10. The Aim Fraud
  if (combat.headshotPct >= 25 && combat.kd < aimFraudKd) {
    const hsSev = scaleScore(combat.headshotPct, 25, 50, 50);
    const kdSev = scaleScore(combat.kd, aimFraudKd, 0.40, 50);
    const severity = hsSev + kdSev;

    addArchetype(
      "AIM_FRAUD",
      "The Aim Fraud",
      severity,
      [
        { metric: "Headshot Rate", value: `${combat.headshotPct}%`, comparison: "impressive" },
        { metric: "K/D Output", value: `${combat.kd}`, comparison: "underperforming" }
      ],
      "The crosshair is technically present on the enemy head. The damage simply isn't.",
      "Range Hero"
    );
  }

  // 11. The Clutch Choker
  if (combat.clutchAttempts >= 20 && combat.clutchPct <= 8) {
    const sev = scaleScore(combat.clutchPct, 8, 0, 100);

    addArchetype(
      "CLUTCH_CHOKER",
      "The Clutch Choker",
      sev,
      [
        { metric: "1vN Situations", value: `${combat.clutchAttempts} Attempts`, comparison: "frequent" },
        { metric: "Clutch Rate", value: `${combat.clutchPct}%`, comparison: "dismal" }
      ],
      "Always the last man standing, never the guy winning the round.",
      "1vN Spectator"
    );
  }

  // 12. The Role Tourist
  if (agent.uniqueAgentsCount >= 5 && agent.topAgentShare <= 35) {
    const sev = scaleScore(agent.topAgentShare, 35, 10, 100);

    addArchetype(
      "ROLE_TOURIST",
      "The Role Tourist",
      sev,
      [
        { metric: "Unique Agents", value: `${agent.uniqueAgentsCount} Agents`, comparison: "scattered" },
        { metric: "Top Agent Share", value: `${agent.topAgentShare}%`, comparison: "uncommitted" }
      ],
      "Plays every agent in the roster and has mastered zero of them.",
      "Agent Flexer"
    );
  }

  // Fallback default if no extreme archetype triggered
  if (archetypes.length === 0) {
    addArchetype(
      "BALANCED_MEDIOCRE",
      "The Aggressively Average Duelist",
      60,
      [
        { metric: "K/D Ratio", value: `${combat.kd}`, comparison: "average" },
        { metric: "Win Rate", value: `${meta.winRate}%`, comparison: "neutral" }
      ],
      "Blends so seamlessly into the team scoreboard that riot's anti-cheat almost forgot he was in the lobby.",
      "NPC Teammate"
    );
  }

  // Sort by final score descending
  archetypes.sort((a, b) => b.score - a.score);
  return archetypes;
}
