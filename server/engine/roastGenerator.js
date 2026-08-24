import { transformRoastByStyle, ROAST_STYLES } from './roastStyles.js';
import { getPlayerHash } from '../services/henrikApi.js';

/**
 * RoastGenerator: Generates dynamic, evidence-grounded roasts where every single Act
 * delivers a 100% unique Summary, Main Roast narrative, and Verdict grounded in that Act's specific stats.
 */

const BESPOKE_ACT_ROASTS = {
  // ==================== MAP CURSE ====================
  MAP_CURSE: {
    e9a2: (s) => ({
      summary: `Every map is playable. Somehow ${s.map.lowestWinRateMap.name} is a designated health hazard.`,
      main: `In Episode 9 Act 2, he logged ${s.meta.totalGames} matches with an overall ${s.meta.winRate}% win rate, but loading into ${s.map.lowestWinRateMap.name} collapsed his performance to a tragic ${s.map.lowestWinRateMap.winRate}%. His team is essentially playing a 4v5 before round 1 even begins because the loading screen alone causes instant tactical paralysis.`,
      verdict: `Verdict: Permanent Queue Dodge on ${s.map.lowestWinRateMap.name} (Episode 9 Act 2).`
    }),
    e9a1: (s) => ({
      summary: `${s.map.lowestWinRateMap.name} was his personal psychological horror movie during Episode 9 Act 1.`,
      main: `Across ${s.meta.totalGames} matches in Episode 9 Act 1, he couldn't break a ${s.map.lowestWinRateMap.winRate}% win rate on ${s.map.lowestWinRateMap.name} despite pulling a ${s.combat.kd} K/D overall. The map geometry simply rejects his playstyle on a spiritual level, turning every retake into a guaranteed round donation.`,
      verdict: `Verdict: Mandatory Therapy for ${s.map.lowestWinRateMap.name} Trauma (Episode 9 Act 1).`
    }),
    e8a3: (s, mode = 'competitive') => ({
      summary: `Episode 8 Act 3 records show ${s.map.lowestWinRateMap.name} was an automatic ${mode === 'competitive' ? 'RR' : 'match'} tax on his squad.`,
      main: `During Episode 8 Act 3, he suffered through ${s.meta.totalGames} games with a brutal ${s.meta.winRate}% win rate. On ${s.map.lowestWinRateMap.name} specifically (${s.map.lowestWinRateMap.winRate}% WR), enemy teams treated his site holds like an open-door walkthrough attraction while he recorded ${s.combat.firstDeathPct}% first deaths.`,
      verdict: `Verdict: Emergency Evacuation from ${s.map.lowestWinRateMap.name} (Episode 8 Act 3).`
    }),
    e8a2: (s) => ({
      summary: `The Episode 8 Act 2 paradox: looked formidable on ${s.map.highestWinRateMap?.name || 'Haven'}, completely folded on ${s.map.lowestWinRateMap.name}.`,
      main: `He peaked with a ${s.meta.winRate}% win rate and ${s.combat.kd} K/D during Episode 8 Act 2, but the exact second ${s.map.lowestWinRateMap.name} popped in agent select (${s.map.lowestWinRateMap.winRate}% WR), all mechanical competence vanished. The ${s.map.mapDelta}% win rate disparity between his best and worst map is a documented cry for help.`,
      verdict: `Verdict: One-Map Wonder of Episode 8 Act 2.`
    }),
    e8a1: (s) => ({
      summary: `Episode 8 Act 1 is the historical origin of his feud with ${s.map.lowestWinRateMap.name}.`,
      main: `Back in Episode 8 Act 1 across ${s.meta.totalGames} painful matches, he produced a miserable ${s.combat.kd} K/D and ${s.meta.winRate}% win rate, heavily anchored down by a ${s.map.lowestWinRateMap.winRate}% disaster on ${s.map.lowestWinRateMap.name}. This is not a temporary slump; this is a multi-season structural allergy to map layout.`,
      verdict: `Verdict: Patient Zero of the ${s.map.lowestWinRateMap.name} Curse (Episode 8 Act 1).`
    }),
    all: (s, mode = 'competitive') => ({
      summary: `Across ${s.meta.totalGames} lifetime matches, ${s.map.lowestWinRateMap.name} remains his eternal kryptonite.`,
      main: `In his entire career spanning ${s.meta.totalGames} matches, he holds a ${s.combat.kd} K/D and ${s.meta.winRate}% win rate—except on ${s.map.lowestWinRateMap.name}, where his win rate drops to ${s.map.lowestWinRateMap.winRate}%. Over hundreds of rounds, deleting this single map file from his PC ${mode === 'competitive' ? 'would instantly net him +200 RR' : 'would instantly double his match win rate'}.`,
      verdict: `Verdict: Lifetime Structural Ban on ${s.map.lowestWinRateMap.name} (All-Time Career).`
    })
  },

  // ==================== LEGSHOT SPECIALIST / COMBO ====================
  COMBO_LEGSHOT_HEADSHOT: {
    e9a2: (s) => ({
      summary: `Episode 9 Act 2: Aiming so low he is inspecting the floor tiling on site.`,
      main: `In Episode 9 Act 2 across ${s.meta.totalGames} games, ${s.combat.legshotPct}% of his hits landed strictly on enemy legs compared to just ${s.combat.headshotPct}% on the head. In a tactical shooter engineered for 1-tap headshots, his crosshair is legally mandated to stay at shin height, ensuring enemy duelists leave every gunfight with healthy armor and bruised ankles.`,
      verdict: `Verdict: Lower-Body Orthopedic Specialist (Episode 9 Act 2).`
    }),
    e9a1: (s) => ({
      summary: `Episode 9 Act 1: A fresh season where he discovered hitting knees is a lifestyle choice.`,
      main: `Throughout ${s.meta.totalGames} matches in Episode 9 Act 1, he delivered a ${s.combat.kd} K/D with ${s.combat.legshotPct}% legshot accuracy. While opponents practiced crosshair placement at head level, he was busy breaking shins and donating rifle trades. Groundworms across AP lobbies were constantly filing for air support.`,
      verdict: `Verdict: Certified Shin Destroyer (Episode 9 Act 1).`
    }),
    e8a3: (s) => ({
      summary: `Episode 8 Act 3 audit: ${s.combat.legshotPct}% legshots, ${s.combat.kd} K/D, zero intention of aiming up.`,
      main: `Episode 8 Act 3 data shows ${s.meta.totalGames} games of dedicated anti-headshot gameplay. With ${s.combat.legshotPct}% legshots and a ${s.meta.winRate}% win rate, every Vandal spray was an artistic tribute to gravity. Enemy armor stayed at 50/50 durability while his teammates watched him lose 1v1s from floor-level recoil.`,
      verdict: `Verdict: Gravity's Favorite Rifleman (Episode 8 Act 3).`
    }),
    e8a2: (s) => ({
      summary: `In Episode 8 Act 2 his crosshair was permanently buried underground.`,
      main: `Episode 8 Act 2 stats: ${s.combat.legshotPct}% legshots, ${s.combat.headshotPct}% headshots across ${s.meta.totalGames} games with a ${s.combat.kd} K/D. He treated high-caliber weapons like low-powered metal detectors. His teammates called for headshots; he responded with surgical kneecap precision.`,
      verdict: `Verdict: Underground Crosshair Explorer (Episode 8 Act 2).`
    }),
    e8a1: (s) => ({
      summary: `Episode 8 Act 1: The founding season of his chronic fear of enemy heads.`,
      main: `Episode 8 Act 1 established the baseline: ${s.meta.totalGames} matches, ${s.combat.kd} K/D, and an astounding ${s.combat.legshotPct}% legshot rate. Whatever crosshair placement guides Riot published that season, he actively avoided every single one.`,
      verdict: `Verdict: Founding Father of Ankle Aim (Episode 8 Act 1).`
    }),
    all: (s) => ({
      summary: `Career record across ${s.meta.totalGames} games: The floor has received more bullets than any enemy skull.`,
      main: `Across ${s.meta.totalGames} lifetime matches spanning multiple episodes, his career stats sit at ${s.combat.legshotPct}% legshots, ${s.combat.headshotPct}% headshots, and a ${s.combat.kd} K/D. Every single act reset brings new hope, and every single act his crosshair snaps back to shoe height.`,
      verdict: `Verdict: Lifetime Ankle Surgeon (All-Time Career).`
    })
  },

  LEGSHOT_SPECIALIST: {
    e9a2: (s) => ({
      summary: `Episode 9 Act 2: ${s.combat.legshotPct}% legshot rate. He plays Valorant like a bowling simulator.`,
      main: `In Episode 9 Act 2, ${s.combat.legshotPct}% of all registered bullet impacts were below the waist across ${s.meta.totalGames} games. While his team begged for entry frags, he was busy inspecting enemy footwear with a Phantom.`,
      verdict: `Verdict: Shoe Inspector General (Episode 9 Act 2).`
    }),
    e9a1: (s) => ({
      summary: `Episode 9 Act 1: New act, same dedicated refusal to click heads.`,
      main: `Episode 9 Act 1 data: ${s.combat.legshotPct}% legshot, ${s.combat.headshotPct}% headshot across ${s.meta.totalGames} games. He proves you don't need headshots to participate—you just need infinite patience from your 4 teammates.`,
      verdict: `Verdict: Low-Angle Operator (Episode 9 Act 1).`
    }),
    e8a3: (s) => ({
      summary: `Episode 8 Act 3: ${s.combat.legshotPct}% legshots turned competitive lobbies into ankle rehab clinics.`,
      main: `In Episode 8 Act 3, he logged ${s.meta.totalGames} games with a ${s.combat.kd} K/D. Hitting ${s.combat.legshotPct}% legshots in a game with 160-damage headshot Vandals is a conscious rebellion against modern game design.`,
      verdict: `Verdict: Anatomical Anomaly (Episode 8 Act 3).`
    }),
    e8a2: (s) => ({
      summary: `Episode 8 Act 2: ${s.meta.winRate}% win rate driven by chronic floor-level crosshairs.`,
      main: `Episode 8 Act 2 saw him average ${s.combat.legshotPct}% legshots across ${s.meta.totalGames} matches. His crosshair placement is so stubborn that even when enemies crouch, he still somehow manages to hit them in the shins.`,
      verdict: `Verdict: Knee-High Marksman (Episode 8 Act 2).`
    }),
    e8a1: (s) => ({
      summary: `Episode 8 Act 1: Where the ankle-aim dynasty began.`,
      main: `Across ${s.meta.totalGames} games in Episode 8 Act 1, he recorded ${s.combat.legshotPct}% legshots and a ${s.combat.kd} K/D. The enemy duelists have never feared for their head armor when peeking his angles.`,
      verdict: `Verdict: Toe-Tag Enthusiast (Episode 8 Act 1).`
    }),
    all: (s) => ({
      summary: `All-Time: ${s.meta.totalGames} games of unbroken commitment to low-angle fire.`,
      main: `Throughout his entire career of ${s.meta.totalGames} matches, ${s.combat.legshotPct}% of his hits have landed on legs. He is the only player in the region whose crosshair requires a subterranean mining permit.`,
      verdict: `Verdict: Floor-Bound Legend (All-Time Career).`
    })
  },

  // ==================== STAT MIRAGE / K-D FRAUD ====================
  COMBO_STAT_MIRAGE: {
    e9a2: (s, mode = 'competitive') => ({
      summary: `Episode 9 Act 2: High K/D (${s.combat.kd}), low win rate (${s.meta.winRate}%). ${mode === 'competitive' ? "He doesn't lose RR, he redistributes it." : "He doesn't lose duels, he donates match wins."}`,
      main: `In Episode 9 Act 2, he maintained a ${s.combat.kd} K/D across ${s.meta.totalGames} games, but his ${s.meta.winRate}% win rate exposes the scam. He isn't winning rounds—he's farming 3 non-impact exit kills while saving his rifle in 1v5 situations after the spike has already detonated.`,
      verdict: `Verdict: Certified Exit-Frag Farmer (Episode 9 Act 2).`
    }),
    e9a1: (s) => ({
      summary: `Episode 9 Act 1: Scoreboard hero, round zero. A masterclass in cosmetic stats.`,
      main: `Throughout Episode 9 Act 1, he posted a ${s.combat.kd} K/D and ${s.combat.acs} ACS across ${s.meta.totalGames} matches while losing ${100 - s.meta.winRate}% of his games. Screenshots his 22 kills on Discord after losing 3-13, omitting that all 22 kills occurred when the round was already impossible to win.`,
      verdict: `Verdict: Baiter General of the Lobby (Episode 9 Act 1).`
    }),
    e8a3: (s) => ({
      summary: `Episode 8 Act 3: Highest K/D on the team, lowest contribution to actual victory.`,
      main: `In Episode 8 Act 3, his ${s.combat.kd} K/D and ${s.meta.winRate}% win rate across ${s.meta.totalGames} matches created a statistical illusion of competence. His teammates pushed site and traded lives; he stayed in spawn baiting until it was time to collect exit frags.`,
      verdict: `Verdict: Scoreboard Impostor (Episode 8 Act 3).`
    }),
    e8a2: (s, mode = 'competitive') => ({
      summary: `Episode 8 Act 2: The season where his K/D climbed while his team's ${mode === 'competitive' ? 'RR' : 'win rate'} plummeted.`,
      main: `Episode 8 Act 2 records show ${s.meta.totalGames} matches with a ${s.combat.kd} K/D but only a ${s.meta.winRate}% win rate. He plays Valorant like a single-player survival game where winning the round is strictly optional.`,
      verdict: `Verdict: Lone Wolf Liability (Episode 8 Act 2).`
    }),
    e8a1: (s) => ({
      summary: `Episode 8 Act 1: The birth of the K/D mirage.`,
      main: `Back in Episode 8 Act 1, ${s.meta.totalGames} matches established the pattern: a clean ${s.combat.kd} K/D on the match summary masking a disastrous ${s.meta.winRate}% win rate. Great for your profile screenshot, catastrophic for your duo partner.`,
      verdict: `Verdict: KD Mirage Pioneer (Episode 8 Act 1).`
    }),
    all: (s) => ({
      summary: `Career Summary: ${s.meta.totalGames} matches of looking dangerous on paper and harmless on site.`,
      main: `Across ${s.meta.totalGames} career games, he holds a ${s.combat.kd} K/D and a ${s.meta.winRate}% win rate. Season after season, act after act, he collects kills that have zero causal relationship with winning the match.`,
      verdict: `Verdict: Lifetime Scoreboard Mirage (All-Time Career).`
    })
  },

  STATISTICAL_MIRAGE: {
    e9a2: (s) => ({
      summary: `Episode 9 Act 2: ${s.combat.kd} K/D with ${s.meta.winRate}% win rate. The math is not adding up.`,
      main: `In Episode 9 Act 2, he collected kills across ${s.meta.totalGames} games without ever contributing to defusing or planting a single spike. A pristine K/D that does nothing except protect his own ego.`,
      verdict: `Verdict: Exit Frag Connoisseur (Episode 9 Act 2).`
    }),
    e9a1: (s, mode = 'competitive') => ({
      summary: `Episode 9 Act 1: Beautiful stats, zero round conversions.`,
      main: `Episode 9 Act 1 saw him log ${s.meta.totalGames} games with ${s.combat.kd} K/D and ${s.meta.winRate}% win rate. ${mode === 'competitive' ? 'If exit kills awarded RR, he would be Radiant.' : 'If exit kills counted toward victory, he would be a champion.'} Unfortunately, rounds still require site control.`,
      verdict: `Verdict: Mirage Master (Episode 9 Act 1).`
    }),
    e8a3: (s) => ({
      summary: `Episode 8 Act 3: ${s.meta.totalGames} matches of baiting teammates for personal K/D security.`,
      main: `In Episode 8 Act 3, his ${s.combat.kd} K/D stood in stark contrast to his ${s.meta.winRate}% win rate. He survives until the last 10 seconds of every round with full HP and zero utility used.`,
      verdict: `Verdict: Post-Round Farmer (Episode 8 Act 3).`
    }),
    e8a2: (s) => ({
      summary: `Episode 8 Act 2: High damage, zero clutch, total scoreboard mirage.`,
      main: `During Episode 8 Act 2 across ${s.meta.totalGames} matches, he maintained ${s.combat.kd} K/D and ${s.combat.acs} ACS while losing ${100 - s.meta.winRate}% of rounds. A textbook display of non-impact frags.`,
      verdict: `Verdict: Hollow Stat Collector (Episode 8 Act 2).`
    }),
    e8a1: (s) => ({
      summary: `Episode 8 Act 1: The original blueprint of cosmetic K/D.`,
      main: `Episode 8 Act 1 data: ${s.meta.totalGames} games, ${s.combat.kd} K/D, ${s.meta.winRate}% win rate. The kills look real until you watch the round replay and realize the spike was already half-defused.`,
      verdict: `Verdict: Cosmetic Fragger (Episode 8 Act 1).`
    }),
    all: (s) => ({
      summary: `All-Time Record: ${s.meta.totalGames} games, ${s.combat.kd} K/D, and an army of disappointed duo partners.`,
      main: `Across his entire career spanning ${s.meta.totalGames} games, his ${s.combat.kd} K/D remains disconnected from round outcomes (${s.meta.winRate}% WR). An eternal illusion of carry potential.`,
      verdict: `Verdict: Career K/D Illusionist (All-Time Career).`
    })
  },

  // ==================== ONE-TRICK / AGENT FRAUD ====================
  COMBO_ONETRICK_FRAUD: {
    e9a2: (s) => ({
      summary: `Episode 9 Act 2: Instalocks ${s.agent.topAgent} in 0.1s. Plays like it's his first install.`,
      main: `In Episode 9 Act 2, he locked ${s.agent.topAgent} in ${s.agent.topAgentShare}% of his ${s.meta.totalGames} games, returning a ${s.agent.topAgentKd} K/D and ${s.meta.winRate}% win rate. New agents arrived on the roster; he ignored all of them to master mediocrity on his main.`,
      verdict: `Verdict: Instalock Liability on ${s.agent.topAgent} (Episode 9 Act 2).`
    }),
    e9a1: (s) => ({
      summary: `Episode 9 Act 1: Dedicated to ${s.agent.topAgent}, still searching for actual utility impact.`,
      main: `Across ${s.meta.totalGames} games in Episode 9 Act 1, ${s.agent.topAgentShare}% of his agent select screens ended with an immediate lock on ${s.agent.topAgent}. With a ${s.agent.topAgentKd} K/D to show for it, his teammates are begging him to let someone else touch the agent.`,
      verdict: `Verdict: One-Trick Impostor (Episode 9 Act 1).`
    }),
    e8a3: (s) => ({
      summary: `Episode 8 Act 3: ${s.agent.topAgent} was meta. He still found a way to underperform it.`,
      main: `During Episode 8 Act 3, Riot buffed utility, and he celebrated by playing ${s.agent.topAgent} in ${s.agent.topAgentShare}% of ${s.meta.totalGames} games while outputting a ${s.agent.topAgentKd} K/D. The agent kit was strong; the pilot was not.`,
      verdict: `Verdict: Agency Revoked on ${s.agent.topAgent} (Episode 8 Act 3).`
    }),
    e8a2: (s) => ({
      summary: `Episode 8 Act 2: 300 hours on ${s.agent.topAgent}, less site presence than a decoy clone.`,
      main: `Episode 8 Act 2 data: ${s.agent.topAgentShare}% pick rate on ${s.agent.topAgent} across ${s.meta.totalGames} matches. He flashes his own squad, misplaces utility, and finishes with a ${s.agent.topAgentKd} K/D.`,
      verdict: `Verdict: Tactical Restraining Order from ${s.agent.topAgent} (Episode 8 Act 2).`
    }),
    e8a1: (s) => ({
      summary: `Episode 8 Act 1: The genesis of his one-trick delusion.`,
      main: `Back in Episode 8 Act 1, ${s.meta.totalGames} matches started the cycle: locking ${s.agent.topAgent} ${s.agent.topAgentShare}% of the time and delivering ${s.agent.topAgentKd} K/D. Years later, nothing has improved.`,
      verdict: `Verdict: Chronic One-Trick (Episode 8 Act 1).`
    }),
    all: (s) => ({
      summary: `Career Total: ${s.meta.totalGames} games, ${s.agent.uniqueAgentsCount} total agents touched. Peak refusal to adapt.`,
      main: `Across his entire career spanning ${s.meta.totalGames} matches, he locked ${s.agent.topAgent} in ${s.agent.topAgentShare}% of all games. He has mastered one agent and zero winning habits (${s.agent.topAgentKd} K/D, ${s.meta.winRate}% WR).`,
      verdict: `Verdict: Lifetime Agent Fraud (All-Time Career).`
    })
  },

  FAKE_SPECIALIST: {
    e9a2: (s) => ({
      summary: `Episode 9 Act 2: ${s.agent.topAgent} main with zero impact on round outcomes.`,
      main: `In Episode 9 Act 2, ${s.agent.topAgentShare}% of his ${s.meta.totalGames} matches were on ${s.agent.topAgent}. With a ${s.agent.topAgentKd} K/D, he plays his main agent like a tourist holding a rental camera.`,
      verdict: `Verdict: Rental Pilot on ${s.agent.topAgent} (Episode 9 Act 2).`
    }),
    e9a1: (s) => ({
      summary: `Episode 9 Act 1: Locking ${s.agent.topAgent} with the confidence of a Radiant and the output of an Iron.`,
      main: `Episode 9 Act 1 saw ${s.meta.totalGames} games with ${s.agent.topAgentShare}% on ${s.agent.topAgent}. Delivering ${s.agent.topAgentKd} K/D proves that high hours do not equal high competence.`,
      verdict: `Verdict: Specialist in Name Only (Episode 9 Act 1).`
    }),
    e8a3: (s) => ({
      summary: `Episode 8 Act 3: ${s.agent.topAgentShare}% pick rate on ${s.agent.topAgent}. Time to fill.`,
      main: `Throughout Episode 8 Act 3 across ${s.meta.totalGames} games, he hoarded ${s.agent.topAgent} and produced a ${s.agent.topAgentKd} K/D. His team's smoke and initiator players deserved better.`,
      verdict: `Verdict: Slot Hog (Episode 8 Act 3).`
    }),
    e8a2: (s) => ({
      summary: `Episode 8 Act 2: Hundreds of matches on ${s.agent.topAgent}, zero progress.`,
      main: `In Episode 8 Act 2, ${s.agent.topAgent} in ${s.agent.topAgentShare}% of matches yielded ${s.agent.topAgentKd} K/D and ${s.meta.winRate}% win rate. True mastery would show on the scoreboard.`,
      verdict: `Verdict: False Master (Episode 8 Act 2).`
    }),
    e8a1: (s) => ({
      summary: `Episode 8 Act 1: The earliest documented evidence of his ${s.agent.topAgent} addiction.`,
      main: `Episode 8 Act 1 records: ${s.meta.totalGames} games, ${s.agent.topAgentShare}% on ${s.agent.topAgent}, ${s.agent.topAgentKd} K/D. The addiction started early and yielded nothing.`,
      verdict: `Verdict: Agent Addict (Episode 8 Act 1).`
    }),
    all: (s) => ({
      summary: `All-Time: Hundreds of matches on ${s.agent.topAgent}. The agent should request a trade.`,
      main: `Across ${s.meta.totalGames} games, ${s.agent.topAgentShare}% on ${s.agent.topAgent} produced a flat ${s.agent.topAgentKd} K/D. An entire career dedicated to one agent without ever unlocking their potential.`,
      verdict: `Verdict: Permanent Specialist Fraud (All-Time Career).`
    })
  },

  // ==================== DEFAULT / DERANK / OTHERS ====================
  DERANK_CONSULTANT: {
    e9a2: (s, mode = 'competitive') => {
      if (mode === 'unrated') {
        return {
          summary: `Episode 9 Act 2: Queuing with him turns casual unrated into a 40-minute hostage crisis.`,
          main: `In Episode 9 Act 2 across ${s.meta.totalGames} unrated games, he produced a ${s.combat.kd} K/D and ${s.meta.winRate}% win rate. Refuses every surrender vote while contributing zero site impact.`,
          verdict: `Verdict: Certified Lobby Hostage Taker (Episode 9 Act 2).`
        };
      }
      if (mode === 'tdm') {
        return {
          summary: `Episode 9 Act 2: A dedicated weapon delivery system for the opposing team in TDM.`,
          main: `In Episode 9 Act 2 across ${s.meta.totalGames} TDM matches, his ${s.combat.kd} K/D and ${s.combat.firstDeathPct}% first deaths meant he was respawning directly into enemy crosshairs.`,
          verdict: `Verdict: Official Enemy Weapon Supplier (Episode 9 Act 2).`
        };
      }
      if (mode === 'deathmatch') {
        return {
          summary: `Episode 9 Act 2: Enters Deathmatch to warm up, leaves with colder hands and bruised pride.`,
          main: `In Episode 9 Act 2 across ${s.meta.totalGames} Deathmatches, holding corners with an Operator still yielded a ${s.combat.kd} K/D. The warmup was essentially a firing range where he was the target.`,
          verdict: `Verdict: Target Dummy Champion (Episode 9 Act 2).`
        };
      }
      if (mode === 'all') {
        return {
          summary: `Episode 9 Act 2: A universal liability across every queue in the game client.`,
          main: `In Episode 9 Act 2 across ${s.meta.totalGames} games in all modes, his ${s.combat.kd} K/D and ${s.meta.winRate}% win rate proved that no game mode is safe from his unique brand of chaos.`,
          verdict: `Verdict: Universal Lobby Hazard (Episode 9 Act 2).`
        };
      }
      return {
        summary: `Episode 9 Act 2: Queuing with him is a free RR giveaway for the enemy team.`,
        main: `In Episode 9 Act 2 across ${s.meta.totalGames} matches, he produced a ${s.combat.kd} K/D and ${s.meta.winRate}% win rate. Every lobby he joined started with a 5v6 handicap before the buy phase even ended.`,
        verdict: `Verdict: Certified Derank Consultant (Episode 9 Act 2).`
      };
    },
    e9a1: (s, mode = 'competitive') => {
      if (mode === 'unrated') {
        return {
          summary: `Episode 9 Act 1: The casual lobby hostage taker who refuses to press F5.`,
          main: `Episode 9 Act 1 unrated records: ${s.meta.totalGames} games, ${s.meta.winRate}% win rate, ${s.combat.kd} K/D. Traps 4 strangers in 45-minute blowouts with zero site presence.`,
          verdict: `Verdict: Casual Match Extender (Episode 9 Act 1).`
        };
      }
      if (mode === 'tdm') {
        return {
          summary: `Episode 9 Act 1: Ability orb hoarder who misses every single ultimate in TDM.`,
          main: `Episode 9 Act 1 TDM stats: ${s.meta.totalGames} matches, ${s.combat.kd} K/D, dying 4 times every minute in a mode where weapons are free.`,
          verdict: `Verdict: Free Kill Feeder (Episode 9 Act 1).`
        };
      }
      if (mode === 'deathmatch') {
        return {
          summary: `Episode 9 Act 1: Sound-whoring steps in Deathmatch and still dying from behind.`,
          main: `Episode 9 Act 1 DM data: ${s.meta.totalGames} matches, ${s.combat.kd} K/D, spawning into crosshairs for 8 consecutive minutes.`,
          verdict: `Verdict: Spawncamper Victim (Episode 9 Act 1).`
        };
      }
      if (mode === 'all') {
        return {
          summary: `Episode 9 Act 1: Negative momentum across competitive, unrated, and warmups alike.`,
          main: `Episode 9 Act 1 cross-mode data: ${s.meta.totalGames} games, ${s.meta.winRate}% win rate, ${s.combat.kd} K/D. His duo partners have all quietly set their Discord status to invisible.`,
          verdict: `Verdict: Cross-Mode Quarantined (Episode 9 Act 1).`
        };
      }
      return {
        summary: `Episode 9 Act 1: The human embodiment of negative lobby momentum.`,
        main: `Episode 9 Act 1 data: ${s.meta.totalGames} games, ${s.meta.winRate}% win rate, ${s.combat.kd} K/D. His duo partners have all quietly set their Discord status to invisible.`,
        verdict: `Verdict: Solo Queue Quarantined (Episode 9 Act 1).`
      };
    },
    e8a3: (s, mode = 'competitive') => {
      if (mode === 'unrated') {
        return {
          summary: `Episode 8 Act 3: Wasting teammates' evenings one unrated game at a time.`,
          main: `In Episode 8 Act 3, ${s.meta.totalGames} unrated matches yielded a ${s.meta.winRate}% win rate. Sweats like a tournament final against beginners and still loses.`,
          verdict: `Verdict: Casual Match Ruiner (Episode 8 Act 3).`
        };
      }
      if (mode === 'tdm') {
        return {
          summary: `Episode 8 Act 3: Rapid-fire respawn donations in Team Deathmatch.`,
          main: `In Episode 8 Act 3 TDM, ${s.meta.totalGames} games yielded ${s.combat.firstDeathPct}% opening deaths. The enemy team hit 100 kills exclusively off his lane.`,
          verdict: `Verdict: Enemy Scoreboard Booster (Episode 8 Act 3).`
        };
      }
      if (mode === 'deathmatch') {
        return {
          summary: `Episode 8 Act 3: Audio-whoring warmup corners like it's a VCT trophy match.`,
          main: `In Episode 8 Act 3 Deathmatch, ${s.meta.totalGames} warmups produced ${s.combat.kd} K/D. Practicing crosshairs on thin air while finishing 11th place.`,
          verdict: `Verdict: Warmup Saboteur (Episode 8 Act 3).`
        };
      }
      if (mode === 'all') {
        return {
          summary: `Episode 8 Act 3: A reliable opponent sponsor across all playlists.`,
          main: `In Episode 8 Act 3, ${s.meta.totalGames} matches yielded a ${s.meta.winRate}% win rate and ${s.combat.firstDeathPct}% first deaths. Enemy teams send him friend requests to stay in his queue bracket.`,
          verdict: `Verdict: Universal Opponent Sponsor (Episode 8 Act 3).`
        };
      }
      return {
        summary: `Episode 8 Act 3: A reliable teammate... strictly for the other team.`,
        main: `In Episode 8 Act 3, ${s.meta.totalGames} matches yielded a ${s.meta.winRate}% win rate and ${s.combat.firstDeathPct}% first deaths. Enemy teams send him friend requests to stay in his queue bracket.`,
        verdict: `Verdict: Enemy Team Sponsor (Episode 8 Act 3).`
      };
    },
    e8a2: (s, mode = 'competitive') => {
      if (mode === 'unrated') {
        return {
          summary: `Episode 8 Act 2: A guaranteed 40-minute loss in casual matchmaking.`,
          main: `Throughout Episode 8 Act 2 unrated games, ${s.meta.totalGames} matches produced a ${s.meta.winRate}% win rate and ${s.combat.kd} K/D. A steady, predictable slide down casual matchmaking.`,
          verdict: `Verdict: Unrated Defeat Architect (Episode 8 Act 2).`
        };
      }
      if (mode === 'tdm') {
        return {
          summary: `Episode 8 Act 2: Bleeding lives in TDM faster than the match timer.`,
          main: `Throughout Episode 8 Act 2 TDM, ${s.meta.totalGames} matches logged with ${s.combat.kd} K/D and ${s.meta.winRate}% win rate. Donating free kills round after round.`,
          verdict: `Verdict: Respawn Speedrunner (Episode 8 Act 2).`
        };
      }
      if (mode === 'deathmatch') {
        return {
          summary: `Episode 8 Act 2: Zero mechanical improvement across dozens of Deathmatches.`,
          main: `Episode 8 Act 2 DM stats: ${s.meta.totalGames} matches, ${s.combat.kd} K/D. Enters to fix aim, leaves with worse habits.`,
          verdict: `Verdict: Aim Deterioration Specialist (Episode 8 Act 2).`
        };
      }
      if (mode === 'all') {
        return {
          summary: `Episode 8 Act 2: Consistent match defeat across every mode in the game.`,
          main: `Throughout Episode 8 Act 2, ${s.meta.totalGames} games were logged with a ${s.meta.winRate}% win rate and ${s.combat.kd} K/D. A steady, predictable slide in all lobbies.`,
          verdict: `Verdict: Multi-Mode Match Loser (Episode 8 Act 2).`
        };
      }
      return {
        summary: `Episode 8 Act 2: Demotion had a mascot, and it was his match history.`,
        main: `Throughout Episode 8 Act 2, ${s.meta.totalGames} games were logged with a ${s.meta.winRate}% win rate and ${s.combat.kd} K/D. A steady, predictable slide down the competitive ladder.`,
        verdict: `Verdict: Downward Mobility Specialist (Episode 8 Act 2).`
      };
    },
    e8a1: (s, mode = 'competitive') => {
      if (mode === 'unrated') {
        return {
          summary: `Episode 8 Act 1: Where the casual match throwing began.`,
          main: `Episode 8 Act 1 unrated baseline: ${s.meta.totalGames} games, ${s.meta.winRate}% win rate, ${s.combat.kd} K/D. The beginning of a long career in ruining casual lobbies.`,
          verdict: `Verdict: Founder of the Unrated Syndicate (Episode 8 Act 1).`
        };
      }
      if (mode === 'tdm') {
        return {
          summary: `Episode 8 Act 1: The original TDM kill donor.`,
          main: `Episode 8 Act 1 TDM baseline: ${s.meta.totalGames} matches, ${s.meta.winRate}% win rate, donating duels in record time.`,
          verdict: `Verdict: TDM Feed Pioneer (Episode 8 Act 1).`
        };
      }
      if (mode === 'deathmatch') {
        return {
          summary: `Episode 8 Act 1: The beginning of the Deathmatch struggle.`,
          main: `Episode 8 Act 1 DM baseline: ${s.meta.totalGames} games, ${s.combat.kd} K/D, consistently bottom-fragging the warmup lobby.`,
          verdict: `Verdict: DM Practice Dummy (Episode 8 Act 1).`
        };
      }
      if (mode === 'all') {
        return {
          summary: `Episode 8 Act 1: The historical origin of his multi-mode throwing.`,
          main: `Episode 8 Act 1 baseline: ${s.meta.totalGames} games, ${s.meta.winRate}% win rate, ${s.combat.kd} K/D. The beginning of a long career in losing close games in dramatic fashion.`,
          verdict: `Verdict: Founder of the Defeat Syndicate (Episode 8 Act 1).`
        };
      }
      return {
        summary: `Episode 8 Act 1: Where the great RR redistribution began.`,
        main: `Episode 8 Act 1 baseline: ${s.meta.totalGames} games, ${s.meta.winRate}% win rate, ${s.combat.kd} K/D. The beginning of a long career in losing close games in dramatic fashion.`,
        verdict: `Verdict: Founder of the Derank Syndicate (Episode 8 Act 1).`
      };
    },
    all: (s, mode = 'competitive') => {
      if (mode === 'unrated') {
        return {
          summary: `Career Summary: ${s.meta.totalGames} unrated matches of guaranteed team suffering.`,
          main: `Across ${s.meta.totalGames} total career unrated games, his ${s.meta.winRate}% win rate and ${s.combat.kd} K/D prove no casual lobby is safe from his 40-minute hostage situations.`,
          verdict: `Verdict: Lifetime Casual Hostage Ambassador (All-Time Career).`
        };
      }
      if (mode === 'tdm') {
        return {
          summary: `Career Summary: Thousands of rapid respawns and zero duels won in TDM.`,
          main: `Across ${s.meta.totalGames} career TDM matches, his ${s.meta.winRate}% win rate and ${s.combat.kd} K/D prove that even with infinite free guns, he is completely outmatched.`,
          verdict: `Verdict: Lifetime TDM Scoreboard Sponsor (All-Time Career).`
        };
      }
      if (mode === 'deathmatch') {
        return {
          summary: `All-Time: Hundreds of Deathmatches with zero crosshair progress.`,
          main: `Across ${s.meta.totalGames} career Deathmatches, holding corners with an Operator has produced a flat ${s.combat.kd} K/D. The ultimate stationary target.`,
          verdict: `Verdict: Lifetime Firing Range Bot (All-Time Career).`
        };
      }
      if (mode === 'all') {
        return {
          summary: `Career Summary: ${s.meta.totalGames} games of consistent lobby disruption across all modes.`,
          main: `Across ${s.meta.totalGames} total career games in all modes, his ${s.meta.winRate}% win rate and ${s.combat.kd} K/D prove that no game mode is safe from his gravitational pull toward defeat.`,
          verdict: `Verdict: Lifetime Lobby Hazard (All-Time Career).`
        };
      }
      return {
        summary: `Career Summary: ${s.meta.totalGames} games of consistent RR donation.`,
        main: `Across ${s.meta.totalGames} total career games, his ${s.meta.winRate}% win rate and ${s.combat.kd} K/D prove that rank resets cannot stop his natural gravitational pull toward Iron.`,
        verdict: `Verdict: Lifetime Demotion Ambassador (All-Time Career).`
      };
    }
  },

  FIRST_BLOOD_DONOR: {
    e9a2: (s) => ({
      summary: `Episode 9 Act 2: Treats first blood like a monthly subscription service.`,
      main: `In Episode 9 Act 2, he died first in ${s.combat.firstDeathPct}% of rounds across ${s.meta.totalGames} games with a ${s.combat.kd} K/D. He doesn't clear angles; he submits his body as an opening sacrifice.`,
      verdict: `Verdict: Human Target Dummy (Episode 9 Act 2).`
    }),
    e9a1: (s) => ({
      summary: `Episode 9 Act 1: Always first onto site... and first onto the spectator camera.`,
      main: `Throughout Episode 9 Act 1, ${s.combat.firstDeathPct}% first deaths across ${s.meta.totalGames} games meant his team spent every round in a 4v5 within 4 seconds of barrier drop.`,
      verdict: `Verdict: Spectator Mode Speedrunner (Episode 9 Act 1).`
    }),
    e8a3: (s) => ({
      summary: `Episode 8 Act 3: The enemy entry duelist checks his watch waiting for his free kill.`,
      main: `In Episode 8 Act 3, ${s.combat.firstDeathPct}% first death rate across ${s.meta.totalGames} matches. He dry-peeks Operator angles with zero flashes and wonders why round 1 was lost.`,
      verdict: `Verdict: Free Kill Sponsor (Episode 8 Act 3).`
    }),
    e8a2: (s) => ({
      summary: `Episode 8 Act 2: Died first so often the minimap listed him as a permanent map asset.`,
      main: `Episode 8 Act 2 stats: ${s.combat.firstDeathPct}% first death rate, ${s.combat.firstBloodPct}% first blood rate. Net impact: -1 player for his squad at the start of every single round.`,
      verdict: `Verdict: Round Opener Victim (Episode 8 Act 2).`
    }),
    e8a1: (s) => ({
      summary: `Episode 8 Act 1: The original first-corpse pioneer.`,
      main: `Across ${s.meta.totalGames} games in Episode 8 Act 1, ${s.combat.firstDeathPct}% first deaths established his reputation as the easiest opening duel in the region.`,
      verdict: `Verdict: Opening Duel Donor (Episode 8 Act 1).`
    }),
    all: (s) => ({
      summary: `All-Time: ${s.combat.firstDeathPct}% career first death rate across ${s.meta.totalGames} matches.`,
      main: `Across his entire career of ${s.meta.totalGames} games, he has died first in roughly 1 out of every ${Math.max(2, Math.round(100 / (s.combat.firstDeathPct || 25)))} rounds. A multi-season canary in the tactical coal mine.`,
      verdict: `Verdict: Lifetime First Blood Provider (All-Time Career).`
    })
  },

  COMBO_ECO_MARTYR: {
    e9a2: (s) => ({
      summary: `Episode 9 Act 2: ${s.economy.ecoEfficiency}% eco efficiency. Single-handedly bankrupts squads.`,
      main: `In Episode 9 Act 2, he forced high-tier buys in ${s.economy.operatorBuyFreq}% of save rounds across ${s.meta.totalGames} games, dying immediately and gifting $4700 weapons directly to enemy duelists (${s.economy.postOpWinRate}% win rate on Op rounds).`,
      verdict: `Verdict: Economic Saboteur (Episode 9 Act 2).`
    }),
    e9a1: (s) => ({
      summary: `Episode 9 Act 1: Treats team credits like a personal casino token dispenser.`,
      main: `Throughout Episode 9 Act 1 across ${s.meta.totalGames} matches, his ${s.economy.operatorBuyFreq}% force-buy rate single-handedly bankrupted his team every 3 rounds.`,
      verdict: `Verdict: Financial Hazard (Episode 9 Act 1).`
    }),
    e8a3: (s) => ({
      summary: `Episode 8 Act 3: Buys an Operator, peeks C-Long, donates it in 2.8 seconds.`,
      main: `In Episode 8 Act 3, ${s.meta.totalGames} games of forcing on light buys led to a ${s.economy.postOpWinRate}% Op-round win rate. He didn't buy rifles for himself; he bought them for the other team.`,
      verdict: `Verdict: Weapons Delivery Courier (Episode 8 Act 3).`
    }),
    e8a2: (s) => ({
      summary: `Episode 8 Act 2: The team voted eco. He bought a Vandal and full shields.`,
      main: `Episode 8 Act 2 records: ${s.economy.operatorBuyFreq}% force buy rate, ${s.meta.winRate}% win rate across ${s.meta.totalGames} games. Economic sabotage with zero remorse.`,
      verdict: `Verdict: Economy Deserter (Episode 8 Act 2).`
    }),
    e8a1: (s) => ({
      summary: `Episode 8 Act 1: The earliest warning signs of his economic illiteracy.`,
      main: `Episode 8 Act 1 data: ${s.meta.totalGames} matches, ${s.economy.operatorBuyFreq}% force buy frequency, ${s.economy.postOpWinRate}% win rate on Op rounds. A financial catastrophe from day one.`,
      verdict: `Verdict: Day-One Deficit (Episode 8 Act 1).`
    }),
    all: (s) => ({
      summary: `All-Time Record: Bankrupts his team, buys an Op, dies first. A lifetime cycle.`,
      main: `Across ${s.meta.totalGames} career games, his ${s.economy.operatorBuyFreq}% force-buy frequency and ${s.economy.postOpWinRate}% Op-round win rate have consistently armed the enemy team across every competitive episode.`,
      verdict: `Verdict: Permanent Financial Hazard (All-Time Career).`
    })
  },

  ECO_DESTROYER: {
    e9a2: (s) => ({
      summary: `Episode 9 Act 2: 0% eco efficiency. Single-handedly bankrupts squads.`,
      main: `In Episode 9 Act 2 across ${s.meta.totalGames} matches, forcing on save rounds produced a ${s.economy.postOpWinRate}% Op-round win rate and guaranteed team poverty.`,
      verdict: `Verdict: Economic Saboteur (Episode 9 Act 2).`
    }),
    e9a1: (s) => ({
      summary: `Episode 9 Act 1: Forcing every round like credits grow on site trees.`,
      main: `Episode 9 Act 1 data: ${s.economy.operatorBuyFreq}% force buy rate across ${s.meta.totalGames} games. An unyielding refusal to save with his team.`,
      verdict: `Verdict: Wallet Drainer (Episode 9 Act 1).`
    }),
    e8a3: (s) => ({
      summary: `Episode 8 Act 3: Donates rifles on round 2, blames team on round 3.`,
      main: `In Episode 8 Act 3, ${s.meta.totalGames} games of force buying resulted in ${s.economy.postOpWinRate}% Op-round win rate on those rounds. Pure financial chaos.`,
      verdict: `Verdict: Credit Hazard (Episode 8 Act 3).`
    }),
    e8a2: (s) => ({
      summary: `Episode 8 Act 2: Never had $3,900 in his life.`,
      main: `Episode 8 Act 2 stats: ${s.economy.operatorBuyFreq}% force buy rate, ${s.meta.winRate}% win rate across ${s.meta.totalGames} matches. Always broke, always dying first.`,
      verdict: `Verdict: Broke Operator (Episode 8 Act 2).`
    }),
    e8a1: (s) => ({
      summary: `Episode 8 Act 1: The earliest financial crimes on record.`,
      main: `Across ${s.meta.totalGames} games in Episode 8 Act 1, force-buying with zero utility support cost his team hundreds of rounds.`,
      verdict: `Verdict: Fiscal Terrorist (Episode 8 Act 1).`
    }),
    all: (s) => ({
      summary: `Career Total: Buys an Op, peeks instantly, dies instantly. A timeless classic.`,
      main: `Across ${s.meta.totalGames} career games, his ${s.economy.operatorBuyFreq}% force-buy rate and ${s.economy.postOpWinRate}% Op-round win rate represent a multi-season financial tragedy.`,
      verdict: `Verdict: Lifetime Economic Martyr (All-Time Career).`
    })
  },

  CLUTCH_CHOKER: {
    e9a2: (s) => ({
      summary: `Episode 9 Act 2: ${s.combat.clutchAttempts} clutch attempts, ${s.combat.clutchPct}% conversion rate.`,
      main: `In Episode 9 Act 2, he found himself as the last player standing in ${s.combat.clutchAttempts} rounds across ${s.meta.totalGames} matches, managing a tragic ${s.combat.clutchPct}% win rate. He doesn't save guns, and he certainly doesn't win the 1v1—he just delays the inevitable round loss so all 4 dead teammates can watch his crosshair shake in full HD.`,
      verdict: `Verdict: Dedicated 1vN Spectator Mascot (Episode 9 Act 2).`
    }),
    e9a1: (s) => ({
      summary: `Episode 9 Act 1: Survives every site push only to donate the round in the final 5 seconds.`,
      main: `Throughout Episode 9 Act 1 across ${s.meta.totalGames} matches, he turned 1v1 situations into a spectator horror show with a ${s.combat.clutchPct}% clutch conversion rate. His teammates have watched him miss defuse timers, check the wrong corners, and walk into crosshairs more times than Riot customer support cares to count.`,
      verdict: `Verdict: Clutch Stage-Fright Specialist (Episode 9 Act 1).`
    }),
    e8a3: (s) => ({
      summary: `Episode 8 Act 3: The last alive player who guarantees a loss.`,
      main: `Episode 8 Act 3 records show ${s.combat.clutchAttempts} 1vN scenarios across ${s.meta.totalGames} games with an abysmal ${s.combat.clutchPct}% win rate. He treats the clutch timer like a countdown to his own inevitable demise.`,
      verdict: `Verdict: Reverse Clutch Artist (Episode 8 Act 3).`
    }),
    e8a2: (s) => ({
      summary: `Episode 8 Act 2: Always alive at the end, never winning the round.`,
      main: `In Episode 8 Act 2, his ${s.combat.clutchPct}% clutch success across ${s.meta.totalGames} games cemented his reputation as the ultimate baiter who cannot close out a round.`,
      verdict: `Verdict: Anti-Clutch Consultant (Episode 8 Act 2).`
    }),
    e8a1: (s) => ({
      summary: `Episode 8 Act 1: Where the tradition of choking 1v1s began.`,
      main: `Back in Episode 8 Act 1 across ${s.meta.totalGames} matches, he choked ${100 - s.combat.clutchPct}% of all 1vN opportunities. A flawless multi-act legacy of freezing when the spotlight is on him.`,
      verdict: `Verdict: Pioneer of the Choke (Episode 8 Act 1).`
    }),
    all: (s) => ({
      summary: `Career Record: ${s.combat.clutchAttempts} lifetime 1vN situations, zero ice in his veins.`,
      main: `Across ${s.meta.totalGames} career games, his ${s.combat.clutchPct}% lifetime clutch conversion rate proves that leaving him as the last player alive is mathematically identical to surrendering the round immediately.`,
      verdict: `Verdict: Lifetime 1vN Choker (All-Time Career).`
    })
  },

  ROLE_TOURIST: {
    e9a2: (s) => ({
      summary: `Episode 9 Act 2: Played ${s.agent.uniqueAgentsCount} different agents and mastered zero of them.`,
      main: `In Episode 9 Act 2 across ${s.meta.totalGames} matches, he spread his playtime across ${s.agent.uniqueAgentsCount} separate agents, with his highest pick rate sitting at just ${s.agent.topAgentShare}%. He calls it 'filling for team comp'; his match history calls it 'spreading the liability evenly across all four roles'.`,
      verdict: `Verdict: Jack of All Agents, Master of None (Episode 9 Act 2).`
    }),
    e9a1: (s) => ({
      summary: `Episode 9 Act 1: Cycling through the agent select screen like a slot machine.`,
      main: `Episode 9 Act 1 data: ${s.agent.uniqueAgentsCount} unique agents touched across ${s.meta.totalGames} games (${s.combat.kd} K/D). He refuses to specialize in anything, ensuring he misses lineups and misplaces smokes on every character in the roster.`,
      verdict: `Verdict: Uncommitted Agent Tourist (Episode 9 Act 1).`
    }),
    e8a3: (s) => ({
      summary: `Episode 8 Act 3: ${s.agent.uniqueAgentsCount} agents played, zero agents understood.`,
      main: `In Episode 8 Act 3 across ${s.meta.totalGames} games, he picked ${s.agent.uniqueAgentsCount} different agents and underperformed on every single one (${s.meta.winRate}% win rate). A true Renaissance man of tactical failure.`,
      verdict: `Verdict: Agent Roster Sampler (Episode 8 Act 3).`
    }),
    e8a2: (s) => ({
      summary: `Episode 8 Act 2: Flexing onto every role and losing site on all of them.`,
      main: `During Episode 8 Act 2, playing ${s.agent.uniqueAgentsCount} agents across ${s.meta.totalGames} matches yielded a ${s.combat.kd} K/D. He doesn't have a main agent; he has 20 different ways to disappoint his duo.`,
      verdict: `Verdict: Universal Fill Disaster (Episode 8 Act 2).`
    }),
    e8a1: (s) => ({
      summary: `Episode 8 Act 1: The origins of his agent commitment issues.`,
      main: `Episode 8 Act 1 records show ${s.agent.uniqueAgentsCount} agents played across ${s.meta.totalGames} matches. He has been avoiding mastery since day one.`,
      verdict: `Verdict: Chronic Role Wanderer (Episode 8 Act 1).`
    }),
    all: (s) => ({
      summary: `All-Time: ${s.agent.uniqueAgentsCount} agents in his pool, zero comfort picks.`,
      main: `Across his entire career spanning ${s.meta.totalGames} matches, he has played ${s.agent.uniqueAgentsCount} agents with an overall ${s.combat.kd} K/D and ${s.meta.winRate}% win rate. The ultimate role chameleon with zero actual teeth.`,
      verdict: `Verdict: Lifetime Agent Nomad (All-Time Career).`
    })
  },

  DEFAULT: {
    e9a2: (s) => ({
      summary: `Episode 9 Act 2: Blends so seamlessly into the lobby he is basically an NPC.`,
      main: `In Episode 9 Act 2 across ${s.meta.totalGames} games, he posted a ${s.combat.kd} K/D and ${s.meta.winRate}% win rate with ${s.combat.acs} ACS. Neither carrying nor throwing—just present for the ride like background scenery.`,
      verdict: `Verdict: Background Character (Episode 9 Act 2).`
    }),
    e9a1: (s) => ({
      summary: `Episode 9 Act 1: The mathematical definition of perfectly average.`,
      main: `Throughout Episode 9 Act 1, ${s.meta.totalGames} matches yielded ${s.combat.kd} K/D and ${s.meta.winRate}% win rate. You could replace him with a beginner bot script and the lobby outcome wouldn't shift by 1 round.`,
      verdict: `Verdict: Filler Content Operator (Episode 9 Act 1).`
    }),
    e8a3: (s) => ({
      summary: `Episode 8 Act 3: Zero standout rounds, zero clutch impact, pure spectator material.`,
      main: `In Episode 8 Act 3, he logged ${s.meta.totalGames} matches with ${s.combat.kd} K/D and ${s.meta.winRate}% win rate. Present in every game, remembered in none.`,
      verdict: `Verdict: Invisible Teammate (Episode 8 Act 3).`
    }),
    e8a2: (s) => ({
      summary: `Episode 8 Act 2: The ambassador of absolute mediocrity.`,
      main: `Episode 8 Act 2 data: ${s.meta.totalGames} games, ${s.combat.kd} K/D, ${s.meta.winRate}% win rate. Not bad enough to get reported, not good enough to get commended.`,
      verdict: `Verdict: Perfectly Median (Episode 8 Act 2).`
    }),
    e8a1: (s) => ({
      summary: `Episode 8 Act 1: Where the long career of being ordinary started.`,
      main: `Across ${s.meta.totalGames} matches in Episode 8 Act 1, he produced a ${s.combat.kd} K/D and ${s.meta.winRate}% win rate. A spotless record of non-impact gameplay.`,
      verdict: `Verdict: Standard Issue Player (Episode 8 Act 1).`
    }),
    all: (s) => ({
      summary: `Career Summary: ${s.meta.totalGames} games of human filler content.`,
      main: `Across ${s.meta.totalGames} lifetime matches, his stats converge to ${s.combat.kd} K/D and ${s.meta.winRate}% win rate. An unwavering monument to the statistical average.`,
      verdict: `Verdict: Ultimate Lobby NPC (All-Time Career).`
    })
  }
};

export function generateRoast(selectedTarget, compressedStats, intensity = "spicy", variantSeed = 0, options = {}) {
  const archetypeKey = selectedTarget.id;
  const actCode = compressedStats.meta?.act || options.act || "e9a2";
  const actLabel = compressedStats.meta?.actLabel || options.actLabel || "Episode 9 Act 2";
  const modeCode = compressedStats.meta?.mode || options.mode || "competitive";
  const modeLabel = compressedStats.meta?.modeLabel || options.modeLabel || "Competitive";

  // Check if a bespoke per-act roast exists for this archetype and act
  const ARCHETYPE_ALIASES = {
    'LEGSHOT_HEADSHOT_INVERSION': 'COMBO_LEGSHOT_HEADSHOT',
    'ECO_TERRORIST': 'ECO_DESTROYER',
    'COMBO_ECO_MARTYR': 'ECO_DESTROYER',
    'VETERAN_HARDSTUCK': 'DERANK_CONSULTANT',
    'COMBO_VETERAN_HARDSTUCK': 'DERANK_CONSULTANT',
    'OVERQUALIFIED_BOTTOM_FRAGGER': 'DERANK_CONSULTANT',
    'AIM_FRAUD': 'LEGSHOT_SPECIALIST',
    'AGENT_ONE_TRICK': 'COMBO_ONETRICK_FRAUD',
    'COMBO_STAT_MIRAGE': 'STATISTICAL_MIRAGE',
    'HIGH_ACS_HIGH_DEATH': 'FIRST_BLOOD_DONOR',
    'COMBO_ENTRY_ACS': 'FIRST_BLOOD_DONOR',
    'COMBO_CLUTCH_CHOKER': 'CLUTCH_CHOKER',
    'BALANCED_MEDIOCRE': 'DEFAULT'
  };

  const mappedKey = ARCHETYPE_ALIASES[archetypeKey] || archetypeKey;
  const archetypeBespoke = BESPOKE_ACT_ROASTS[mappedKey] || BESPOKE_ACT_ROASTS.DEFAULT;
  const actRoastFn = archetypeBespoke[actCode] || archetypeBespoke['e9a2'] || BESPOKE_ACT_ROASTS.DEFAULT.e9a2;

  const roastData = actRoastFn(compressedStats, modeCode);
  const selectedStyle = options.style || 'classic';

const NARRATIVE_VARIANTS = {
  MAP_CURSE: [
    "It's fascinating how map geometry alone can break a player's mental.",
    "Most players have a weak map, but this is a full-blown phobia.",
    "Riot should genuinely consider letting him ban this map for his own safety.",
    "Loading screens for this map should come with a trigger warning for him."
  ],
  COMBO_LEGSHOT_HEADSHOT: [
    "At this point, aiming at the floor is just muscle memory.",
    "The commitment to never moving the mouse vertically is almost impressive.",
    "He treats headshots like a suggestion rather than a win condition.",
    "A true master of the lower-body spray transfer."
  ],
  ECO_DESTROYER: [
    "Credit management is apparently a foreign concept.",
    "Treats the team bank like a personal slot machine.",
    "Economic damage to his own team outpaces his damage to the enemy.",
    "The enemy team's favorite financial donor."
  ],
  DERANK_CONSULTANT: [
    "Thousands of rounds played, zero lessons learned.",
    "He's putting in overtime hours just to stay hardstuck.",
    "The sheer volume of matches played only highlights the lack of improvement.",
    "A seasoned veteran at losing RR."
  ],
  LEGSHOT_SPECIALIST: [
    "Why aim for the head when the toes are right there?",
    "A terrifying menace to enemy kneecaps everywhere.",
    "He's playing a completely different game where headshots don't count.",
    "The floor textures must be really interesting to look at."
  ],
  FIRST_BLOOD_DONOR: [
    "Holding W into the enemy crosshair is his primary strategy.",
    "He doesn't entry frag; he just offers himself as a sacrifice.",
    "The round hasn't truly started until he's already spectating.",
    "A dedicated pioneer of the 'die first, complain later' meta."
  ],
  STATISTICAL_MIRAGE: [
    "Baiting teammates for K/D doesn't win rounds, surprisingly.",
    "A shiny K/D ratio built entirely on meaningless exit frags.",
    "He plays for the scoreboard, not the victory screen.",
    "All aim, zero impact. The classic empty-calorie fragger."
  ],
  COMBO_ONETRICK_FRAUD: [
    "Instalocking the same agent just to deliver the same disappointing results.",
    "He only plays one agent, and he still doesn't know how to play them.",
    "A master of exactly one character, and yet a master of none.",
    "The sheer dedication to onetricking his way to the bottom frag."
  ],
  FAKE_SPECIALIST: [
    "Locking in your main agent just to play like a guest on someone else's account.",
    "Hundreds of games on one agent and still figuring out where the abilities land.",
    "He has the agent pick rate of a pro and the utility impact of a decoy clone.",
    "Mastering an agent usually comes with winning rounds, but rules are meant to be broken."
  ],
  CLUTCH_CHOKER: [
    "Always the last man standing, never the guy winning the round.",
    "His team spends more time spectating his crosshair than playing the actual game.",
    "A 1v1 situation for him is basically an interactive spectator mode for the other 4 players.",
    "He survives to the end of every round just to ensure maximum theatrical disappointment."
  ],
  ROLE_TOURIST: [
    "Plays every agent in the roster and has mastered exactly zero of them.",
    "A versatile player in the sense that he can underperform on any role.",
    "Cycling through agents like he's trying on outfits in a changing room.",
    "A true flex player: flexible in how many different ways he can lose site."
  ],
  DEFAULT: [
    "A completely unremarkable performance in every metric.",
    "He's just happy to be included in the lobby.",
    "Neither a carry nor a liability, just taking up server space.",
    "The definition of a perfectly average, forgettable teammate."
  ]
};

  const MODE_FLAVORS = {
    'unrated': `[Unrated Mode]: He treats casual unrated games like the Game 5 overtime of Champions. Sweating against level 12 accounts and still losing close rounds.`,
    'tdm': `[Team Deathmatch]: In TDM he camps ability orbs and still gets eliminated 24 times in 5 minutes in a mode where weapons are free.`,
    'deathmatch': `[Deathmatch]: In DM warmup he holds corners with an Operator, sound-whoring footsteps and respawning into enemy crosshairs.`,
    'all': `[All Game Modes]: Across competitive, casual unrated, and warmups, no lobby is safe from his persistent statistical chaos.`,
  };

function getDynamicIntensityPunchline(intensity, s, pHash = 0, variantSeed = 0, mHash = 0) {
  const topAgent = s.agent?.topAgent || 'his agent';
  const worstMap = s.map?.lowestWinRateMap?.name || 'this map';
  const kd = s.combat?.kd || 0.8;
  const ls = s.combat?.legshotPct || 25;
  const fd = s.combat?.firstDeathPct || 24;
  const seed = Math.abs((mHash * 17) + pHash + variantSeed);

  const PUNCHLINES = {
    'mild': [
      ` [Mild Note: With 10 minutes of daily Aim Lab and a working headset, ${topAgent} might actually hit 1.0 K/D.]`,
      ` [Tactical Advice: If he placed his crosshair at neck height instead of shoe level, his win rate would jump 15%.]`,
      ` [Coach Observation: Solid utility usage on paper, but the gunfights are currently an act of faith.]`,
      ` [Training Tip: Avoid dry-peeking long angles on ${worstMap} and his survival rate will instantly double.]`,
      ` [Friendly Reminder: The left mouse button is meant for firing at heads, not inspecting floor textures.]`,
      ` [Team Debrief: Great enthusiasm in agent select; now we just need the bullets to connect with targets.]`
    ],
    'spicy': [
      ` [Spicy Reality: The enemy team isn't smurfing; his crosshair is simply resting on the floor tiles.]`,
      ` [Hard Truth: Locking ${topAgent} with a ${kd} K/D is technically a donation service for the other team.]`,
      ` [Lobby Audit: In ${worstMap}, his presence on site gives the attackers a free VIP fast-pass onto the bomb site.]`,
      ` [Aim Analysis: Hitting ${ls}% legshots proves he is passionate about enemy footwear, not round victories.]`,
      ` [Entry Review: Dying first in ${fd}% of rounds isn't called entry fragging; it's called volunteering as tribute.]`,
      ` [Economy Alert: Buying rifles only to deliver them directly into the enemy duelist's hands within 6 seconds.]`,
      ` [Minimap Check: His minimap is apparently rendered in 4K, which makes it tragic that he never looks at it.]`,
      ` [Gunfight Reality: If spraying 30 Vandal bullets at the ceiling was a viable strategy, he would be Radiant.]`
    ],
    'savage': [
      ` [Savage Truth: If he spent half as much energy aiming as he does typing excuses in team chat, he would be two ranks higher.]`,
      ` [Combat Diagnosis: His ${topAgent} is playing with inverted mouse controls and an uncalibrated trackpad.]`,
      ` [Map Breakdown: Loading into ${worstMap} causes an immediate 4v5 deficit before the buy phase even finishes.]`,
      ` [Teammate Review: His duo doesn't need a backpack; they need a heavy-duty industrial crane to carry this.]`,
      ` [Crosshair Autopsy: His bullets have visited every wall, crate, and skybox texture except the enemy hitbox.]`,
      ` [Clutch Review: Watching him in a 1v1 situation causes actual cardiovascular distress for the remaining 4 spectators.]`,
      ` [Discord Roast: The enemy team literally sends him friend requests just to keep him in their queue bracket.]`,
      ` [Rank Audit: Riot's matchmaking algorithm puts him in lobbies just to balance the universe with free losses.]`
    ],
    'devastating': [
      ` [Devastating Verdict: Riot Games customer support has officially recommended switching to Animal Crossing or Stardew Valley.]`,
      ` [Esports Autopsy: This isn't a statistical slump; this is an active crime scene against tactical FPS gameplay.]`,
      ` [Existential Audit: After ${s.meta?.totalGames || 40} matches, the game files should automatically self-delete for public safety.]`,
      ` [Psychological Damage: His ${topAgent} gameplay has been classified as a non-lethal sedative for anyone spectating.]`,
      ` [Permanent Sentence: Banned from touching the Vandal until completing 400 consecutive hours of beginner bot training.]`,
      ` [Final Ruling: The only thing lower than his K/D is the morale of anyone who loads into his team lobby.]`
    ]
  };

  const pool = PUNCHLINES[intensity] || PUNCHLINES.spicy;
  return pool[seed % pool.length];
}

  const playerName = compressedStats.meta?.name || compressedStats.meta?.playerName || compressedStats.player?.name || 'Player';
  const playerTag = compressedStats.meta?.tag || compressedStats.meta?.playerTag || compressedStats.player?.tag || '0000';
  const pHash = getPlayerHash(playerName, playerTag, 99);
  
  const matchIds = compressedStats.meta?.matchIds || [];
  let mHash = pHash;
  const matchStr = matchIds.join("");
  for (let i = 0; i < matchStr.length; i++) {
    mHash = (mHash * 31 + matchStr.charCodeAt(i)) | 0;
  }
  mHash = Math.abs(mHash);

  let mainRoast = roastData.main;
  let summary = roastData.summary;
  let verdict = roastData.verdict;
  
  // Apply Narrative Variant
  const variants = NARRATIVE_VARIANTS[mappedKey] || NARRATIVE_VARIANTS.DEFAULT;
  const variantText = variants[(mHash + variantSeed) % variants.length];
  mainRoast = `${variantText} ${mainRoast}`;

  const dynamicPunchline = getDynamicIntensityPunchline(intensity, compressedStats, pHash, variantSeed, mHash);
  
  const isEstimated = compressedStats.meta.isEstimated || compressedStats.meta.isPartialData;
  const rank = compressedStats.meta.rank || 'Unranked';

  let rankPunchline = "";
  if (rank !== 'Unranked') {
    const rankLines = [
      ` For a ${rank} player, this isn't just bad; it's practically pacifism.`,
      ` Even in ${rank}, they usually expect you to shoot back.`,
      ` This is the kind of performance that makes ${rank} look like a social experiment.`,
      ` A statistical anomaly even by ${rank} standards.`
    ];
    rankPunchline = rankLines[(mHash + variantSeed * 3) % rankLines.length];
  }

  let receiptPunchline = "";
  if (!isEstimated && compressedStats.economy?.worstRound) {
    const w = compressedStats.economy.worstRound;
    const diedFirstTxt = w.diedFirst ? " died instantly" : " managed to get exactly 0 kills";
    receiptPunchline = ` I'm looking at your ${w.map} match right now: you spent ${w.spent} credits on a ${w.weapon},${diedFirstTxt}, and completely threw the round.`;
  }

  mainRoast = `${mainRoast}${rankPunchline}${receiptPunchline}${dynamicPunchline}`;

  if (modeCode !== 'competitive' && MODE_FLAVORS[modeCode]) {
    mainRoast = `${mainRoast} ${MODE_FLAVORS[modeCode]}`;
    summary = `[${modeLabel}] ${summary}`;
    verdict = `${verdict.replace(/\.$/, "")} [${modeLabel}].`;
  }

  // Apply Multi-Persona Comedy Style Transform (Classic, VCT Caster, Twitch Chat, Court Trial, Shakespeare, Psych Eval)
  const styledRoast = transformRoastByStyle(selectedStyle, { summary, main: mainRoast, verdict }, compressedStats, {
    intensity,
    variantSeed,
    mode: modeCode
  });

  summary = styledRoast.summary;
  mainRoast = styledRoast.main;
  verdict = styledRoast.verdict;

  const evidenceBadges = (selectedTarget.evidence || []).map(e => ({
    metric: e.metric,
    value: e.value,
    comparison: e.comparison || "notable"
  }));

  const styleObj = ROAST_STYLES.find(s => s.id === selectedStyle);
  if (styleObj && selectedStyle !== 'classic') {
    evidenceBadges.unshift({
      metric: "Comedy Style",
      value: `${styleObj.icon} ${styleObj.label}`,
      comparison: "Active Persona"
    });
  }

  // Prepend Mode and Season badges
  evidenceBadges.unshift({
    metric: "Game Mode",
    value: modeLabel,
    comparison: "Selected Mode"
  });

  evidenceBadges.unshift({
    metric: "Target Season",
    value: actCode === "all" ? "All-Time Lifetime" : actLabel,
    comparison: "Selected Act"
  });

  return {
    archetypeId: selectedTarget.id,
    roastTitle: selectedTarget.title,
    badgeTitle: selectedTarget.badgeTitle,
    summary,
    mainRoast,
    verdict,
    evidenceBadges,
    intensity,
    style: selectedStyle,
    score: selectedTarget.score,
    isContradiction: selectedTarget.isContradiction || selectedTarget.isCombo || false,
    isCombo: selectedTarget.isCombo || false
  };
}
