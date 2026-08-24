import React from 'react';
import { Terminal, Activity, AlertTriangle, Cpu, CheckCircle2, X } from 'lucide-react';

export default function PipelineVisualizer({ debugData, onClose }) {
  if (!debugData) return null;
  const { compressedStats, detectedContradictions, rankedArchetypes, detectedCombos, selectedTargetTitle, qualityEvaluation } = debugData;

  const StatPair = ({ label, value }) => (
    <div style={{
      display: 'flex', justifyContent: 'space-between',
      padding: '4px 0', fontSize: 11,
    }}>
      <span style={{ color: 'var(--text-tertiary)' }}>{label}</span>
      <span style={{ color: 'white', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{value}</span>
    </div>
  );

  const QualityBar = ({ label, value, max = 100 }) => (
    <div style={{ marginBottom: 8 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, marginBottom: 3 }}>
        <span style={{ color: 'var(--text-tertiary)' }}>{label}</span>
        <span style={{ color: 'white', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{value}/{max}</span>
      </div>
      <div style={{ height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden' }}>
        <div style={{
          height: '100%', width: `${(value / max) * 100}%`,
          background: value >= 70 ? '#34d399' : value >= 50 ? '#fbbf24' : 'var(--border-strong)',
          borderRadius: 2, transition: 'width 0.3s ease',
        }} />
      </div>
    </div>
  );

  return (
    <div className="debug-panel" style={{
      position: 'fixed', inset: '0 0 0 auto',
      width: 420, zIndex: 50,
      overflowY: 'auto',
      padding: 20,
      boxShadow: '-4px 0 24px rgba(0,0,0,0.5)',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', items: 'center', justifyContent: 'space-between',
        paddingBottom: 14, marginBottom: 16,
        borderBottom: '1px solid var(--border-subtle)',
      }}>
        <div style={{ display: 'flex', items: 'center', gap: 8 }}>
          <Terminal size={16} color="var(--val-cyan)" />
          <span style={{
            fontSize: 12, fontWeight: 800, textTransform: 'uppercase',
            letterSpacing: '0.1em', color: 'white', fontFamily: 'var(--font-body)',
          }}>Pipeline Inspector</span>
          <span style={{
            fontSize: 9, padding: '2px 6px', background: 'var(--val-cyan-dim)',
            color: 'var(--val-cyan)', borderRadius: 2, fontWeight: 700,
            fontFamily: 'var(--font-mono)',
          }}>LIVE</span>
        </div>
        <button className="btn btn-ghost" onClick={onClose} style={{ padding: '4px 6px' }}>
          <X size={14} />
        </button>
      </div>

      <p style={{
        fontSize: 10, color: 'var(--text-tertiary)', lineHeight: 1.5,
        marginBottom: 16, fontFamily: 'var(--font-body)',
      }}>
        Step-by-step trace: Raw Match Metrics → Stat Compression → Contradictions → Archetypes → Combo Engine → Quality Filter.
      </p>

      {/* Selected Target */}
      <div className="debug-stage" style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'var(--border-medium)' }}>
        <div className="debug-stage__header" style={{ color: 'white' }}>
          🎯 Selected Target: {selectedTargetTitle}
        </div>
      </div>

      {/* Stage 1 */}
      <div className="debug-stage">
        <div className="debug-stage__header" style={{ color: 'var(--val-cyan)' }}>
          <Activity size={13} /> Stage 1 — Stat Compression
        </div>
        <StatPair label="K/D" value={compressedStats.combat.kd} />
        <StatPair label="ACS" value={compressedStats.combat.acs} />
        <StatPair label="KAST" value={`${compressedStats.combat.kast}%`} />
        <StatPair label="Headshot %" value={`${compressedStats.combat.headshotPct}%`} />
        <StatPair label="Legshot %" value={`${compressedStats.combat.legshotPct}%`} />
        <StatPair label="First Death %" value={`${compressedStats.combat.firstDeathPct}%`} />
        <StatPair label="Win Rate" value={`${compressedStats.meta.winRate}%`} />
        <StatPair label="Main Agent" value={`${compressedStats.agent.topAgent} (${compressedStats.agent.topAgentShare}%)`} />
        <StatPair label="Map Delta" value={`${compressedStats.map.mapDelta}%`} />
      </div>

      {/* Stage 2 */}
      <div className="debug-stage">
        <div className="debug-stage__header" style={{ color: '#fbbf24' }}>
          <AlertTriangle size={13} /> Stage 2 — Contradictions ({detectedContradictions.length})
        </div>
        {detectedContradictions.length === 0 ? (
          <p style={{ fontSize: 10, color: 'var(--text-tertiary)', fontStyle: 'italic' }}>No anomalies detected</p>
        ) : (
          detectedContradictions.map((c, i) => (
            <div key={i} style={{
              padding: 8, marginBottom: 6,
              background: 'rgba(251,191,36,0.06)',
              border: '1px solid rgba(251,191,36,0.12)',
              borderRadius: 'var(--radius-sm)',
            }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#fbbf24', marginBottom: 2 }}>
                {c.title} <span style={{ fontWeight: 400, color: 'var(--text-tertiary)' }}>×{c.scoreBoost}</span>
              </div>
              <div style={{ fontSize: 10, color: 'var(--text-secondary)', lineHeight: 1.4 }}>{c.concept}</div>
            </div>
          ))
        )}
      </div>

      {/* Stage 3 & 4: Archetypes & Combos */}
      <div className="debug-stage">
        <div className="debug-stage__header" style={{ color: 'var(--text-primary)' }}>
          <Cpu size={13} /> Stage 3 & 4 — Archetypes & Combos
        </div>
        {rankedArchetypes.map((a, i) => (
          <div key={i} style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '5px 8px', fontSize: 11,
            background: i === 0 ? 'rgba(255,255,255,0.08)' : 'transparent',
            borderRadius: 3, marginBottom: 2,
          }}>
            <span style={{ color: i === 0 ? 'white' : 'var(--text-secondary)', fontWeight: i === 0 ? 700 : 400 }}>
              {i + 1}. {a.title}
            </span>
            <span style={{
              fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 10,
              color: i === 0 ? 'white' : 'var(--text-tertiary)',
            }}>{Math.round(a.score)}</span>
          </div>
        ))}
      </div>

      {/* Stage 5: Quality Evaluator */}
      <div className="debug-stage">
        <div className="debug-stage__header" style={{ color: '#34d399' }}>
          <CheckCircle2 size={13} /> Stage 5 — Quality Evaluator
        </div>
        <QualityBar label="Specificity" value={qualityEvaluation.breakdown.specificityScore} />
        <QualityBar label="Evidence Grounding" value={qualityEvaluation.breakdown.groundingScore} />
        <QualityBar label="Originality" value={qualityEvaluation.breakdown.originalityScore} />
        <div style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          marginTop: 12, paddingTop: 10,
          borderTop: '1px solid var(--border-subtle)',
        }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)' }}>Final Quality Index</span>
          <span style={{
            fontSize: 16, fontWeight: 800, fontFamily: 'var(--font-mono)',
            color: qualityEvaluation.finalQualityScore >= 70 ? '#34d399' : '#fbbf24',
          }}>{qualityEvaluation.finalQualityScore}<span style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>/100</span></span>
        </div>
      </div>
    </div>
  );
}
