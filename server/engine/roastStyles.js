import { getPlayerHash } from '../services/henrikApi.js';

export const ROAST_STYLES = [
  { id: 'classic', label: 'Classic', icon: '🥊', desc: 'Sarcastic & Evidence-Grounded' },
  { id: 'caster', label: 'VCT Caster', icon: '🎤', desc: 'Hype Esports Shoutcaster' },
  { id: 'twitch', label: 'Twitch Chat', icon: '💀', desc: 'Brainrot & Streamer Slang' },
  { id: 'courtroom', label: 'Court Trial', icon: '🧑‍⚖️', desc: 'Official Tribunal Indictment' },
  { id: 'shakespeare', label: 'Shakespeare', icon: '📜', desc: 'Elizabethan Tragic Drama' },
  { id: 'therapy', label: 'Psych Eval', icon: '🧠', desc: 'Clinical Tactical Psychiatry' }
];

export function transformRoastByStyle(style, baseData, stats, options = {}) {
  const { summary, main, verdict } = baseData;
  const { combat, agent, map, meta } = stats;
  const { intensity = 'spicy', variantSeed = 0, mode = 'competitive' } = options;

  const playerName = stats.meta?.playerName || stats.player?.name || 'Player';
  const playerTag = stats.meta?.playerTag || stats.player?.tag || '0000';
  const pHash = getPlayerHash(playerName, playerTag, 77);
  const seed = Math.abs((pHash * 13) + variantSeed);

  const topAgent = agent?.topAgent || 'his agent';
  const worstMap = map?.lowestWinRateMap?.name || 'the map';
  const kd = combat?.kd || 0.8;
  const wr = meta?.winRate || 35;
  const games = meta?.totalGames || 30;

  switch (style) {
    case 'caster': {
      const intros = [
        `"OH THE HUMANITY! Look at the minimap right now—${topAgent} is dry-pushing alone with zero util!"`,
        `"AND HE DROPS AGAIN! Ladies and gentlemen, you are watching a historic masterclass in round donation!"`,
        `"WHAT IS HE DOING?! He has the full flank, the enemy back is completely turned... AND HE BREAKS HIS OWN ANKLES!"`,
        `"UNBELIEVABLE! 12 consecutive rounds on defense and not a single crosshair placed at head level!"`,
        `"AND THE DEFENSE FOLDS! The moment ${playerName} peeks the angle, the round is essentially over for his squad!"`,
        `"IS HE PLAYING WITH A STEERING WHEEL?! The spray transfer just hit three walls and a light fixture!"`,
        `"TIMEOUT CALLED! The coach is holding his head in his hands watching this ${topAgent} gameplay!"`
      ];
      const selectedIntro = intros[seed % intros.length];

      return {
        summary: `🎙️ CASTER DESK: "${summary}"`,
        main: `${selectedIntro} Across ${games} matches, this player is averaging a ${kd} K/D and ${wr}% win rate. When they load into ${worstMap}, our broadcast team puts up the technical difficulties screen. ${main}`,
        verdict: `🎙️ CASTING VERDICT: ${verdict.replace(/^Verdict:\s*/i, 'UNANIMOUS DESK RULING: ')}`
      };
    }

    case 'twitch': {
      const twitchQuotes = [
        `"bro is playing on microwave controls 💀💀 ain't no way"`,
        `"chat is this real?? lil bro bought an Op and donated it in 3.2 seconds 😭"`,
        `"nahhh blud really locked ${topAgent} just to spectate the whole game 💀"`,
        `"MY EYES 💀 -10,000 AURA IN THE LOBBY RIGHT NOW"`,
        `"lil bro thinks he's TenZ but his scoreline is 4/18 😭"`,
        `"bro's crosshair is legally married to the floorboards 💀💀"`,
        `"who let bro cook?? the kitchen is completely on fire 😭💀"`,
        `"actual NPC behavior in a competitive lobby ain't no shot 💀"`
      ];
      const selectedTwitch = twitchQuotes[seed % twitchQuotes.length];

      return {
        summary: `💀 TWITCH CHAT: ${selectedTwitch}`,
        main: `LMAOOOO 💀 bro really queued up ${games} matches just to average ${kd} K/D and a ${wr}% win rate 😭. Whenever ${worstMap} comes up in map select the whole lobby spams F in the chat. ${main} Bro is fundamentally allergic to clicking heads 💀.`,
        verdict: `💀 CHAT VERDICT: ${verdict.replace(/^Verdict:\s*/i, 'SKULL EMOJI SENTENCE: ')}`
      };
    }

    case 'courtroom': {
      const caseNum = 1000 + ((seed * 137) % 8999);
      const charges = [
        `willful neglect of crosshair placement`,
        `1st-degree economic terrorism and unauthorized Operator donation`,
        `gross tactical negligence in post-plant situations`,
        `felony refusal to trade teammates on site entry`,
        `unlawful hostage-taking by voting NO on surrender at 1-11`
      ];
      const selectedCharge = charges[seed % charges.length];

      return {
        summary: `🧑‍⚖️ CASE #${caseNum}: Indictment for ${selectedCharge}.`,
        main: `THE VALORANT HIGH COURT CONVENES: The defendant stands accused of ${selectedCharge} across ${games} matches. Exhibits A through D prove a pattern of ${kd} K/D and ${wr}% win rate, with severe aggravating negligence observed on ${worstMap}. ${main}`,
        verdict: `🧑‍⚖️ JUDICIAL SENTENCE: ${verdict.replace(/^Verdict:\s*/i, 'GUILTY AS CHARGED: ')}`
      };
    }

    case 'shakespeare': {
      const soliloquies = [
        `"To peek, or not to peek, that is the question—whether 'tis nobler in the mind to hold the angle, or to dry-swing into five rifles and perish."`,
        `"Alas, poor duelist! A fellow of infinite whiffing, of most excellent round-throwing."`,
        `"O, beware, my teammates, of the green-eyed monster called ego peeking."`,
        `"What crosshair through yonder floorboard breaks? It is the east, and ${topAgent} hath 0 kills."`,
        `"A horse! A horse! My kingdom for a single headshot!"`,
        `"Double, double toil and trouble; spray transfer burn and crosshair bubble."`
      ];
      const selectedSoliloquy = soliloquies[seed % soliloquies.length];

      return {
        summary: `📜 ACT IV, SCENE I: ${selectedSoliloquy}`,
        main: `Hark! For across ${games} tragic trials upon the field of battle, this cursed warrior hath achieved but a ${kd} ratio and ${wr}% victories. When Fate summoneth him to the shores of ${worstMap}, all courage fleeth and his spirit dissolveth into spectator mist. ${main}`,
        verdict: `📜 TRAGIC EPITAPH: ${verdict.replace(/^Verdict:\s*/i, 'THY DOOM IS SEALED: ')}`
      };
    }

    case 'therapy': {
      const patientId = 400 + ((seed * 29) % 500);
      const conditions = [
        `Acute Tactical Amnesia and Minimap Avoidance`,
        `Chronic Phantom Recoil Psychosis`,
        `Severe Dissociative Panic during 1v1 Clutch Situations`,
        `Pathological Denial of Enemy Head Hitboxes`,
        `Subterranean Crosshair Fixation Syndrome`
      ];
      const selectedCondition = conditions[seed % conditions.length];

      return {
        summary: `🧠 CLINICAL DIAGNOSIS #VAL-${patientId}: ${selectedCondition}.`,
        main: `PSYCHIATRIC EVALUATION: Subject demonstrates ${selectedCondition} across ${games} recorded sessions (${kd} K/D, ${wr}% recovery rate). Environmental triggers include loading into ${worstMap}, which induces acute crosshair descent to floor level. ${main}`,
        verdict: `🧠 CLINICAL PROGNOSIS: ${verdict.replace(/^Verdict:\s*/i, 'RECOMMENDED INVOLUNTARY TREATMENT: ')}`
      };
    }

    case 'classic':
    default: {
      return baseData;
    }
  }
}
