import React from 'react';
import { Award, Zap } from 'lucide-react';

export default function WallOfShame({ roasts = [], onSelectRoast }) {
  if (roasts.length === 0) {
    return (
      <div className="container" style={{
        textAlign: 'center', padding: '80px 0', color: 'var(--text-tertiary)',
      }}>
        <Award size={36} style={{ margin: '0 auto 16px', opacity: 0.4 }} />
        <h3 className="font-heading" style={{ fontSize: 18, color: 'white', marginBottom: 6 }}>
          The Wall of Shame is Empty
        </h3>
        <p style={{ fontSize: 13 }}>
          Generate a roast card and click "Wall" to feature it here.
        </p>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '48px 24px' }}>
      <div style={{ textAlign: 'center', marginBottom: 36 }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          padding: '4px 12px',
          background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.2)',
          borderRadius: 2, fontSize: 10, fontWeight: 700,
          textTransform: 'uppercase', letterSpacing: '0.12em', color: '#fbbf24',
          marginBottom: 12,
        }}>
          <Award size={12} /> Community Hall of Shame
        </div>
        <h2 className="font-display" style={{ fontSize: 32, color: 'white' }}>
          EVIDENCE-BACKED DISASTERS
        </h2>
      </div>

      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
        gap: 16,
      }}>
        {roasts.map((entry, idx) => (
          <div
            key={entry.id || idx}
            onClick={() => onSelectRoast(entry)}
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: 20, cursor: 'pointer',
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = 'rgba(255,70,85,0.3)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'var(--border-subtle)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            {/* Player Header */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              paddingBottom: 12, marginBottom: 12,
              borderBottom: '1px solid var(--border-subtle)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <img
                  src={entry.player.avatar || '/avatars/phoenix.jpg'}
                  onError={(e) => { e.target.onerror = null; e.target.src = '/avatars/phoenix.jpg'; }}
                  alt={entry.player.name}
                  style={{ width: 32, height: 32, borderRadius: 6, objectFit: 'cover', background: 'var(--bg-base)' }}
                />
                <div>
                  <div style={{
                    fontSize: 13, fontWeight: 700, color: 'white', fontFamily: 'var(--font-mono)',
                  }}>{entry.player.name}#{entry.player.tag}</div>
                  <div style={{ fontSize: 9, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>{entry.player.rank}</div>
                </div>
              </div>
              <span style={{
                fontSize: 9, fontWeight: 800, textTransform: 'uppercase',
                padding: '3px 8px', background: 'var(--val-red-dim)',
                color: 'var(--val-red)', borderRadius: 2,
                letterSpacing: '0.05em',
              }}>{entry.roast.badgeTitle}</span>
            </div>

            {/* Summary */}
            <p style={{
              fontSize: 13, fontWeight: 600, color: 'var(--val-gold)',
              fontStyle: 'italic', marginBottom: 8, lineHeight: 1.4,
            }}>"{entry.roast.summary}"</p>

            <p style={{
              fontSize: 11, color: 'var(--text-secondary)',
              lineHeight: 1.5, marginBottom: 12,
              display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden',
            }}>"{entry.roast.mainRoast}"</p>

            {/* Footer */}
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              paddingTop: 10, borderTop: '1px solid var(--border-subtle)',
              fontSize: 10, color: 'var(--text-tertiary)',
            }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <Zap size={10} color="var(--val-red)" />
                {entry.roast.evidenceBadges?.[0]?.metric}: {entry.roast.evidenceBadges?.[0]?.value}
              </span>
              <span style={{ color: 'var(--val-cyan)', fontWeight: 600 }}>View →</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
