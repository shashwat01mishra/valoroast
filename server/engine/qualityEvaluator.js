/**
 * QualityEvaluator: Validates candidate roasts for grounding, specificity, originality, and repetition.
 */

export function evaluateRoast(candidateRoast, compressedStats, history = []) {
  let specificityScore = 0;
  let groundingScore = 0;
  let originalityScore = 90;
  let repetitionPenalty = 0;

  // 1. Specificity Check
  const text = `${candidateRoast.summary} ${candidateRoast.mainRoast}`.toLowerCase();
  const hasAgentMention = compressedStats.agent.topAgent && text.includes(compressedStats.agent.topAgent.toLowerCase());
  const hasMapMention = compressedStats.map.lowestWinRateMap && text.includes(compressedStats.map.lowestWinRateMap.name.toLowerCase());
  const hasNumberMention = /\d+/.test(text) || candidateRoast.evidenceBadges.length > 0;

  if (hasNumberMention) specificityScore += 35;
  if (hasAgentMention) specificityScore += 35;
  if (hasMapMention) specificityScore += 30;
  if (candidateRoast.evidenceBadges.length >= 2) specificityScore += 20;

  // Clamp specificity
  specificityScore = Math.min(100, Math.max(50, specificityScore));

  // 2. Evidence Grounding Check
  if (candidateRoast.isCombo) {
    groundingScore = 100;
  } else if (candidateRoast.evidenceBadges.length >= 2 && candidateRoast.isContradiction) {
    groundingScore = 95;
  } else if (candidateRoast.evidenceBadges.length >= 1) {
    groundingScore = 85;
  } else {
    groundingScore = 50;
  }

  // 3. Short Punchline Bonus
  const wordCount = candidateRoast.mainRoast.split(/\s+/).length;
  if (wordCount <= 35) {
    originalityScore += 10;
  }

  // 4. Repetition Check against history
  const candidateKey = `${candidateRoast.archetypeId}_${candidateRoast.summary}`;
  if (history.includes(candidateKey)) {
    repetitionPenalty = 50;
  }

  const finalQualityScore = Math.round(
    (specificityScore * 0.35) +
    (groundingScore * 0.35) +
    (originalityScore * 0.30) -
    repetitionPenalty
  );

  const passed = finalQualityScore >= 60;

  return {
    passed,
    finalQualityScore,
    breakdown: {
      specificityScore,
      groundingScore,
      originalityScore,
      repetitionPenalty
    }
  };
}
