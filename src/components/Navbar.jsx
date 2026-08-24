import React from 'react';
import { Flame, Terminal, Key } from 'lucide-react';

export default function Navbar({ onOpenApiKey, showPipeline, setShowPipeline, activeTab, setActiveTab, hasApiKey }) {
  return (
    <header style={{
      borderBottom: '1px solid var(--border-subtle)',
      background: 'rgba(10, 14, 19, 0.90)',
      backdropFilter: 'blur(12px)',
      position: 'sticky',
      top: 0,
      zIndex: 40,
    }}>
      <div className="container" style={{
        height: 52,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        {/* Brand */}
        <div
          style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}
          onClick={() => setActiveTab('generator')}
        >
          <div style={{
            width: 28, height: 28,
            background: 'var(--val-red)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            clipPath: 'polygon(0 0, calc(100% - 5px) 0, 100% 5px, 100% 100%, 5px 100%, 0 calc(100% - 5px))',
          }}>
            <Flame size={16} color="white" />
          </div>
          <div>
            <span className="font-display" style={{ fontSize: 22, color: 'white', letterSpacing: '0.08em' }}>
              VALOROAST
            </span>
          </div>
        </div>

        {/* Right Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <button
            className={`btn ${activeTab === 'generator' ? '' : 'btn-ghost'}`}
            onClick={() => setActiveTab('generator')}
            style={activeTab === 'generator' ? { background: 'rgba(255,255,255,0.08)', color: 'var(--text-primary)' } : {}}
          >
            <Flame size={13} color="var(--val-red)" />
            Generator
          </button>

          <button
            className={`btn ${showPipeline ? '' : 'btn-ghost'}`}
            onClick={() => setShowPipeline(!showPipeline)}
            style={showPipeline ? { background: 'var(--val-cyan-dim)', color: 'var(--val-cyan)', borderColor: 'rgba(14,240,255,0.3)' } : {}}
          >
            <Terminal size={13} color="var(--val-cyan)" />
            Pipeline
          </button>

          <button
            className="btn btn-ghost"
            onClick={onOpenApiKey}
            style={hasApiKey ? { color: '#34d399', borderColor: 'rgba(52,211,153,0.3)', background: 'rgba(52,211,153,0.08)' } : {}}
          >
            <Key size={13} />
            {hasApiKey ? 'Key Set' : 'API Key'}
          </button>
        </div>
      </div>
    </header>
  );
}
