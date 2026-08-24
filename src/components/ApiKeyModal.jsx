import React, { useState } from 'react';
import { Key, ExternalLink, Save, X } from 'lucide-react';

export default function ApiKeyModal({ isOpen, onClose, apiKey, onSaveApiKey }) {
  const [keyInput, setKeyInput] = useState(apiKey || '');
  if (!isOpen) return null;

  const handleSave = (e) => {
    e.preventDefault();
    onSaveApiKey(keyInput.trim());
    onClose();
  };

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(0,0,0,0.75)',
      backdropFilter: 'blur(4px)',
      zIndex: 50,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24,
    }}>
      <div style={{
        background: 'var(--bg-elevated)',
        border: '1px solid var(--border-medium)',
        borderRadius: 'var(--radius-lg)',
        maxWidth: 400, width: '100%',
        padding: 28, position: 'relative',
      }}>
        <button
          className="btn btn-ghost"
          onClick={onClose}
          style={{ position: 'absolute', top: 12, right: 12, padding: '4px 6px' }}
        >
          <X size={14} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 'var(--radius-sm)',
            background: 'var(--val-red-dim)', border: '1px solid rgba(255,70,85,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Key size={16} color="var(--val-red)" />
          </div>
          <div>
            <div className="font-heading" style={{ fontSize: 16, fontWeight: 700, color: 'white' }}>
              Henrik API Key
            </div>
            <div style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>
              Optional — enables live Valorant data
            </div>
          </div>
        </div>

        <p style={{
          fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.6,
          marginBottom: 16,
        }}>
          Valoroast works out of the box with mock profiles. Add a Henrik API key to query live player data.
        </p>

        <form onSubmit={handleSave}>
          <label style={{
            display: 'block', fontSize: 10, fontWeight: 700,
            textTransform: 'uppercase', letterSpacing: '0.1em',
            color: 'var(--text-tertiary)', marginBottom: 6,
          }}>API Key</label>
          <input
            type="password"
            value={keyInput}
            onChange={(e) => setKeyInput(e.target.value)}
            placeholder="HDEV-xxxxxxxx-xxxx-xxxx"
            className="custom-input"
            style={{ marginBottom: 12 }}
          />

          <a
            href="https://api.henrikdev.xyz/dashboard/"
            target="_blank"
            rel="noreferrer"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 4,
              fontSize: 11, color: 'var(--val-cyan)', fontWeight: 600,
              textDecoration: 'none', marginBottom: 16,
            }}
          >
            Get a free key <ExternalLink size={10} />
          </a>

          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button type="button" className="btn" onClick={() => { setKeyInput(''); onSaveApiKey(''); onClose(); }}>
              Clear
            </button>
            <button type="submit" className="btn btn-primary">
              <Save size={12} /> Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
