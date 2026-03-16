import { useState, useEffect, useCallback, useRef } from 'react';
import CREATURES from './creatures';
import { generateAlgoCreature } from './generator';
import { useInstallPrompt, shareCreature } from './hooks';

// ─── HELPERS ───
function getDayOfYear() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  return Math.floor((now - start) / 86400000);
}

function getFormattedDate() {
  return new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });
}

function getDailyCreature() {
  const day = getDayOfYear();
  return { ...CREATURES[day % CREATURES.length], source: 'database' };
}

function dangerColor(level) {
  const map = {
    Benevolent: '#5a9e6f', Low: '#6a8e6a', Moderate: '#a89244',
    High: '#c47a3a', Extreme: '#b84a3a', Catastrophic: '#8a2a3a',
    Divine: '#7a5aaa', Variable: '#5a7a9a', Unknown: '#6a6a6a', Omen: '#7a5aaa',
  };
  return map[level] || '#6a6a6a';
}

// ─── AI GENERATION ───
async function generateAICreature(prompt) {
  const systemPrompt = `You are a mythological creature designer. Given a user's request, create a unique mythological creature. Respond ONLY with a JSON object (no markdown, no backticks, no preamble) with these fields:
- name: string (a compelling, evocative name)
- mythology: string (which real or imagined mythology it belongs to, or "Original Creation")
- aka: string (an alternate title like "The Devourer of Stars")
- type: string (e.g., "Guardian", "Trickster", "Cosmic Beast", "Shapeshifter")
- habitat: string
- traits: array of 3 strings (key physical or magical characteristics)
- danger: string (one of: "Benevolent", "Low", "Moderate", "High", "Extreme", "Catastrophic", "Divine", "Variable")
- description: string (4-6 sentences of rich, atmospheric lore written as if from an ancient bestiary. Include origin story, behaviors, and what happens when humans encounter it.)`;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      system: systemPrompt,
      messages: [{
        role: 'user',
        content: prompt || 'Create a completely original mythological creature that feels like it could belong to a real ancient mythology. Make it unique — not a rehash of well-known creatures.',
      }],
    }),
  });

  const data = await response.json();
  const text = data.content?.map(i => i.text || '').join('') || '';
  const clean = text.replace(/```json|```/g, '').trim();
  const creature = JSON.parse(clean);
  creature.source = 'ai';
  return creature;
}

// ─── CORNER ORNAMENT ───
function CornerOrnament({ position }) {
  const transforms = {
    tl: '', tr: 'scaleX(-1)', bl: 'scaleY(-1)', br: 'scale(-1,-1)',
  };
  const positions = {
    tl: { top: 6, left: 6 }, tr: { top: 6, right: 6 },
    bl: { bottom: 6, left: 6 }, br: { bottom: 6, right: 6 },
  };
  return (
    <svg width="36" height="36" viewBox="0 0 40 40"
      style={{ position: 'absolute', ...positions[position], transform: transforms[position] }}>
      <path d="M0 40 L0 20 Q0 0 20 0 L40 0" fill="none" stroke="rgba(201,168,76,0.2)" strokeWidth="1" />
      <circle cx="20" cy="0" r="2" fill="rgba(201,168,76,0.25)" />
      <circle cx="0" cy="20" r="2" fill="rgba(201,168,76,0.25)" />
    </svg>
  );
}

// ─── QUICK PROMPTS ───
const QUICK_PROMPTS = [
  'A gentle creature from deep ocean mythology',
  'A terrifying desert predator from forgotten lore',
  'A celestial being that devours stars',
  'A small trickster spirit that lives in shoes',
  'A dragon made entirely of frozen time',
  'A symbiotic creature that bonds with trees',
];

// ─── MAIN APP ───
export default function App() {
  const [mode, setMode] = useState('daily');
  const [creature, setCreature] = useState(null);
  const [aiPrompt, setAiPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fadeIn, setFadeIn] = useState(false);
  const [shareMsg, setShareMsg] = useState('');
  const [dismissedInstall, setDismissedInstall] = useState(false);
  const { isInstallable, isInstalled, promptInstall } = useInstallPrompt();

  const showCreature = useCallback((c) => {
    setFadeIn(false);
    setTimeout(() => { setCreature(c); setFadeIn(true); }, 150);
  }, []);

  useEffect(() => { showCreature(getDailyCreature()); }, [showCreature]);

  const handleDaily = () => { setMode('daily'); setError(null); showCreature(getDailyCreature()); };
  const handleAlgo = () => {
    setMode('algorithm'); setError(null);
    showCreature(generateAlgoCreature(Date.now()));
  };
  const handleReroll = () => showCreature(generateAlgoCreature(Date.now()));
  const handleAI = async (customPrompt) => {
    setMode('ai'); setLoading(true); setError(null);
    try {
      const c = await generateAICreature(customPrompt || aiPrompt || undefined);
      showCreature(c);
    } catch {
      setError('The summoning ritual failed. The spirits are unresponsive. Try again.');
    }
    setLoading(false);
  };

  const handleShare = async () => {
    if (!creature) return;
    const ok = await shareCreature(creature);
    if (ok) { setShareMsg('Shared!'); setTimeout(() => setShareMsg(''), 2000); }
  };

  const handleInstall = async () => {
    const accepted = await promptInstall();
    if (!accepted) setDismissedInstall(true);
  };

  return (
    <div style={styles.app}>
      {/* Header */}
      <header style={styles.header}>
        <h1 style={styles.title}>Codex Mythicum</h1>
        <p style={styles.subtitle}>Mythical creature daily</p>
        <p style={styles.dateLine}>{getFormattedDate()}</p>
      </header>

      {/* Install Banner */}
      {isInstallable && !isInstalled && !dismissedInstall && (
        <div style={styles.installBanner}>
          <div>
            <strong style={{ color: 'var(--gold)', fontFamily: "'Cinzel', serif", fontSize: '0.78rem', letterSpacing: '0.06em' }}>
              Install Codex Mythicum
            </strong>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: 2 }}>
              Get daily creatures on your home screen
            </p>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button style={styles.installBtn} onClick={handleInstall}>Install</button>
            <button style={{ ...styles.installBtn, background: 'transparent', color: 'var(--text-muted)' }}
              onClick={() => setDismissedInstall(true)}>Later</button>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div style={styles.tabs}>
        {[['daily', 'Daily'], ['algorithm', 'Algorithmic'], ['ai', 'AI Generated']].map(([key, label]) => (
          <button key={key} style={styles.tab(mode === key)}
            onClick={key === 'daily' ? handleDaily : key === 'algorithm' ? handleAlgo : () => setMode('ai')}>
            {label}
          </button>
        ))}
      </div>

      {/* AI Controls */}
      {mode === 'ai' && (
        <div style={{ marginBottom: '1.2rem' }}>
          <input style={styles.promptInput} placeholder="Describe a creature... or leave blank for a surprise"
            value={aiPrompt} onChange={e => setAiPrompt(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !loading && handleAI()} />
          <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
            <button style={styles.btn} onClick={() => handleAI()} disabled={loading}>
              {loading ? 'Summoning...' : 'Summon creature'}
            </button>
          </div>
          <div style={styles.quickBtns}>
            {QUICK_PROMPTS.map((p, i) => (
              <button key={i} style={styles.quickBtn} onClick={() => { setAiPrompt(p); handleAI(p); }}>
                {p}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Algorithm Controls */}
      {mode === 'algorithm' && !loading && (
        <div style={{ marginBottom: '0.8rem' }}>
          <button style={styles.btn} onClick={handleReroll}>Re-roll creature</button>
        </div>
      )}

      {/* Error */}
      {error && <p style={styles.errorMsg}>{error}</p>}

      {/* Loading */}
      {loading && (
        <div style={styles.loadingOverlay}>
          <span style={{ animation: 'pulse 1.5s ease-in-out infinite' }}>
            The summoning circle glows...
          </span>
        </div>
      )}

      {/* Creature Card */}
      {creature && !loading && (
        <div style={{ ...styles.card, opacity: fadeIn ? 1 : 0, transform: fadeIn ? 'translateY(0)' : 'translateY(12px)' }}>
          <div style={styles.topBar} />
          <CornerOrnament position="tl" />
          <CornerOrnament position="tr" />
          <CornerOrnament position="bl" />
          <CornerOrnament position="br" />

          {/* Source tag */}
          <span style={styles.sourceTag(creature.source)}>
            {creature.source === 'ai' ? 'AI crafted' : creature.source === 'algorithm' ? 'Algorithmically forged' : 'From the codex'}
          </span>

          <div style={styles.mythTag}>{creature.mythology}</div>
          <h2 style={styles.creatureName}>{creature.name}</h2>
          {creature.aka && <p style={styles.aka}>{creature.aka}</p>}
          <p style={styles.desc}>{creature.description}</p>

          <div style={styles.traitsRow}>
            {creature.traits?.map((t, i) => <span key={i} style={styles.trait}>{t}</span>)}
          </div>

          <div style={styles.metaGrid}>
            <div>
              <div style={styles.metaLabel}>Type</div>
              <div style={styles.metaValue}>{creature.type}</div>
            </div>
            <div>
              <div style={styles.metaLabel}>Threat level</div>
              <div style={{ ...styles.metaValue, color: dangerColor(creature.danger), fontWeight: 500 }}>
                {creature.danger}
              </div>
            </div>
            <div>
              <div style={styles.metaLabel}>Habitat</div>
              <div style={styles.metaValue}>{creature.habitat}</div>
            </div>
            <div>
              <div style={styles.metaLabel}>Source</div>
              <div style={styles.metaValue}>{creature.mythology}</div>
            </div>
          </div>

          {/* Share Button */}
          <button style={styles.shareBtn} onClick={handleShare}>
            {shareMsg || 'Share this creature'}
          </button>
        </div>
      )}

      {/* Footer */}
      <div style={styles.footer}>
        {CREATURES.length} creatures in the codex — new entries surface daily
      </div>
    </div>
  );
}

// ─── STYLES ───
const styles = {
  app: {
    fontFamily: "'EB Garamond', Georgia, serif",
    maxWidth: 700, margin: '0 auto',
    padding: 'calc(1.5rem + var(--safe-top, 0px)) 1rem calc(1.5rem + var(--safe-bottom, 0px))',
    color: 'var(--text-main)', minHeight: '100vh', minHeight: '100dvh',
  },
  header: { textAlign: 'center', marginBottom: '2rem' },
  title: {
    fontFamily: "'Cinzel', serif", fontWeight: 700,
    fontSize: 'clamp(1.5rem, 4.5vw, 2rem)',
    color: 'var(--gold)', letterSpacing: '0.08em',
    textTransform: 'uppercase', margin: 0,
  },
  subtitle: { fontSize: '0.92rem', color: 'var(--text-muted)', fontStyle: 'italic', marginTop: 4 },
  dateLine: {
    fontFamily: "'Cinzel', serif", fontSize: '0.72rem',
    color: 'var(--gold-dim)', letterSpacing: '0.1em',
    textTransform: 'uppercase', marginTop: 8,
  },
  installBanner: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '0.8rem 1rem', marginBottom: '1.2rem',
    background: 'rgba(201,168,76,0.06)',
    border: '0.5px solid var(--border-strong)',
    borderRadius: 8, animation: 'slideUp 0.4s ease',
    flexWrap: 'wrap', gap: '0.6rem',
  },
  installBtn: {
    fontFamily: "'Cinzel', serif", fontSize: '0.7rem',
    letterSpacing: '0.06em', textTransform: 'uppercase',
    padding: '0.4rem 1rem', border: '0.5px solid var(--border-strong)',
    borderRadius: 4, background: 'rgba(201,168,76,0.12)',
    color: 'var(--gold)', cursor: 'pointer',
  },
  tabs: {
    display: 'flex', gap: 0, marginBottom: '1.5rem',
    border: '0.5px solid var(--border-strong)',
    borderRadius: 6, overflow: 'hidden',
  },
  tab: (active) => ({
    flex: 1, padding: '0.65rem 0.5rem',
    fontFamily: "'Cinzel', serif", fontSize: 'clamp(0.6rem, 2vw, 0.72rem)',
    letterSpacing: '0.06em', textTransform: 'uppercase',
    background: active ? 'rgba(201,168,76,0.1)' : 'transparent',
    border: 'none', color: active ? 'var(--gold)' : 'var(--text-muted)',
    cursor: 'pointer', transition: 'all 0.3s',
  }),
  card: {
    background: 'var(--bg-card)',
    border: '0.5px solid var(--border)',
    borderRadius: 8, padding: '1.8rem 1.6rem',
    position: 'relative', overflow: 'hidden',
    transition: 'opacity 0.5s ease, transform 0.5s ease',
  },
  topBar: {
    position: 'absolute', top: 0, left: 0, right: 0, height: 2,
    background: 'linear-gradient(90deg, transparent, rgba(138,114,53,0.4), transparent)',
  },
  mythTag: {
    display: 'inline-block', fontFamily: "'Cinzel', serif",
    fontSize: '0.62rem', letterSpacing: '0.12em',
    textTransform: 'uppercase', color: 'var(--gold-dim)',
    border: '0.5px solid var(--border)',
    padding: '0.2rem 0.7rem', borderRadius: 3, marginBottom: '0.8rem',
  },
  creatureName: {
    fontFamily: "'Cinzel', serif",
    fontSize: 'clamp(1.3rem, 3.5vw, 1.7rem)',
    fontWeight: 600, color: 'var(--text-bright)',
    marginBottom: 4, lineHeight: 1.2,
  },
  aka: { fontStyle: 'italic', fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '1rem' },
  desc: { fontSize: '1.02rem', lineHeight: 1.75, color: '#c4c0b8', marginBottom: '1.2rem' },
  traitsRow: { display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1.2rem' },
  trait: {
    fontSize: '0.72rem', color: 'var(--gold-dim)',
    border: '0.5px solid rgba(201,168,76,0.18)',
    padding: '0.15rem 0.6rem', borderRadius: 3,
  },
  metaGrid: {
    display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem',
    paddingTop: '1rem', borderTop: '0.5px solid var(--border)',
  },
  metaLabel: {
    fontFamily: "'Cinzel', serif", fontSize: '0.58rem',
    letterSpacing: '0.1em', textTransform: 'uppercase',
    color: 'var(--text-muted)', marginBottom: 2,
  },
  metaValue: { fontSize: '0.88rem', color: 'var(--text-main)' },
  sourceTag: (source) => ({
    position: 'absolute', top: 12, right: 14,
    fontFamily: "'Cinzel', serif", fontSize: '0.55rem',
    letterSpacing: '0.1em', textTransform: 'uppercase',
    color: source === 'ai' ? '#5a9a7a' : source === 'algorithm' ? '#7a6aaa' : 'var(--gold-dim)',
    opacity: 0.7,
  }),
  shareBtn: {
    display: 'block', width: '100%', marginTop: '1.2rem',
    padding: '0.6rem', fontFamily: "'Cinzel', serif",
    fontSize: '0.7rem', letterSpacing: '0.08em',
    textTransform: 'uppercase', background: 'rgba(201,168,76,0.06)',
    border: '0.5px solid var(--border)',
    borderRadius: 4, color: 'var(--gold-dim)', cursor: 'pointer',
    transition: 'all 0.25s',
  },
  promptInput: {
    width: '100%', padding: '0.7rem 0.9rem',
    fontFamily: "'EB Garamond', serif", fontSize: '0.95rem',
    background: 'rgba(18,18,26,0.6)',
    border: '0.5px solid var(--border)',
    borderRadius: 6, color: 'var(--text-main)',
    outline: 'none', marginBottom: '0.6rem',
    boxSizing: 'border-box',
  },
  btn: {
    fontFamily: "'Cinzel', serif", fontSize: '0.72rem',
    letterSpacing: '0.08em', textTransform: 'uppercase',
    padding: '0.55rem 1.2rem', border: '0.5px solid var(--border-strong)',
    borderRadius: 4, background: 'rgba(201,168,76,0.08)',
    color: 'var(--gold)', cursor: 'pointer', transition: 'all 0.25s',
  },
  quickBtns: { display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.5rem' },
  quickBtn: {
    fontSize: '0.7rem', padding: '0.3rem 0.7rem',
    background: 'rgba(201,168,76,0.05)',
    border: '0.5px solid rgba(201,168,76,0.15)',
    borderRadius: 3, color: 'var(--gold-dim)', cursor: 'pointer',
    fontFamily: "'EB Garamond', serif", fontStyle: 'italic',
  },
  loadingOverlay: {
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '3rem 0', color: 'var(--gold-dim)', fontStyle: 'italic',
  },
  errorMsg: { color: '#b84a3a', fontStyle: 'italic', textAlign: 'center', padding: '1rem 0' },
  footer: {
    textAlign: 'center', marginTop: '2rem',
    fontSize: '0.72rem', color: '#4a4540', fontStyle: 'italic',
  },
};
