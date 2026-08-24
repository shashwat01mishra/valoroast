import { generateRoast } from './engine/roastGenerator.js';

function runTest() {
  const dummyStats = {
    meta: {
      name: "PlayerOne",
      tag: "TEST",
      matchIds: ["match1", "match2", "match3"],
      act: "e9a2",
      actLabel: "Episode 9 Act 2",
      mode: "competitive",
      modeLabel: "Competitive",
      totalGames: 20,
      winRate: 40
    },
    combat: { kd: 0.7, acs: 180, headshotPct: 15, legshotPct: 35, firstDeathPct: 25 },
    map: { lowestWinRateMap: { name: "Ascent", winRate: 15 } },
    agent: { topAgent: "Jett" },
    economy: {}
  };

  const target = {
    id: "MAP_CURSE",
    title: "Map Curse",
    score: 95
  };

  const roast1 = generateRoast(target, dummyStats, "spicy", 0);
  const roast2 = generateRoast(target, dummyStats, "spicy", 0);
  
  console.log("Roast 1 Main:", roast1.mainRoast);
  console.log("Roast 2 Main:", roast2.mainRoast);
  
  if (roast1.mainRoast === roast2.mainRoast) {
    console.log("✅ Determinism test passed: Same input produces identical roast.");
  } else {
    console.log("❌ Determinism test failed: Outputs differ.");
  }

  // Change player
  const dummyStatsDiffPlayer = JSON.parse(JSON.stringify(dummyStats));
  dummyStatsDiffPlayer.meta.name = "PlayerTwo";
  const roast3 = generateRoast(target, dummyStatsDiffPlayer, "spicy", 0);
  console.log("\nRoast 3 Main (Diff Player):", roast3.mainRoast);
  if (roast1.mainRoast !== roast3.mainRoast) {
    console.log("✅ Variety test passed: Different player produces different roast.");
  } else {
    console.log("⚠️ Warning: Different player produced the exact same variant (1 in 4 chance, so possible).");
  }
}

runTest();
