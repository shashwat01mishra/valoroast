/**
 * ComboDetector: Detects funny interactions when multiple behavioral archetypes collide.
 * Archetype combinations yield higher contextual comedic value than single archetypes.
 */
export function detectCombos(compressedStats, archetypes = [], contradictions = []) {
  const { combat, agent, map, economy, meta } = compressedStats;
  const combos = [];
  const archetypeIds = new Set(archetypes.map(a => a.id));

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

  // Helper to add combo
  const addCombo = (id, title, badgeTitle, severity, evidence, summary, mainRoast, verdict) => {
    combos.push({
      id,
      title,
      badgeTitle: badgeTitle || title,
      score: severity,
      isCombo: true,
      evidence,
      summary,
      mainRoast,
      verdict
    });
  };

  // 1. One-Trick + Poor Performance ("The Instalock Fraud")
  if ((archetypeIds.has("FAKE_SPECIALIST") || agent.topAgentShare >= 65) && agent.topAgentKd < 0.85) {
    const shareSev = scaleScore(agent.topAgentShare, 65, 100, 50);
    const kdSev = scaleScore(agent.topAgentKd, 0.85, 0.40, 50);
    const severity = Math.min(100, 20 + shareSev + kdSev);

    addCombo(
      "COMBO_ONETRICK_FRAUD",
      "The Instalock Fraud",
      "Mastery Impostor",
      severity,
      [
        { metric: "Main Agent Share", value: `${agent.topAgentShare}% ${agent.topAgent}`, comparison: "instalock" },
        { metric: "Agent K/D", value: `${agent.topAgentKd} K/D`, comparison: "underperforming" },
        { metric: "Win Rate", value: `${meta.winRate}% WR`, comparison: "dismal" }
      ],
      `Instalocks ${agent.topAgent} every match. Plays like it's his first install.`,
      `He locks in ${agent.topAgent} within 0.2 seconds of loading into agent select, only to output a ${agent.topAgentKd} K/D and a ${meta.winRate}% win rate. 200 matches of dedicated mediocrity on a single agent.`,
      "Verdict: His main agent should issue a restraining order."
    );
  }

  // 2. High K/D + Low Win Rate ("The Exit-Frag Philanthropist")
  if (combat.kd >= 1.15 && meta.winRate < 45) {
    const kdSev = scaleScore(combat.kd, 1.15, 1.50, 50);
    const wrSev = scaleScore(meta.winRate, 45, 20, 50);
    const severity = Math.min(100, 20 + kdSev + wrSev);

    addCombo(
      "COMBO_STAT_MIRAGE",
      "The Exit-Frag Philanthropist",
      "RR Redistributor",
      severity,
      [
        { metric: "K/D Ratio", value: `${combat.kd} K/D`, comparison: "high_kills" },
        { metric: "Win Rate", value: `${meta.winRate}% WR`, comparison: "low_wins" },
        { metric: "First Death Rate", value: `${combat.firstDeathPct}% FD`, comparison: "baited" }
      ],
      "He doesn't lose RR. He redistributes it.",
      `With a ${combat.kd} K/D and a ${meta.winRate}% win rate, he isn't carrying—he's farming non-impact exit kills while his teammates push site and die. He wins every duel and throws every match.`,
      "Verdict: Enemy team's secret financial sponsor."
    );
  }

  // 3. High ACS + High First Death ("The Tactical Comet")
  if (combat.acs >= 220 && combat.firstDeathPct >= 25) {
    const acsSev = scaleScore(combat.acs, 220, 300, 50);
    const fdSev = scaleScore(combat.firstDeathPct, 25, 45, 50);
    const severity = Math.min(100, 15 + acsSev + fdSev);

    addCombo(
      "COMBO_ENTRY_ACS",
      "The Tactical Comet",
      "Feast or Famine",
      severity,
      [
        { metric: "ACS", value: `${combat.acs} ACS`, comparison: "high" },
        { metric: "First Death %", value: `${combat.firstDeathPct}% FD`, comparison: "extreme" }
      ],
      "He either drops 30 or dies in 2 seconds. No in-between.",
      `Boasting ${combat.acs} ACS alongside a ${combat.firstDeathPct}% first death rate, his rounds last either 3 minutes or 3 seconds. The moment the barriers drop, he either aces or inspects the spectator camera.`,
      "Verdict: Flip a coin before every round."
    );
  }

  // 4. High Total Games + Abysmal K/D ("The Iron Veteran")
  if (meta.totalGames >= 120 && combat.kd < 0.82) {
    const gamesSev = scaleScore(meta.totalGames, 120, 500, 50);
    const kdSev = scaleScore(combat.kd, 0.82, 0.40, 50);
    const severity = Math.min(100, 15 + gamesSev + kdSev);

    addCombo(
      "COMBO_VETERAN_HARDSTUCK",
      "The Iron Veteran",
      "Experienced Bottom-Fragger",
      severity,
      [
        { metric: "Total Games", value: `${meta.totalGames} Matches`, comparison: "high_experience" },
        { metric: "Overall K/D", value: `${combat.kd} K/D`, comparison: "low" },
        { metric: "Win Rate", value: `${meta.winRate}% WR`, comparison: "hardstuck" }
      ],
      `${meta.totalGames} games to perfect the art of going negative.`,
      `He has logged over ${meta.totalGames} competitive matches, accumulating hundreds of hours of experience—yet maintains a ${combat.kd} K/D and ${meta.winRate}% win rate. Most people learn from their mistakes; he turns them into a career.`,
      "Verdict: Practice doesn't make perfect. It makes permanent."
    );
  }

  // 5. High Clutch Attempts + Low Success ("The Spectator Mascot")
  if (combat.clutchAttempts >= 20 && combat.clutchPct <= 8) {
    const attSev = scaleScore(combat.clutchAttempts, 20, 60, 50);
    const pctSev = scaleScore(combat.clutchPct, 8, 0, 50);
    const severity = Math.min(100, 15 + attSev + pctSev);

    addCombo(
      "COMBO_CLUTCH_CHOKER",
      "The Spectator Mascot",
      "1vN Survivor",
      severity,
      [
        { metric: "1vN Situations", value: `${combat.clutchAttempts} Attempts`, comparison: "frequent" },
        { metric: "Clutch Win Rate", value: `${combat.clutchPct}% Wins`, comparison: "dismal" }
      ],
      "Always the last man standing. Never the hero.",
      `He has survived to a 1vN situation ${combat.clutchAttempts} times, only to convert a tragic ${combat.clutchPct}% of them into round wins. His team spends more time spectating his crosshair than playing the actual game.`,
      "Verdict: Round 2026's dedicated last-alive spectator."
    );
  }

  // 6. Low Headshot + High Legshot ("Subterranean Crosshair")
  if (combat.legshotPct >= 32 && combat.headshotPct <= 12) {
    const legSev = scaleScore(combat.legshotPct, 32, 60, 50);
    const headSev = scaleScore(combat.headshotPct, 12, 0, 50);
    const severity = Math.min(100, 20 + legSev + headSev);

    addCombo(
      "COMBO_LEGSHOT_HEADSHOT",
      "Subterranean Crosshair",
      "Floor Inspector",
      severity,
      [
        { metric: "Legshot %", value: `${combat.legshotPct}% LS`, comparison: "extremely_high" },
        { metric: "Headshot %", value: `${combat.headshotPct}% HS`, comparison: "below_ground" }
      ],
      `With ${combat.legshotPct}% legshots and ${combat.headshotPct}% headshots, the crosshair is underground.`,
      `While normal players aim at head level, his crosshair is legally mandated to stay at shin height. Enemy armor remains pristine, but ankle injuries across opponent duelists have reached record highs.`,
      "Verdict: Lower-body surgical specialist."
    );
  }

  // 7. Eco Destroyer + High First Death ("The Op Donor")
  if ((economy.operatorBuyFreq >= 15 || economy.ecoEfficiency <= 30) && combat.firstDeathPct >= 25) {
    const opSev = economy.operatorBuyFreq >= 15 ? scaleScore(economy.operatorBuyFreq, 15, 30, 50) : scaleScore(economy.ecoEfficiency, 30, 0, 50);
    const fdSev = scaleScore(combat.firstDeathPct, 25, 45, 50);
    const severity = Math.min(100, 20 + opSev + fdSev);

    addCombo(
      "COMBO_ECO_MARTYR",
      "The Operator Charity",
      "Eco Sponsor",
      severity,
      [
        { metric: "First Death %", value: `${combat.firstDeathPct}% FD`, comparison: "very_high" },
        { metric: "Op Buy Frequency", value: `${economy.operatorBuyFreq}% Buys`, comparison: "frequent" },
        { metric: "Post-Op Win Rate", value: `${economy.postOpWinRate}% WR`, comparison: "disastrous" }
      ],
      "Buys a $4700 Operator, peeks main, and donates it in 3 seconds.",
      `He forces an Operator on a save round, runs into C-Long with zero utility support, and gifts a pristine sniper to the enemy Jett before his team can even finish calling out B-site.`,
      "Verdict: Generous donor of high-tier weaponry."
    );
  }

  // Sort combos by score
  combos.sort((a, b) => b.score - a.score);
  return combos;
}
