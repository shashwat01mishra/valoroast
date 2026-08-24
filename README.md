# Valoroast

Evidence-grounded Valorant behavioral classifier and roast card generator. Feed it a Riot ID and it pulls match history, runs it through a stat-compression → contradiction-detection → archetype-classification pipeline, and spits out a personalized roast card with receipts.

## How it works

- **Frontend**: React (Vite) — search a player, tune intensity/act/mode/style, view the generated roast card, save it to the Wall of Shame.
- **Backend**: Express server that fetches match data from the [HenrikDev Valorant API](https://api.henrikdev.xyz/dashboard/), caches accounts/matches/computed stats in SQLite, and falls back to deterministic mock profiles when there's no API key, the API rate-limits, or a player has no matches.
- **Roast engine** (`server/engine/`): compresses raw stats, detects contradictions (e.g. high headshot % but low win rate), classifies the player into archetypes, detects archetype combos, generates the roast text, and scores it for quality before returning it.

No API key is required to try it — it works out of the box against built-in mock profiles.

## Prerequisites

- Node.js **22.5+** (uses the built-in `node:sqlite` module)
- (Optional) A free [HenrikDev API key](https://api.henrikdev.xyz/dashboard/) for live player data

## Setup

```bash
npm install
cp .env.example .env   # then fill in HENRIK_API_KEY if you have one
npm run dev
```

This runs the Express API on `http://localhost:3001` and the Vite dev server (with `/api` proxied to it) on `http://localhost:3000`.

You can also supply an API key per-session from the UI (stored in `localStorage`, sent as an `x-api-key` header) instead of setting one server-side.

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Run both the API and Vite dev server together |
| `npm run dev:server` | Run only the Express API (`server/index.js`) |
| `npm run dev:client` | Run only the Vite dev server |
| `npm run build` | Production build of the frontend to `dist/` |
| `npm run preview` | Preview the production build |
| `npm test` | Run the roast pipeline sanity check against mock profiles |

In production, `npm run build` then `npm run dev:server` serves the built frontend directly from Express (`server/index.js` serves `dist/` if it exists).

## API

- `GET /api/health` — status, whether an API key is configured
- `GET /api/presets` — list of built-in mock profiles
- `GET /api/roast/:region/:name/:tag` — generate a roast. Query params: `intensity`, `variantSeed`, `act`, `mode` (`competitive` / `unrated` / `tdm` / `deathmatch` / `all`), `style`, `apiKey`
- `GET /api/wall-of-shame` — last 20 saved roast cards
- `POST /api/wall-of-shame` — save a roast card

## Project structure

```
server/
  index.js            Express app & routes
  services/
    henrikApi.js       HenrikDev API client, mock/fallback generation, stat parsing
    db.js               SQLite cache (accounts, matches, computed stats)
  engine/
    pipeline.js         Orchestrates the roast pipeline
    statCompressor.js
    contradictionEngine.js
    archetypeDetector.js
    comboDetector.js
    roastGenerator.js
    qualityEvaluator.js
src/
  App.jsx              Main React app
  components/          Search, roast card, wall of shame, pipeline visualizer, etc.
```

## Notes

- Match/account/stat caching lives in `server/valoroast.db` (SQLite), gitignored.
- Saved Wall of Shame entries live in `server/wallOfShame.json`, gitignored.
