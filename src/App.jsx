import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar.jsx';
import SearchHero from './components/SearchHero.jsx';
import RoastCard from './components/RoastCard.jsx';
import PipelineVisualizer from './components/PipelineVisualizer.jsx';
import WallOfShame from './components/WallOfShame.jsx';
import ApiKeyModal from './components/ApiKeyModal.jsx';

export default function App() {
  const [activeTab, setActiveTab] = useState('generator');
  const [presets, setPresets] = useState([]);
  const [roastData, setRoastData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [intensity, setIntensity] = useState('spicy');
  const [variantSeed, setVariantSeed] = useState(0);
  const [selectedAct, setSelectedAct] = useState('e9a2');
  const [selectedMode, setSelectedMode] = useState('competitive');
  const [selectedStyle, setSelectedStyle] = useState('classic');
  const [currentQuery, setCurrentQuery] = useState({ region: 'ap', name: 'WhiffGod', tag: 'NA1' });
  const [showPipeline, setShowPipeline] = useState(false);
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [apiKey, setApiKey] = useState(localStorage.getItem('henrik_api_key') || '');
  const [wallOfShameList, setWallOfShameList] = useState([]);
  const [isHeroCollapsed, setIsHeroCollapsed] = useState(false);

  useEffect(() => {
    fetchPresets();
    fetchWallOfShame();
    handleSearch('ap', 'WhiffGod', 'NA1', 'spicy', 0, 'e9a2', 'competitive', 'classic');
  }, []);

  const fetchPresets = async () => {
    try {
      const res = await fetch('/api/presets');
      if (res.ok) setPresets(await res.json());
    } catch (e) { /* fallback */ }
  };

  const fetchWallOfShame = async () => {
    try {
      const res = await fetch('/api/wall-of-shame');
      if (res.ok) setWallOfShameList(await res.json());
    } catch (e) { /* fallback */ }
  };

  const handleSearch = async (
    region = 'ap',
    name,
    tag,
    currentIntensity = intensity,
    seed = variantSeed,
    act = selectedAct,
    mode = selectedMode,
    style = selectedStyle
  ) => {
    setLoading(true);
    setError(null);
    setCurrentQuery({ region, name, tag });
    setSelectedAct(act);
    setSelectedMode(mode);
    setSelectedStyle(style);
    try {
      const headers = {};
      if (apiKey) headers['x-api-key'] = apiKey;
      const url = `/api/roast/${region}/${encodeURIComponent(name)}/${encodeURIComponent(tag)}?intensity=${currentIntensity}&variantSeed=${seed}&act=${act}&mode=${mode}&style=${style}`;
      const res = await fetch(url, { headers });
      const data = await res.json();
      if (data.success) {
        setRoastData(data);
        setIsHeroCollapsed(true); // Collapse hero after successful roast search
      } else {
        setError(data.error || 'Failed to generate roast.');
      }
    } catch (e) {
      setError('Cannot connect to VALOROAST backend server.');
    } finally {
      setLoading(false);
    }
  };

  const handleIntensityChange = (newIntensity) => {
    setIntensity(newIntensity);
    if (currentQuery.name) handleSearch(currentQuery.region, currentQuery.name, currentQuery.tag, newIntensity, variantSeed, selectedAct, selectedMode, selectedStyle);
  };

  const handleActChange = (newAct) => {
    setSelectedAct(newAct);
    if (currentQuery.name) handleSearch(currentQuery.region, currentQuery.name, currentQuery.tag, intensity, variantSeed, newAct, selectedMode, selectedStyle);
  };

  const handleModeChange = (newMode) => {
    setSelectedMode(newMode);
    if (currentQuery.name) handleSearch(currentQuery.region, currentQuery.name, currentQuery.tag, intensity, variantSeed, selectedAct, newMode, selectedStyle);
  };

  const handleStyleChange = (newStyle) => {
    setSelectedStyle(newStyle);
    if (currentQuery.name) handleSearch(currentQuery.region, currentQuery.name, currentQuery.tag, intensity, variantSeed, selectedAct, selectedMode, newStyle);
  };

  const handleReroll = () => {
    const s = variantSeed + 1;
    setVariantSeed(s);
    if (currentQuery.name) handleSearch(currentQuery.region, currentQuery.name, currentQuery.tag, intensity, s, selectedAct, selectedMode, selectedStyle);
  };

  const handleSaveToWall = async (card) => {
    try {
      const res = await fetch('/api/wall-of-shame', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(card),
      });
      if (res.ok) fetchWallOfShame();
    } catch (e) { /* ignore */ }
  };

  const handleSaveApiKey = (key) => {
    setApiKey(key);
    key ? localStorage.setItem('henrik_api_key', key) : localStorage.removeItem('henrik_api_key');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar
        onOpenApiKey={() => setShowApiKeyModal(true)}
        showPipeline={showPipeline}
        setShowPipeline={setShowPipeline}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        hasApiKey={!!apiKey}
      />

      <main style={{ flex: 1 }}>
        {activeTab === 'generator' && (
          <>
            <SearchHero
              onSearch={(region, name, tag, act, mode) => handleSearch(region, name, tag, intensity, 0, act, mode)}
              presets={presets}
              loading={loading}
              isCollapsed={isHeroCollapsed}
              onToggleCollapse={() => setIsHeroCollapsed(!isHeroCollapsed)}
              selectedAct={selectedAct}
              onActChange={handleActChange}
              selectedMode={selectedMode}
              onModeChange={handleModeChange}
              currentQuery={currentQuery}
            />

            {error && (
              <div className="container" style={{ marginBottom: 16 }}>
                <div style={{
                  padding: '12px 16px',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid var(--border-strong)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: 12, color: 'var(--text-primary)',
                  textAlign: 'center',
                }}>⚠️ {error}</div>
              </div>
            )}

            {loading && !roastData && (
              <div className="container" style={{
                textAlign: 'center', padding: '60px 0',
                fontSize: 12, color: 'var(--text-tertiary)',
                fontFamily: 'var(--font-mono)',
              }}>
                <span className="anim-pulse">
                  Compressing match history → Contradiction Engine → Archetype Classifier…
                </span>
              </div>
            )}

            {roastData && (
              <RoastCard
                roastData={roastData}
                intensity={intensity}
                onIntensityChange={handleIntensityChange}
                onReroll={handleReroll}
                onSaveToWall={handleSaveToWall}
                onRoastFriend={(region, name, tag) => handleSearch(region, name, tag, intensity, 0, selectedAct, selectedMode, selectedStyle)}
                selectedAct={selectedAct}
                onActChange={handleActChange}
                selectedMode={selectedMode}
                onModeChange={handleModeChange}
                selectedStyle={selectedStyle}
                onStyleChange={handleStyleChange}
                loading={loading}
              />
            )}
          </>
        )}

        {activeTab === 'wall' && (
          <WallOfShame
            roasts={wallOfShameList}
            onSelectRoast={(entry) => { setRoastData(entry); setActiveTab('generator'); }}
          />
        )}
      </main>

      {showPipeline && roastData && (
        <PipelineVisualizer
          debugData={roastData.pipelineDebug}
          onClose={() => setShowPipeline(false)}
        />
      )}

      <ApiKeyModal
        isOpen={showApiKeyModal}
        onClose={() => setShowApiKeyModal(false)}
        apiKey={apiKey}
        onSaveApiKey={handleSaveApiKey}
      />

      <footer style={{
        borderTop: '1px solid var(--border-subtle)',
        padding: '16px 0',
        textAlign: 'center',
        fontSize: 10,
        color: 'var(--text-tertiary)',
        fontFamily: 'var(--font-mono)',
        marginTop: 32,
      }}>
        VALOROAST · Evidence-grounded behavioral analysis
      </footer>
    </div>
  );
}
