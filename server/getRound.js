import { DatabaseSync } from 'node:sqlite';

const db = new DatabaseSync('./valoroast.db');
const row = db.prepare('SELECT stats_json FROM player_stats_cache LIMIT 1').get();
if (row) {
  const stats = JSON.parse(row.stats_json);
  console.log("Stats schema:", Object.keys(stats));
  console.log("Economy:", Object.keys(stats.economy || {}));
} else {
  console.log("No data");
}
