import { runRoastPipeline } from './engine/pipeline.js';
import { MOCK_PROFILES } from './engine/mockProfiles.js';

console.log("=========================================");
console.log("🔥 TESTING VALOROAST ROAST ENGINE v2.0");
console.log("=========================================\n");

let passedCount = 0;
const profiles = Object.values(MOCK_PROFILES);

profiles.forEach((profile) => {
  console.log(`-----------------------------------------`);
  console.log(`Player: ${profile.name}#${profile.tag} (${profile.rank})`);
  
  const result = runRoastPipeline(profile, { intensity: 'spicy', variantSeed: 0 });
  const { roast, pipelineDebug } = result;

  console.log(`Target: ${pipelineDebug.selectedTargetTitle}`);
  console.log(`Title: ${roast.roastTitle}`);
  console.log(`Summary: "${roast.summary}"`);
  console.log(`Main Roast: "${roast.mainRoast}"`);
  console.log(`Verdict: ${roast.verdict}`);
  console.log(`Quality Score: ${pipelineDebug.qualityEvaluation.finalQualityScore}/100`);
  console.log(`Badges: ${roast.evidenceBadges.map(b => `${b.metric}: ${b.value}`).join(' | ')}`);
  
  if (pipelineDebug.qualityEvaluation.passed) {
    passedCount++;
  } else {
    console.warn("⚠️ QUALITY CHECK FAILED!");
  }
  console.log("");
});

console.log(`=========================================`);
console.log(`Results: ${passedCount}/${profiles.length} profiles passed pipeline quality check.`);
console.log(`=========================================`);
