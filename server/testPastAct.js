import { fetchPlayerStats } from './services/henrikApi.js';

async function run() {
  console.log("Fetching past act e8a1 for Leo#DMCG...");
  const stats = await fetchPlayerStats('ap', 'Leo', 'DMCG', null, 'e8a1', 'competitive');
  console.log("Result source:", stats.source);
  console.log("isEstimated:", stats.data.isEstimated);
  console.log("isPartialData:", stats.data.isPartialData);
  console.log("K/D:", stats.data.stats?.kd);
  console.log("WinRate:", stats.data.stats?.winRate);
  console.log("EcoEfficiency:", stats.data.stats?.ecoEfficiency);
  console.log("Match Count:", stats.data.stats?.totalGames);
}

run();
