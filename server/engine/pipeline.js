import { compressStats } from './statCompressor.js';
import { detectContradictions } from './contradictionEngine.js';
import { detectArchetypes } from './archetypeDetector.js';
import { detectCombos } from './comboDetector.js';
import { generateRoast } from './roastGenerator.js';
import { evaluateRoast } from './qualityEvaluator.js';

/**
 * Execute the full Valoroast Roast Pipeline on player data.
 */
const ACT_MAP = {
  'e9a2': 'EPISODE 9 ACT 2',
  'e9a1': 'EPISODE 9 ACT 1',
  'e8a3': 'EPISODE 8 ACT 3',
  'e8a2': 'EPISODE 8 ACT 2',
  'e8a1': 'EPISODE 8 ACT 1',
  'all': 'ALL-TIME LIFETIME',
};

const MODE_MAP = {
  'competitive': 'COMPETITIVE',
  'unrated': 'UNRATED',
  'tdm': 'TEAM DEATHMATCH',
  'deathmatch': 'DEATHMATCH',
  'all': 'ALL MODES',
};

export function runRoastPipeline(rawStats, options = {}) {
  const { intensity = "spicy", variantSeed = 0, history = [], act = "e9a2", mode = "competitive", style = "classic" } = options;

  // 1. Stat Compression with Act & Mode
  const compressed = compressStats(rawStats, act, mode);
  if (rawStats.isEstimated) compressed.meta.isEstimated = true;
  if (rawStats.isPartialData) compressed.meta.isPartialData = true;

  // 2. Contradiction Detection
  const contradictions = detectContradictions(compressed);

  // 3. Archetype Classification
  const archetypes = detectArchetypes(compressed, contradictions);

  // 4. Archetype Combo Detection
  const combos = detectCombos(compressed, archetypes, contradictions);

  // Decide roast target: Top combo vs Top archetype
  let target = archetypes[0];
  if (combos.length > 0 && combos[0].score >= target.score * 0.95) {
    target = combos[0];
  }

  // 5. Roast Generation
  const roastOptions = {
    act,
    actLabel: ACT_MAP[act] || act.toUpperCase(),
    mode,
    modeLabel: MODE_MAP[mode] || mode.toUpperCase(),
    style
  };
  let roast = generateRoast(target, compressed, intensity, variantSeed, roastOptions);

  // 6. Quality Evaluation
  let evalResult = evaluateRoast(roast, compressed, history);

  // If rejected or rerolling with fallback, try runner-up targets
  if (!evalResult.passed) {
    const fallbackTarget = combos[1] || archetypes[1] || archetypes[0];
    roast = generateRoast(fallbackTarget, compressed, intensity, variantSeed + 1, roastOptions);
    evalResult = evaluateRoast(roast, compressed, history);
  }

  return {
    player: {
      name: rawStats.name || "Player",
      tag: rawStats.tag || "NA1",
      region: rawStats.region || "na",
      rank: rawStats.rank || "Unrated",
      rankTier: rawStats.rankTier || 0,
      avatar: rawStats.avatar,
      isEstimated: !!compressed.meta.isEstimated,
      isPartialData: !!compressed.meta.isPartialData,
      act: act,
      actLabel: ACT_MAP[act] || act.toUpperCase(),
      mode: mode,
      modeLabel: MODE_MAP[mode] || mode.toUpperCase()
    },
    roast,
    frequentTeammates: rawStats.frequentTeammates || [],
    pipelineDebug: {
      compressedStats: compressed,
      detectedContradictions: contradictions,
      rankedArchetypes: archetypes.map(a => ({ title: a.title, score: a.score, isContradiction: a.isContradiction })),
      detectedCombos: combos.map(c => ({ title: c.title, score: c.score })),
      selectedTargetTitle: target.title,
      qualityEvaluation: evalResult
    }
  };
}
