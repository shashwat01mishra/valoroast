import React, { useState } from 'react';
import { Search, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';

const REGIONS = [
  { code: 'ap', label: 'AP (Asia)' },
  { code: 'na', label: 'NA' },
  { code: 'eu', label: 'EU' },
  { code: 'kr', label: 'KR' },
  { code: 'br', label: 'BR' },
  { code: 'latam', label: 'LATAM' }
];

export const ACTS = [
  { code: 'e9a2', label: 'Ep 9 Act 2' },
  { code: 'e9a1', label: 'Ep 9 Act 1' },
  { code: 'e8a3', label: 'Ep 8 Act 3' },
  { code: 'e8a2', label: 'Ep 8 Act 2' },
  { code: 'e8a1', label: 'Ep 8 Act 1' },
  { code: 'all', label: 'All-Time' },
];

export const GAME_MODES = [
  { code: 'competitive', label: 'Competitive' },
  { code: 'unrated', label: 'Unrated' },
];

const ARCHETYPE_LABELS = {
  'whiffgod#na1': 'Derank Consultant',
  'onetrickreyna#na1': 'Fake Specialist',
  'miragemaster#eu1': 'Statistical Mirage',
  'legshotking#kr1': 'Legshot Specialist',
  'ecothrower#na1': 'Eco Destroyer',
  'mapcursed#ap1': 'Map Curse',
  'judgeonly#ap1': 'Judge Enthusiast',
  'balancedpro#na1': 'Balanced Player',
};

export default function SearchHero({
  onSearch,
  presets = [],
  loading,
  isCollapsed,
  onToggleCollapse,
  selectedAct = 'e9a2',
  onActChange,
  selectedMode = 'competitive',
  onModeChange,
  currentQuery = null
}) {
  const [riotId, setRiotId] = useState(
    currentQuery?.name && currentQuery?.tag ? `${currentQuery.name}#${currentQuery.tag}` : ''
  );
  const [region, setRegion] = useState(currentQuery?.region || 'ap'); // AP Asia permanent default
  const [act, setAct] = useState(selectedAct);
  const [mode, setMode] = useState(selectedMode);
  const [showPresets, setShowPresets] = useState(false);

  // Keep search bar inputs synced when active player, act, or mode changes
  React.useEffect(() => {
    if (currentQuery?.name && currentQuery?.tag) {
      setRiotId(`${currentQuery.name}#${currentQuery.tag}`);
      if (currentQuery.region) setRegion(currentQuery.region);
    }
  }, [currentQuery?.name, currentQuery?.tag, currentQuery?.region]);

  React.useEffect(() => {
    setAct(selectedAct);
  }, [selectedAct]);

  React.useEffect(() => {
    setMode(selectedMode);
  }, [selectedMode]);

  const handleActSelect = (newAct) => {
    setAct(newAct);
    if (onActChange) onActChange(newAct);
  };

  const handleModeSelect = (newMode) => {
    setMode(newMode);
    if (onModeChange) onModeChange(newMode);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!riotId.trim()) return;
    let [name, tag] = riotId.split('#');
    if (!tag) tag = 'AP1';
    onSearch(region, name.trim(), tag.trim(), act, mode);
  };

  const handlePresetClick = (preset) => {
    setRiotId(`${preset.name}#${preset.tag}`);
    setRegion(preset.region);
    onSearch(preset.region, preset.name, preset.tag, act, mode);
  };

  // If collapsed after card generation, render slim sticky bar
  if (isCollapsed) {
    return (
      <div style={{
        padding: '12px 0',
        background: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border-subtle)',
        marginBottom: 24,
      }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, maxWidth: 640 }}>
            <form onSubmit={handleSubmit} style={{
              display: 'flex', flex: 1,
              background: 'var(--bg-base)',
              border: '1px solid var(--border-medium)',
              borderRadius: 'var(--radius-sm)',
              overflow: 'hidden',
            }}>
              <select
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="custom-select"
                style={{
                  borderRadius: 0, border: 'none',
                  borderRight: '1px solid var(--border-subtle)',
                  minWidth: 70,
                  fontSize: 11,
                  padding: '8px 20px 8px 8px',
                }}
              >
                {REGIONS.map(r => (
                  <option key={r.code} value={r.code}>{r.label}</option>
                ))}
              </select>

              <select
                value={act}
                onChange={(e) => handleActSelect(e.target.value)}
                className="custom-select"
                style={{
                  borderRadius: 0, border: 'none',
                  borderRight: '1px solid var(--border-subtle)',
                  minWidth: 95,
                  fontSize: 11,
                  padding: '8px 20px 8px 8px',
                  color: 'var(--val-gold)'
                }}
              >
                {ACTS.map(a => (
                  <option key={a.code} value={a.code}>{a.label}</option>
                ))}
              </select>

              <select
                value={mode}
                onChange={(e) => handleModeSelect(e.target.value)}
                className="custom-select"
                style={{
                  borderRadius: 0, border: 'none',
                  borderRight: '1px solid var(--border-subtle)',
                  minWidth: 105,
                  fontSize: 11,
                  padding: '8px 20px 8px 8px',
                  color: 'var(--val-cyan)'
                }}
              >
                {GAME_MODES.map(m => (
                  <option key={m.code} value={m.code}>{m.label}</option>
                ))}
              </select>

              <input
                type="text"
                value={riotId}
                onChange={(e) => setRiotId(e.target.value)}
                placeholder="Riot ID (e.g. Friend#AP1)"
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-primary)',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 12,
                  padding: '8px 12px',
                  outline: 'none',
                }}
              />

              <button
                type="submit"
                disabled={loading}
                className="btn-primary"
                style={{
                  borderRadius: 0,
                  border: 'none',
                  padding: '8px 16px',
                  fontSize: 10,
                  fontWeight: 800,
                  cursor: loading ? 'wait' : 'pointer',
                  display: 'flex', alignItems: 'center', gap: 4,
                  fontFamily: 'var(--font-body)',
                }}
              >
                {loading ? (
                  <div style={{
                    width: 12, height: 12,
                    border: '2px solid rgba(255,255,255,0.3)',
                    borderTop: '2px solid white',
                    borderRadius: '50%',
                    animation: 'spin 0.6s linear infinite',
                  }} />
                ) : (
                  <Search size={12} />
                )}
                ROAST
              </button>
            </form>
          </div>

          <button
            className="btn btn-ghost"
            onClick={onToggleCollapse}
            style={{ fontSize: 10, color: 'var(--text-tertiary)' }}
          >
            Expand Hero ↑
          </button>
        </div>
      </div>
    );
  }

  // Full Hero Section on Initial Load
  return (
    <section style={{ padding: '32px 0 24px', textAlign: 'center' }}>
      <div className="container" style={{ maxWidth: 720 }}>

        {/* Subtitle Badge */}
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '4px 12px',
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid var(--border-medium)',
          borderRadius: 2,
          fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
          letterSpacing: '0.12em', color: 'var(--text-secondary)',
          fontFamily: 'var(--font-body)',
          marginBottom: 14,
        }}>
          Behavioral Stat Classifier · Contradiction Engine · Evidence Roast
        </div>

        {/* Headline */}
        <h1 className="font-display" style={{
          fontSize: 'clamp(40px, 6vw, 64px)',
          lineHeight: 0.95,
          color: 'white',
          marginBottom: 6,
          letterSpacing: '0.04em',
        }}>
          KNOW THEIR STATS.<br />
          <span style={{ color: 'var(--val-red)' }}>KNOW THEIR WEAKNESS.</span>
        </h1>

        {/* Description */}
        <p style={{
          fontSize: 13, color: 'var(--text-secondary)', maxWidth: 460,
          margin: '0 auto 20px', lineHeight: 1.6,
        }}>
          Enter any Riot ID to compress match signals into behavioral archetypes 
          and generate personalized, evidence-grounded roast cards.
        </p>

        {/* Search Bar */}
        <form onSubmit={handleSubmit} style={{
          display: 'flex',
          background: 'var(--bg-surface)',
          border: '1px solid var(--border-medium)',
          borderRadius: 'var(--radius-md)',
          overflow: 'hidden',
          maxWidth: 560,
          margin: '0 auto 16px',
        }}>
          <select
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            className="custom-select"
            style={{
              borderRadius: 0, border: 'none',
              borderRight: '1px solid var(--border-subtle)',
              minWidth: 80,
              background: 'var(--bg-elevated)',
              fontSize: 11,
              padding: '12px 24px 12px 10px',
            }}
          >
            {REGIONS.map(r => (
              <option key={r.code} value={r.code}>{r.label}</option>
            ))}
          </select>

          <select
            value={act}
            onChange={(e) => handleActSelect(e.target.value)}
            className="custom-select"
            style={{
              borderRadius: 0, border: 'none',
              borderRight: '1px solid var(--border-subtle)',
              minWidth: 110,
              background: 'var(--bg-elevated)',
              fontSize: 11,
              fontWeight: 700,
              color: 'var(--val-gold)',
              padding: '12px 24px 12px 10px',
            }}
          >
            {ACTS.map(a => (
              <option key={a.code} value={a.code}>{a.label}</option>
            ))}
          </select>

          <select
            value={mode}
            onChange={(e) => handleModeSelect(e.target.value)}
            className="custom-select"
            style={{
              borderRadius: 0, border: 'none',
              borderRight: '1px solid var(--border-subtle)',
              minWidth: 120,
              background: 'var(--bg-elevated)',
              fontSize: 11,
              fontWeight: 700,
              color: 'var(--val-cyan)',
              padding: '12px 24px 12px 10px',
            }}
          >
            {GAME_MODES.map(m => (
              <option key={m.code} value={m.code}>{m.label}</option>
            ))}
          </select>

          <input
            type="text"
            value={riotId}
            onChange={(e) => setRiotId(e.target.value)}
            placeholder="Riot ID — e.g. WhiffGod#AP1"
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-mono)',
              fontSize: 13,
              padding: '12px 16px',
              outline: 'none',
            }}
          />

          <button
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{
              borderRadius: 0,
              border: 'none',
              padding: '12px 24px',
              fontSize: 11,
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              cursor: loading ? 'wait' : 'pointer',
              display: 'flex', alignItems: 'center', gap: 6,
              fontFamily: 'var(--font-body)',
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading ? (
              <div style={{
                width: 14, height: 14,
                border: '2px solid rgba(255,255,255,0.3)',
                borderTop: '2px solid white',
                borderRadius: '50%',
                animation: 'spin 0.6s linear infinite',
              }} />
            ) : (
              <Search size={14} />
            )}
            ROAST
          </button>
        </form>

        {/* De-emphasized Presets Toggle */}
        <div>
          <button
            type="button"
            onClick={() => setShowPresets(!showPresets)}
            className="btn btn-ghost"
            style={{
              fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
              letterSpacing: '0.1em', color: 'var(--text-tertiary)',
              marginBottom: 10, gap: 4,
            }}
          >
            <Sparkles size={11} color="var(--text-tertiary)" />
            {showPresets ? 'Hide Example Riot IDs' : 'Try an Example Riot ID'}
            {showPresets ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
          </button>

          {showPresets && (
            <div className="anim-fade-in" style={{ display: 'flex', flexWrap: 'wrap', gap: 6, justifyContent: 'center' }}>
              {presets.map(p => {
                const key = `${p.name.toLowerCase()}#${p.tag.toLowerCase()}`;
                return (
                  <button
                    key={key}
                    className="preset-chip"
                    onClick={() => handlePresetClick(p)}
                    style={{ padding: '6px 10px' }}
                  >
                    <img
                      src={p.avatar || '/avatars/phoenix.jpg'}
                      onError={(e) => { e.target.onerror = null; e.target.src = '/avatars/phoenix.jpg'; }}
                      alt={p.name}
                      style={{ width: 18, height: 18, borderRadius: 3, objectFit: 'cover', background: 'var(--bg-base)' }}
                    />
                    <div style={{ lineHeight: 1.1 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                        {p.name}<span style={{ color: 'var(--text-tertiary)' }}>#{p.tag}</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </section>
  );
}
