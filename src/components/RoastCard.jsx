import React, { useRef, useState } from 'react';
import { Download, RefreshCw, Award, Zap, Shield, Sparkles, CheckCircle2, Users, Search, Flame } from 'lucide-react';
import html2canvas from 'html2canvas';

const THEMES = [
  { id: 'vandal', name: 'Vandal Red', class: 'card-theme-vandal', accent: '#FF4655' },
  { id: 'glitchpop', name: 'Glitchpop Cyber', class: 'card-theme-glitchpop', accent: '#0ef0ff' },
  { id: 'radiant', name: 'Radiant Gold', class: 'card-theme-radiant', accent: '#e8d5a3' },
  { id: 'iron', name: 'Iron Charcoal', class: 'card-theme-iron', accent: '#8C96A0' },
];

const INTENSITIES = [
  { id: 'mild', label: 'Mild' },
  { id: 'spicy', label: 'Spicy' },
  { id: 'savage', label: 'Savage' },
  { id: 'devastating', label: 'Devastating' },
];

const REGIONS = [
  { code: 'ap', label: 'AP' },
  { code: 'na', label: 'NA' },
  { code: 'eu', label: 'EU' },
  { code: 'kr', label: 'KR' },
  { code: 'br', label: 'BR' },
  { code: 'latam', label: 'LATAM' }
];

export const ACTS = [
  { code: 'e9a2', label: 'Episode 9 Act 2' },
  { code: 'e9a1', label: 'Episode 9 Act 1' },
  { code: 'e8a3', label: 'Episode 8 Act 3' },
  { code: 'e8a2', label: 'Episode 8 Act 2' },
  { code: 'e8a1', label: 'Episode 8 Act 1' },
  { code: 'all', label: 'All-Time / Lifetime' },
];

export const GAME_MODES = [
  { code: 'competitive', label: 'Competitive' },
  { code: 'unrated', label: 'Unrated' },
];

export const ROAST_STYLES = [
  { id: 'classic', label: 'Classic', icon: '🥊' },
  { id: 'caster', label: 'VCT Caster', icon: '🎤' },
  { id: 'twitch', label: 'Twitch Chat', icon: '💀' },
  { id: 'courtroom', label: 'Court Trial', icon: '🧑‍⚖️' },
  { id: 'shakespeare', label: 'Shakespeare', icon: '📜' },
  { id: 'therapy', label: 'Psych Eval', icon: '🧠' }
];

export default function RoastCard({
  roastData,
  intensity,
  onIntensityChange,
  onReroll,
  onSaveToWall,
  onRoastFriend,
  selectedAct = 'e9a2',
  onActChange,
  selectedMode = 'competitive',
  onModeChange,
  selectedStyle = 'classic',
  onStyleChange,
  loading = false
}) {
  const cardRef = useRef(null);
  const [selectedTheme, setSelectedTheme] = useState('vandal');
  const [exporting, setExporting] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Friend Quick Roast state
  const [friendRiotId, setFriendRiotId] = useState('');
  const [friendRegion, setFriendRegion] = useState('ap');

  if (!roastData) return null;

  const { player, roast, pipelineDebug } = roastData;
  const themeObj = THEMES.find(t => t.id === selectedTheme) || THEMES[0];
  const compressed = pipelineDebug?.compressedStats;
  const archetypes = pipelineDebug?.rankedArchetypes || [];
  const contradictions = pipelineDebug?.detectedContradictions || [];
  const frequentTeammates = roastData.frequentTeammates || roastData.rawStats?.frequentTeammates || roastData.player?.frequentTeammates || [];

  const topArchetype = archetypes[0] || { title: roast.roastTitle, score: roast.score || 95 };

  const currentActObj = ACTS.find(a => a.code === (selectedAct || player.act));
  const displayActLabel = player.actLabel || (currentActObj ? currentActObj.label.toUpperCase() : 'EPISODE 9 ACT 2');

  function rawStatsOrPlayer(rd) {
    return rd.rawStats || rd.player || {};
  }

  const playSoundEffect = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(110, ctx.currentTime + 0.25);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
      osc.connect(gain).connect(ctx.destination);
      osc.start(); osc.stop(ctx.currentTime + 0.25);
    } catch (e) { /* ignore */ }
  };

  const handleExportPng = async () => {
    if (!cardRef.current) return;
    setExporting(true);
    try {
      const canvas = await html2canvas(cardRef.current, { scale: 2, useCORS: true, backgroundColor: '#0a0e13' });
      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png');
      link.download = `VALOROAST_${player.name}_${player.tag}.png`;
      link.click();
    } catch (e) { console.error(e); }
    finally { setExporting(false); }
  };

  const handleSave = () => {
    onSaveToWall(roastData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleFriendSubmit = (e) => {
    e.preventDefault();
    if (!friendRiotId.trim() || !onRoastFriend) return;
    let [name, tag] = friendRiotId.split('#');
    if (!tag) tag = 'AP1';
    onRoastFriend(friendRegion, name.trim(), tag.trim());
    setFriendRiotId('');
  };

  /* ---- Stat rows for analysis sidebar (Neutral Styling) ---- */
  const statRows = [];
  if (compressed) {
    const maybeAdd = (label, value, suffix = '') => {
      if (value !== null && value !== undefined) {
        statRows.push({ label, value: `${value}${suffix}` });
      }
    };
    maybeAdd('K/D Ratio', compressed.combat.kd);
    maybeAdd('Win Rate', compressed.meta.winRate, '%');
    maybeAdd('ACS', compressed.combat.acs);
    maybeAdd('Headshot %', compressed.combat.headshotPct, '%');
    maybeAdd('Legshot %', compressed.combat.legshotPct, '%');
    maybeAdd('First Death %', compressed.combat.firstDeathPct, '%');
    maybeAdd('Clutch Rate', compressed.combat.clutchPct, '%');
    if (compressed.agent?.topAgent) {
      statRows.push({ label: 'Main Agent', value: `${compressed.agent.topAgent} (${compressed.agent.topAgentShare}%)` });
    }
  }

  return (
    <>
    <section className="anim-fade-in" style={{ paddingBottom: 48, position: 'relative' }}>
      {/* Loading overlay — shown when Act / Intensity triggers re-fetch */}
      {loading && (
        <div style={{
          position: 'absolute', inset: 0, zIndex: 50,
          background: 'rgba(10,14,19,0.72)',
          backdropFilter: 'blur(4px)',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          borderRadius: 'var(--radius-md)',
          gap: 14,
          pointerEvents: 'all',
        }}>
          <div style={{
            width: 36, height: 36,
            border: '3px solid rgba(14,240,255,0.15)',
            borderTop: '3px solid var(--val-cyan)',
            borderRadius: '50%',
            animation: 'spin 0.7s linear infinite',
          }} />
          <div style={{
            fontSize: 11, fontWeight: 700, color: 'var(--val-cyan)',
            fontFamily: 'var(--font-mono)', textTransform: 'uppercase',
            letterSpacing: '0.12em',
          }}>Re-roasting {roastData?.player?.name} for {ACTS.find(a => a.code === selectedAct)?.label || selectedAct}…</div>
        </div>
      )}
      <div className="container">

        {roastData?.player?.isEstimated && (
          <div style={{
            background: 'rgba(255,165,0,0.15)',
            border: '1px solid rgba(255,165,0,0.5)',
            color: 'orange',
            padding: '10px 16px',
            borderRadius: 'var(--radius-md)',
            marginBottom: '16px',
            fontSize: 12,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            fontWeight: 600
          }}>
            ⚠️ We don't have enough specific data for this act. The below roast uses estimated metrics!
          </div>
        )}

        {roastData?.player?.isPartialData && !roastData?.player?.isEstimated && (
          <div style={{
            background: 'rgba(14,240,255,0.15)',
            border: '1px solid rgba(14,240,255,0.5)',
            color: 'var(--val-cyan)',
            padding: '10px 16px',
            borderRadius: 'var(--radius-md)',
            marginBottom: '16px',
            fontSize: 12,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            fontWeight: 600
          }}>
            ℹ️ Past act data loaded from stored matches. Granular round-level stats (like economy and first deaths) are unavailable and have been omitted.
          </div>
        )}

        {/* Comedy Persona / Roast Voice Bar */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: 10, marginBottom: 12,
          padding: '10px 16px',
          background: 'linear-gradient(90deg, rgba(255,70,85,0.06) 0%, rgba(14,240,255,0.06) 100%)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 'var(--radius-md)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{
              fontSize: 10, fontWeight: 800, textTransform: 'uppercase',
              letterSpacing: '0.12em', color: 'var(--val-gold)',
              display: 'flex', alignItems: 'center', gap: 5,
            }}>
              <Flame size={13} color="var(--val-gold)" />
              Roast Voice / Style
            </span>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 6 }}>
            {ROAST_STYLES.map(s => {
              const isActive = (selectedStyle || 'classic') === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => onStyleChange && onStyleChange(s.id)}
                  disabled={loading}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '5px 10px',
                    fontSize: 11, fontWeight: 700,
                    borderRadius: 'var(--radius-sm)',
                    border: isActive
                      ? '1px solid var(--val-cyan)'
                      : '1px solid rgba(255,255,255,0.08)',
                    background: isActive
                      ? 'rgba(14,240,255,0.15)'
                      : 'rgba(0,0,0,0.3)',
                    color: isActive ? 'white' : 'var(--text-secondary)',
                    boxShadow: isActive ? '0 0 12px rgba(14,240,255,0.25)' : 'none',
                    cursor: loading ? 'wait' : 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <span style={{ fontSize: 13 }}>{s.icon}</span>
                  <span>{s.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Neutral Controls Bar */}
        <div style={{
          display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between',
          gap: 12, marginBottom: 20,
          padding: '12px 16px',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-md)',
        }}>
          {/* Intensity Segmented Control */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{
              fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
              letterSpacing: '0.1em', color: 'var(--text-tertiary)',
              fontFamily: 'var(--font-body)',
            }}>Harshness</span>
            <div className="seg-control">
              {INTENSITIES.map(lvl => (
                <button
                  key={lvl.id}
                  className={`seg-control__item seg-control__item--${lvl.id} ${intensity === lvl.id ? 'seg-control__item--active' : ''}`}
                  onClick={() => onIntensityChange(lvl.id)}
                >
                  {lvl.label}
                </button>
              ))}
            </div>
          </div>

          {/* Act / Season Selector — triggers instant re-roast */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{
              fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
              letterSpacing: '0.1em', color: 'var(--text-tertiary)',
            }}>Act</span>
            <div style={{ position: 'relative' }}>
              <select
                value={selectedAct}
                onChange={(e) => onActChange && onActChange(e.target.value)}
                disabled={loading}
                className="custom-select"
                style={{
                  fontSize: 11, fontWeight: 700, color: loading ? 'var(--text-tertiary)' : 'var(--val-gold)',
                  padding: '5px 22px 5px 8px', borderRadius: 'var(--radius-sm)',
                  border: loading
                    ? '1px solid rgba(14,240,255,0.2)'
                    : '1px solid rgba(232,213,163,0.4)',
                  background: 'var(--bg-base)',
                  boxShadow: loading
                    ? '0 0 0 2px rgba(14,240,255,0.15)'
                    : '0 0 0 0 transparent',
                  transition: 'all 0.2s ease',
                  cursor: loading ? 'wait' : 'pointer',
                  opacity: loading ? 0.6 : 1,
                }}
              >
                {ACTS.map(a => (
                  <option key={a.code} value={a.code}>{a.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Game Mode Selector — triggers instant re-roast */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{
              fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
              letterSpacing: '0.1em', color: 'var(--text-tertiary)',
            }}>Mode</span>
            <div style={{ position: 'relative' }}>
              <select
                value={selectedMode}
                onChange={(e) => onModeChange && onModeChange(e.target.value)}
                disabled={loading}
                className="custom-select"
                style={{
                  fontSize: 11, fontWeight: 700, color: loading ? 'var(--text-tertiary)' : 'var(--val-cyan)',
                  padding: '5px 22px 5px 8px', borderRadius: 'var(--radius-sm)',
                  border: loading
                    ? '1px solid rgba(14,240,255,0.2)'
                    : '1px solid rgba(14,240,255,0.4)',
                  background: 'var(--bg-base)',
                  transition: 'all 0.2s ease',
                  cursor: loading ? 'wait' : 'pointer',
                  opacity: loading ? 0.6 : 1,
                }}
              >
                {GAME_MODES.map(m => (
                  <option key={m.code} value={m.code}>{m.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Theme Swatches */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{
              fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
              letterSpacing: '0.1em', color: 'var(--text-tertiary)',
            }}>Theme</span>
            {THEMES.map(t => (
              <button
                key={t.id}
                className={`theme-swatch ${selectedTheme === t.id ? 'theme-swatch--active' : ''}`}
                style={{ backgroundColor: t.accent, color: t.accent }}
                onClick={() => setSelectedTheme(t.id)}
                title={t.name}
              />
            ))}
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <button className="btn" onClick={() => { playSoundEffect(); onReroll(); }}>
              <RefreshCw size={13} style={{ color: 'var(--val-cyan)' }} />
              Reroll
            </button>
            <button className="btn" onClick={handleSave} disabled={savedSuccess}>
              {savedSuccess
                ? <><CheckCircle2 size={13} style={{ color: '#34d399' }} /> Saved</>
                : <><Award size={13} /> Wall</>}
            </button>
            <button className="btn btn-primary" onClick={handleExportPng} disabled={exporting}>
              <Download size={13} />
              {exporting ? 'Rendering...' : 'Export PNG'}
            </button>
          </div>
        </div>

        {/* ============== SPLIT LAYOUT ============== */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 340px',
          gap: 20,
          alignItems: 'start',
        }}>

          {/* ---- LEFT: ROAST CARD ---- */}
          <div
            ref={cardRef}
            className={themeObj.class}
            style={{
              borderRadius: 'var(--radius-lg)',
              padding: 32,
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Grid texture */}
            <div className="grid-overlay" />

            {/* Player Identity */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              paddingBottom: 20, marginBottom: 20,
              borderBottom: '1px solid var(--border-subtle)',
              position: 'relative', zIndex: 1,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ position: 'relative' }}>
                  <img
                    src={player.avatar || '/avatars/phoenix.jpg'}
                    onError={(e) => { e.target.onerror = null; e.target.src = '/avatars/phoenix.jpg'; }}
                    alt={player.name}
                    style={{
                      width: 56, height: 56, borderRadius: 8,
                      border: '1px solid var(--border-medium)',
                      objectFit: 'cover', background: 'var(--bg-base)',
                    }}
                  />
                  <div style={{
                    position: 'absolute', bottom: -4, right: -4,
                    background: 'rgba(255,255,255,0.15)', color: 'white',
                    fontSize: 8, fontWeight: 800, textTransform: 'uppercase',
                    padding: '2px 5px', borderRadius: 2,
                    letterSpacing: '0.05em', border: '1px solid var(--border-subtle)',
                  }}>{player.region}</div>
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
                    <span className="font-heading" style={{ fontSize: 24, fontWeight: 800, color: 'white' }}>
                      {player.name}
                    </span>
                    <span style={{ fontSize: 14, color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>
                      #{player.tag}
                    </span>
                  </div>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    fontSize: 10, fontWeight: 700, color: 'var(--text-secondary)',
                    textTransform: 'uppercase', letterSpacing: '0.08em',
                  }}>
                    <Shield size={12} color="var(--text-tertiary)" />
                    {player.rank}
                    <span style={{ opacity: 0.4 }}>•</span>
                    <span style={{ color: 'var(--val-gold)', fontFamily: 'var(--font-mono)', fontSize: 9 }}>
                      {displayActLabel}
                    </span>
                  </div>
                </div>
              </div>

              {/* Anomaly indicator */}
              {roast.isContradiction && (
                <div style={{
                  fontSize: 9, fontWeight: 800, textTransform: 'uppercase',
                  letterSpacing: '0.1em', color: 'var(--text-secondary)',
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid var(--border-medium)',
                  padding: '4px 10px', borderRadius: 2,
                }}>
                  ⚡ Statistical Paradox
                </div>
              )}
            </div>

            {/* Archetype Title & Tag */}
            <div style={{ position: 'relative', zIndex: 1, marginBottom: 16 }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6,
              }}>
                <span style={{
                  fontSize: 9, fontWeight: 700, textTransform: 'uppercase',
                  letterSpacing: '0.15em', color: 'var(--text-tertiary)',
                  fontFamily: 'var(--font-body)',
                }}>
                  Primary Archetype
                </span>

                <span style={{
                  fontSize: 9, fontWeight: 800, fontFamily: 'var(--font-mono)',
                  padding: '2px 7px', borderRadius: 2,
                  background: 'rgba(255,255,255,0.08)',
                  color: themeObj.accent,
                  border: `1px solid ${themeObj.accent}40`,
                }}>
                  #1 · {Math.round(topArchetype.score)}pts
                </span>
              </div>

              <h2 className="font-display" style={{
                fontSize: 'clamp(32px, 4vw, 46px)',
                color: themeObj.accent,
                lineHeight: 0.95,
                letterSpacing: '0.06em',
              }}>
                {topArchetype.title || roast.roastTitle}
              </h2>
            </div>

            {/* Summary Line */}
            <p style={{
              fontSize: 15, fontStyle: 'italic',
              color: 'var(--text-primary)', fontWeight: 500,
              marginBottom: 20, lineHeight: 1.5,
              position: 'relative', zIndex: 1,
              paddingLeft: 14,
              borderLeft: `3px solid ${themeObj.accent}`,
            }}>
              "{roast.summary}"
            </p>

            {/* Evidence Badges */}
            <div style={{
              display: 'flex', flexWrap: 'wrap', gap: 8,
              marginBottom: 24,
              position: 'relative', zIndex: 1,
            }}>
              {roast.evidenceBadges.map((badge, idx) => (
                <div key={idx} className="evidence-badge" style={{ borderLeftColor: themeObj.accent }}>
                  <Zap size={12} color="var(--text-secondary)" />
                  <div>
                    <div style={{
                      fontSize: 9, fontWeight: 700, textTransform: 'uppercase',
                      letterSpacing: '0.08em', color: 'var(--text-tertiary)',
                    }}>{badge.metric}</div>
                    <div style={{
                      fontSize: 13, fontWeight: 800, color: 'white',
                      fontFamily: 'var(--font-mono)',
                    }}>{badge.value}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Main Roast Text */}
            <div style={{
              padding: 24,
              background: 'rgba(0,0,0,0.35)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              marginBottom: 20,
              position: 'relative', zIndex: 1,
            }}>
              <p style={{
                fontSize: 16, fontWeight: 600, lineHeight: 1.65,
                color: 'var(--text-primary)', fontFamily: 'var(--font-body)',
              }}>
                "{roast.mainRoast}"
              </p>
            </div>

            {/* Verdict */}
            {roast.verdict && (
              <div style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                position: 'relative', zIndex: 1,
                paddingTop: 16,
                borderTop: '1px solid var(--border-subtle)',
              }}>
                <span style={{
                  fontSize: 12, fontWeight: 800, textTransform: 'uppercase',
                  letterSpacing: '0.06em', color: themeObj.accent,
                  fontFamily: 'var(--font-body)',
                }}>{roast.verdict}</span>
                <span style={{
                  fontSize: 10, color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)',
                }}>
                  Score: {Math.round(roast.score)}pts
                </span>
              </div>
            )}

            {/* Watermark Footer */}
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              marginTop: 20, paddingTop: 14,
              borderTop: '1px solid var(--border-subtle)',
              fontSize: 10, color: 'var(--text-tertiary)',
              fontFamily: 'var(--font-mono)',
              position: 'relative', zIndex: 1,
            }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                <Sparkles size={12} color="var(--text-tertiary)" />
                VALOROAST · evidence-grounded stat classifier
              </span>
              <span>valoroast.dev</span>
            </div>
          </div>

          {/* ---- RIGHT: ANALYSIS SIDEBAR ---- */}
          <div className="anim-slide-right" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Roast Frequent Teammates / Duo Friends Widget */}
            <div style={{
              background: 'linear-gradient(135deg, rgba(17, 24, 32, 0.95) 0%, rgba(26, 35, 50, 0.95) 100%)',
              border: '1px solid rgba(14, 240, 255, 0.25)',
              borderRadius: 'var(--radius-md)',
              padding: 16,
              boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
              position: 'relative',
              overflow: 'hidden',
            }}>
              {/* Subtle neon glow corner accent */}
              <div style={{
                position: 'absolute', top: -30, right: -30, width: 80, height: 80,
                background: 'radial-gradient(circle, rgba(14,240,255,0.15) 0%, transparent 70%)',
                pointerEvents: 'none',
              }} />

              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                marginBottom: 12, borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: 10,
              }}>
                <div style={{
                  fontSize: 11, fontWeight: 800, textTransform: 'uppercase',
                  letterSpacing: '0.1em', color: 'white',
                  display: 'flex', alignItems: 'center', gap: 6,
                }}>
                  <Users size={15} color="var(--val-cyan)" />
                  Duo Partners & Teammates Radar
                </div>
                <span style={{
                  fontSize: 9, fontWeight: 700,
                  padding: '2px 6px',
                  background: 'var(--val-cyan-dim)',
                  border: '1px solid rgba(14, 240, 255, 0.3)',
                  color: 'var(--val-cyan)',
                  borderRadius: 3,
                  textTransform: 'uppercase', letterSpacing: '0.05em',
                }}>
                  1-Click Roast
                </span>
              </div>

              {/* Teammate Cards List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
                {frequentTeammates.length > 0 ? (
                  [...frequentTeammates]
                    .sort((a, b) => (b.gamesTogether || 0) - (a.gamesTogether || 0))
                    .map((friend, idx) => (
                    <button
                      key={idx}
                      className="preset-chip"
                      onClick={() => {
                        const targetRegion = friend.region || (friend.tag?.toUpperCase() === '1737' || friend.tag?.toUpperCase() === '5307' || friend.tag?.toUpperCase() === '1403' || friend.tag?.toUpperCase() === 'WHYW' || friend.tag?.toUpperCase().startsWith('AP') ? 'ap' : (player.region || 'ap'));
                        onRoastFriend && onRoastFriend(targetRegion, friend.name, friend.tag);
                      }}
                      style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        width: '100%', padding: '9px 12px',
                        background: idx === 0 ? 'rgba(14, 240, 255, 0.06)' : 'rgba(0,0,0,0.4)',
                        border: idx === 0 ? '1px solid rgba(14, 240, 255, 0.3)' : '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-sm)',
                        cursor: 'pointer', textAlign: 'left',
                        transition: 'all 0.15s ease',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = 'rgba(255, 70, 85, 0.5)';
                        e.currentTarget.style.background = 'rgba(255, 70, 85, 0.08)';
                        e.currentTarget.style.transform = 'translateX(2px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = idx === 0 ? 'rgba(14, 240, 255, 0.3)' : 'var(--border-subtle)';
                        e.currentTarget.style.background = idx === 0 ? 'rgba(14, 240, 255, 0.06)' : 'rgba(0,0,0,0.4)';
                        e.currentTarget.style.transform = 'translateX(0)';
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ position: 'relative' }}>
                          <img
                            src={friend.avatar || '/avatars/reyna.jpg'}
                            onError={(e) => { e.target.onerror = null; e.target.src = '/avatars/reyna.jpg'; }}
                            alt={friend.name}
                            style={{
                              width: 30, height: 30, borderRadius: 6, objectFit: 'cover',
                              border: idx === 0 ? '1px solid var(--val-cyan)' : '1px solid rgba(255,255,255,0.15)',
                              background: 'var(--bg-base)'
                            }}
                          />
                          {idx === 0 && (
                            <span style={{
                              position: 'absolute', top: -5, left: -5,
                              fontSize: 8, fontWeight: 900,
                              background: 'var(--val-cyan)', color: '#000',
                              padding: '1px 3px', borderRadius: 3,
                              letterSpacing: '0.05em'
                            }}>
                              #1
                            </span>
                          )}
                        </div>
                        <div>
                          <div style={{ fontSize: 12, fontWeight: 700, color: 'white', fontFamily: 'var(--font-mono)' }}>
                            {friend.name}<span style={{ color: 'var(--text-tertiary)', fontSize: 10 }}>#{friend.tag}</span>
                          </div>
                          <div style={{ fontSize: 9, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 4 }}>
                            <span style={{ color: 'var(--val-gold)' }}>{friend.topAgent || 'Agent'}</span>
                            <span>·</span>
                            <span style={{ fontWeight: 700, color: idx === 0 ? 'var(--val-cyan)' : 'inherit' }}>
                              {friend.gamesTogether} {friend.gamesTogether === 1 ? 'match' : 'matches'} together
                            </span>
                            {friend.synergy && (
                              <>
                                <span>·</span>
                                <span style={{ color: 'var(--val-cyan)' }}>{friend.synergy}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: 4,
                        padding: '4px 8px', background: 'var(--val-red-dim)',
                        border: '1px solid rgba(255,70,85,0.3)',
                        borderRadius: 3, fontSize: 10, fontWeight: 800, color: 'var(--val-red)',
                      }}>
                        ROAST <Flame size={10} />
                      </div>
                    </button>
                  ))
                ) : (
                  <div style={{
                    padding: '12px 10px',
                    background: 'rgba(0,0,0,0.2)',
                    border: '1px dashed var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: 11, color: 'var(--text-tertiary)',
                    textAlign: 'center'
                  }}>
                    Solo Queue Lone Wolf — Type a friend's Riot ID below to roast them!
                  </div>
                )}
              </div>

              {/* Manual Friend Search Fallback */}
              <div style={{
                fontSize: 10, color: 'var(--text-tertiary)', fontWeight: 600,
                marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em'
              }}>
                Roast Any Other Friend:
              </div>
              <form onSubmit={handleFriendSubmit} style={{ display: 'flex', gap: 6 }}>
                <select
                  value={friendRegion}
                  onChange={(e) => setFriendRegion(e.target.value)}
                  className="custom-select"
                  style={{ fontSize: 10, padding: '6px 20px 6px 8px', minWidth: 62 }}
                >
                  {REGIONS.map(r => (
                    <option key={r.code} value={r.code}>{r.label}</option>
                  ))}
                </select>

                <input
                  type="text"
                  value={friendRiotId}
                  onChange={(e) => setFriendRiotId(e.target.value)}
                  placeholder="FriendRiotID#TAG"
                  className="custom-input"
                  style={{ fontSize: 11, padding: '6px 10px', flex: 1 }}
                />

                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ padding: '6px 12px', fontSize: 10, fontWeight: 800, gap: 4 }}
                >
                  <Search size={11} /> ROAST
                </button>
              </form>
            </div>

            {/* Compressed Statistics Panel */}
            <div style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: 20,
            }}>
              <div style={{
                fontSize: 10, fontWeight: 800, textTransform: 'uppercase',
                letterSpacing: '0.12em', color: 'var(--text-tertiary)',
                marginBottom: 14, fontFamily: 'var(--font-mono)',
                display: 'flex', alignItems: 'center', gap: 6,
              }}>
                <Zap size={12} color="var(--text-tertiary)" />
                Compressed Statistics
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                {statRows.map((row, i) => (
                  <div key={i} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '7px 10px',
                    background: i % 2 === 0 ? 'rgba(0,0,0,0.2)' : 'transparent',
                    borderRadius: 3,
                  }}>
                    <span style={{
                      fontSize: 11, color: 'var(--text-secondary)',
                      fontFamily: 'var(--font-mono)', fontWeight: 500,
                    }}>{row.label}</span>
                    <span style={{
                      fontSize: 12, fontWeight: 700,
                      fontFamily: 'var(--font-mono)', color: 'white',
                    }}>{row.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Detected Archetypes List */}
            <div style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: 20,
            }}>
              <div style={{
                fontSize: 10, fontWeight: 800, textTransform: 'uppercase',
                letterSpacing: '0.12em', color: 'var(--text-tertiary)',
                marginBottom: 12, fontFamily: 'var(--font-body)',
              }}>
                Detected Archetypes ({archetypes.length})
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {archetypes.map((a, i) => (
                  <div key={i} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '8px 10px',
                    background: i === 0 ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.2)',
                    border: i === 0 ? '1px solid var(--border-medium)' : '1px solid transparent',
                    borderRadius: 'var(--radius-sm)',
                  }}>
                    <span style={{
                      fontSize: 11, fontWeight: i === 0 ? 700 : 500,
                      color: i === 0 ? 'white' : 'var(--text-secondary)',
                    }}>
                      {i === 0 && '→ '}{a.title}
                    </span>
                    <span style={{
                      fontSize: 10, fontWeight: 700,
                      fontFamily: 'var(--font-mono)',
                      color: i === 0 ? 'white' : 'var(--text-tertiary)',
                    }}>{Math.round(a.score)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Contradictions Panel */}
            {contradictions.length > 0 && (
              <div style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                padding: 20,
              }}>
                <div style={{
                  fontSize: 10, fontWeight: 800, textTransform: 'uppercase',
                  letterSpacing: '0.12em', color: 'var(--text-tertiary)',
                  marginBottom: 12, fontFamily: 'var(--font-mono)',
                }}>
                  ⚡ Statistical Contradictions
                </div>
                {contradictions.map((c, i) => (
                  <div key={i} style={{
                    padding: '8px 10px',
                    background: 'rgba(0,0,0,0.2)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-sm)',
                    marginBottom: i < contradictions.length - 1 ? 6 : 0,
                  }}>
                    <div style={{
                      fontSize: 11, fontWeight: 700, color: 'white', marginBottom: 2,
                    }}>{c.title} <span style={{ color: 'var(--text-tertiary)', fontWeight: 400 }}>×{c.scoreBoost}</span></div>
                    <div style={{ fontSize: 10, color: 'var(--text-secondary)', lineHeight: 1.4 }}>{c.concept}</div>
                  </div>
                ))}
              </div>
            )}

          </div>
        </div>
      </div>
    </section>
    </>
  );
}
