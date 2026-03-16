import { useState, useEffect, useCallback, useMemo } from 'react';
import CREATURES from './creatures';
import { generateAlgoCreature } from './generator';
import { useInstallPrompt, shareCreature } from './hooks';
import { usePremium, useArchiveLimit, useAlgoLimit } from './premium';
import { getBookLinks } from './affiliates';

function getDayOfYear() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  return Math.floor((now - start) / 86400000);
}
function getFormattedDate() {
  return new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}
function getDailyCreature() {
  return { ...CREATURES[getDayOfYear() % CREATURES.length], source: 'database' };
}
function dangerColor(level) {
  const map = { Benevolent:'#5a9e6f',Low:'#6a8e6a',Moderate:'#a89244',High:'#c47a3a',Extreme:'#b84a3a',Catastrophic:'#8a2a3a',Divine:'#7a5aaa',Variable:'#5a7a9a',Unknown:'#6a6a6a',Omen:'#7a5aaa' };
  return map[level] || '#6a6a6a';
}

async function generateAICreature(prompt, apiKey) {
  if (!apiKey) throw new Error('API key required');
  const systemPrompt = `You are a mythological creature designer. Given a user's request, create a unique mythological creature. Respond ONLY with a JSON object (no markdown, no backticks, no preamble) with these fields: name (string), mythology (string), aka (string), type (string), habitat (string), traits (array of 3 strings), danger (string: Benevolent/Low/Moderate/High/Extreme/Catastrophic/Divine/Variable), description (string, 4-6 sentences of rich atmospheric lore).`;
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: { 'Content-Type':'application/json', 'x-api-key':apiKey, 'anthropic-version':'2023-06-01', 'anthropic-dangerous-direct-browser-access':'true' },
    body: JSON.stringify({ model:'claude-sonnet-4-20250514', max_tokens:1000, system:systemPrompt, messages:[{role:'user',content:prompt||'Create a completely original mythological creature that feels like it could belong to a real ancient mythology.'}] }),
  });
  const data = await response.json();
  if (data.error) throw new Error(data.error.message);
  const text = data.content?.map(i=>i.text||'').join('')||'';
  const creature = JSON.parse(text.replace(/```json|```/g,'').trim());
  creature.source = 'ai';
  return creature;
}

function CornerOrnament({position}) {
  const t = {tl:'',tr:'scaleX(-1)',bl:'scaleY(-1)',br:'scale(-1,-1)'};
  const p = {tl:{top:6,left:6},tr:{top:6,right:6},bl:{bottom:6,left:6},br:{bottom:6,right:6}};
  return <svg width="36" height="36" viewBox="0 0 40 40" style={{position:'absolute',...p[position],transform:t[position]}}><path d="M0 40 L0 20 Q0 0 20 0 L40 0" fill="none" stroke="rgba(201,168,76,0.2)" strokeWidth="1"/><circle cx="20" cy="0" r="2" fill="rgba(201,168,76,0.25)"/><circle cx="0" cy="20" r="2" fill="rgba(201,168,76,0.25)"/></svg>;
}

const QUICK_PROMPTS = ['A gentle creature from deep ocean mythology','A terrifying desert predator from forgotten lore','A celestial being that devours stars','A small trickster spirit that lives in shoes','A dragon made entirely of frozen time','A symbiotic creature that bonds with trees'];

function getUniqueMythologies() {
  return ['All', ...Array.from(new Set(CREATURES.map(c=>c.mythology))).sort()];
}

function UpgradeCard({onDismiss, context}) {
  const msgs = {ai:'AI creature generation is a premium feature',archive:"You've reached your daily archive limit",algo:"You've used all your free re-rolls for today",general:'Unlock the full Codex Mythicum experience'};
  return (
    <div style={st.upgradeCard}>
      <div style={st.topBar}/>
      {onDismiss && <button onClick={onDismiss} style={{position:'absolute',top:12,right:14,background:'none',border:'none',color:'var(--text-muted)',cursor:'pointer',fontSize:'1.1rem'}}>&#10005;</button>}
      <div style={{fontFamily:"'Cinzel',serif",fontSize:'0.65rem',letterSpacing:'0.1em',textTransform:'uppercase',color:'var(--gold)',marginBottom:'0.8rem'}}>Premium</div>
      <h3 style={{fontFamily:"'Cinzel',serif",fontSize:'1.1rem',fontWeight:600,color:'var(--text-bright)',marginBottom:'0.5rem'}}>{msgs[context]||msgs.general}</h3>
      <p style={{fontSize:'0.92rem',lineHeight:1.6,color:'var(--text-muted)',marginBottom:'1.2rem'}}>Upgrade to unlock unlimited AI creature generation, full archive browsing, unlimited algorithmic re-rolls, and an ad-free experience.</p>
      <div style={{display:'flex',gap:'0.6rem',flexWrap:'wrap',marginBottom:'1rem'}}>
        {['Unlimited AI creatures','Full archive access','Unlimited re-rolls','No ads'].map((l,i)=><span key={i} style={{fontSize:'0.78rem',color:'#5a9e6f',display:'flex',alignItems:'center',gap:'0.3rem'}}><span>&#10003;</span> {l}</span>)}
      </div>
      <div style={{display:'flex',gap:'0.6rem',flexWrap:'wrap',alignItems:'center'}}>
        <button style={st.premiumBtn}>$1.99/month</button>
        <button style={{...st.premiumBtn,background:'rgba(201,168,76,0.15)'}}>$14.99/year</button>
        <span style={{fontSize:'0.72rem',color:'var(--text-muted)',fontStyle:'italic'}}>Coming soon</span>
      </div>
    </div>
  );
}

function BookLinks({mythology}) {
  const books = useMemo(()=>getBookLinks(mythology),[mythology]);
  if (!books.length) return null;
  return (
    <div style={st.bookSection}>
      <div style={st.metaLabel}>Explore further</div>
      {books.map((b,i)=><a key={i} href={b.url} target="_blank" rel="noopener noreferrer" style={st.bookLink}>{b.title} <span style={{fontSize:'0.65rem',color:'var(--text-muted)',marginLeft:'0.3rem'}}>&#8599;</span></a>)}
    </div>
  );
}

function CreatureCard({creature,fadeIn,onShare,shareMsg}) {
  if (!creature) return null;
  return (
    <div style={{...st.card,opacity:fadeIn?1:0,transform:fadeIn?'translateY(0)':'translateY(12px)'}}>
      <div style={st.topBar}/><CornerOrnament position="tl"/><CornerOrnament position="tr"/><CornerOrnament position="bl"/><CornerOrnament position="br"/>
      <span style={st.sourceTag(creature.source)}>{creature.source==='ai'?'AI crafted':creature.source==='algorithm'?'Algorithmically forged':'From the codex'}</span>
      <div style={st.mythTag}>{creature.mythology}</div>
      <h2 style={st.creatureName}>{creature.name}</h2>
      {creature.aka && <p style={st.aka}>{creature.aka}</p>}
      <p style={st.desc}>{creature.description}</p>
      <div style={st.traitsRow}>{creature.traits?.map((t,i)=><span key={i} style={st.trait}>{t}</span>)}</div>
      <div style={st.metaGrid}>
        <div><div style={st.metaLabel}>Type</div><div style={st.metaValue}>{creature.type}</div></div>
        <div><div style={st.metaLabel}>Threat level</div><div style={{...st.metaValue,color:dangerColor(creature.danger),fontWeight:500}}>{creature.danger}</div></div>
        <div><div style={st.metaLabel}>Habitat</div><div style={st.metaValue}>{creature.habitat}</div></div>
        <div><div style={st.metaLabel}>Source</div><div style={st.metaValue}>{creature.mythology}</div></div>
      </div>
      <BookLinks mythology={creature.mythology}/>
      <button style={st.shareBtn} onClick={onShare}>{shareMsg||'Share this creature'}</button>
    </div>
  );
}

function ArchiveView({isPremium,archiveLimit,onSelect}) {
  const [filter,setFilter] = useState('All');
  const [search,setSearch] = useState('');
  const mythologies = useMemo(getUniqueMythologies,[]);
  const filtered = useMemo(()=>CREATURES.filter(c=>{
    const mm = filter==='All'||c.mythology===filter;
    const ms = !search||c.name.toLowerCase().includes(search.toLowerCase())||c.mythology.toLowerCase().includes(search.toLowerCase())||c.type.toLowerCase().includes(search.toLowerCase());
    return mm&&ms;
  }),[filter,search]);

  return (
    <div>
      <div style={{display:'flex',gap:'0.5rem',marginBottom:'1rem',flexWrap:'wrap'}}>
        <input style={{...st.promptInput,marginBottom:0,flex:1,minWidth:'180px'}} placeholder="Search creatures..." value={search} onChange={e=>setSearch(e.target.value)}/>
        <select style={st.selectInput} value={filter} onChange={e=>setFilter(e.target.value)}>{mythologies.map(m=><option key={m} value={m}>{m}</option>)}</select>
      </div>
      {!isPremium && <p style={{fontSize:'0.78rem',color:'var(--text-muted)',marginBottom:'0.8rem',fontStyle:'italic'}}>{archiveLimit.remaining} free views remaining today ({archiveLimit.limit} daily limit)</p>}
      <div style={{display:'flex',flexDirection:'column',gap:'0.4rem'}}>
        {filtered.map((c,i)=>(
          <button key={i} style={st.archiveItem} onClick={()=>onSelect(c)}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',width:'100%'}}>
              <div><span style={{fontFamily:"'Cinzel',serif",fontSize:'0.88rem',color:'var(--text-bright)',fontWeight:500}}>{c.name}</span><span style={{fontSize:'0.78rem',color:'var(--text-muted)',marginLeft:'0.5rem'}}>{c.aka}</span></div>
              <div style={{display:'flex',gap:'0.4rem',alignItems:'center'}}><span style={st.archiveMythTag}>{c.mythology}</span><span style={{fontSize:'0.72rem',color:dangerColor(c.danger)}}>{c.danger}</span></div>
            </div>
          </button>
        ))}
      </div>
      <p style={{fontSize:'0.72rem',color:'#4a4540',textAlign:'center',marginTop:'1rem',fontStyle:'italic'}}>{filtered.length} of {CREATURES.length} creatures</p>
    </div>
  );
}

export default function App() {
  const [mode,setMode]=useState('daily');
  const [creature,setCreature]=useState(null);
  const [aiPrompt,setAiPrompt]=useState('');
  const [apiKey,setApiKey]=useState(()=>{try{return localStorage.getItem('codex_api_key')||'';}catch{return '';}});
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState(null);
  const [fadeIn,setFadeIn]=useState(false);
  const [shareMsg,setShareMsg]=useState('');
  const [dismissedInstall,setDismissedInstall]=useState(false);
  const [showUpgrade,setShowUpgrade]=useState(false);
  const [upgradeContext,setUpgradeContext]=useState('general');
  const {isInstallable,isInstalled,promptInstall}=useInstallPrompt();
  const {isPremium}=usePremium();
  const archiveLimit=useArchiveLimit();
  const algoLimit=useAlgoLimit();

  const showCreature=useCallback(c=>{setFadeIn(false);setTimeout(()=>{setCreature(c);setFadeIn(true);},150);},[]);
  useEffect(()=>{showCreature(getDailyCreature());},[showCreature]);

  const handleDaily=()=>{setMode('daily');setError(null);setShowUpgrade(false);showCreature(getDailyCreature());};
  const handleAlgo=()=>{
    if(!isPremium&&algoLimit.isLimited){setMode('algorithm');setUpgradeContext('algo');setShowUpgrade(true);return;}
    if(!isPremium)algoLimit.increment();
    setMode('algorithm');setError(null);setShowUpgrade(false);showCreature(generateAlgoCreature(Date.now()));
  };
  const handleReroll=()=>{
    if(!isPremium&&algoLimit.isLimited){setUpgradeContext('algo');setShowUpgrade(true);return;}
    if(!isPremium)algoLimit.increment();
    showCreature(generateAlgoCreature(Date.now()));
  };
  const handleAITab=()=>{setMode('ai');setError(null);if(!isPremium){setUpgradeContext('ai');setShowUpgrade(true);}else{setShowUpgrade(false);}};
  const handleAI=async(cp)=>{
    if(!isPremium){setUpgradeContext('ai');setShowUpgrade(true);return;}
    if(!apiKey){setError('Enter your Anthropic API key above to generate creatures.');return;}
    setLoading(true);setError(null);
    try{const c=await generateAICreature(cp||aiPrompt||undefined,apiKey);showCreature(c);}catch(e){setError(e.message||'The summoning ritual failed.');}
    setLoading(false);
  };
  const handleArchive=()=>{setMode('archive');setError(null);setShowUpgrade(false);};
  const handleArchiveSelect=c=>{
    if(!isPremium&&archiveLimit.isLimited){setUpgradeContext('archive');setShowUpgrade(true);return;}
    if(!isPremium)archiveLimit.increment();
    showCreature({...c,source:'database'});setMode('archive-view');
  };
  const handleShare=async()=>{if(!creature)return;const ok=await shareCreature(creature);if(ok){setShareMsg('Shared!');setTimeout(()=>setShareMsg(''),2000);}};
  const handleInstall=async()=>{const a=await promptInstall();if(!a)setDismissedInstall(true);};
  const saveApiKey=k=>{setApiKey(k);try{localStorage.setItem('codex_api_key',k);}catch{}};

  const activeTab=mode==='archive'||mode==='archive-view'?'archive':mode;

  return (
    <div style={st.app}>
      <header style={st.header}>
        <h1 style={st.title}>Codex Mythicum</h1>
        <p style={st.subtitle}>Mythical creature daily</p>
        <p style={st.dateLine}>{getFormattedDate()}</p>
      </header>

      {isInstallable&&!isInstalled&&!dismissedInstall&&(
        <div style={st.installBanner}>
          <div>
            <strong style={{color:'var(--gold)',fontFamily:"'Cinzel',serif",fontSize:'0.78rem',letterSpacing:'0.06em'}}>Install Codex Mythicum</strong>
            <p style={{fontSize:'0.82rem',color:'var(--text-muted)',marginTop:2}}>Get daily creatures on your home screen</p>
          </div>
          <div style={{display:'flex',gap:'0.5rem'}}>
            <button style={st.installBtn} onClick={handleInstall}>Install</button>
            <button style={{...st.installBtn,background:'transparent',color:'var(--text-muted)'}} onClick={()=>setDismissedInstall(true)}>Later</button>
          </div>
        </div>
      )}

      <div style={st.tabs}>
        {[['daily','Daily',handleDaily],['algorithm','Forge',handleAlgo],['archive','Archive',handleArchive],['ai','AI',handleAITab]].map(([key,label,handler])=>(
          <button key={key} style={st.tab(activeTab===key)} onClick={handler}>
            {label}{key==='ai'&&!isPremium&&<span style={{fontSize:'0.5rem',marginLeft:'0.3rem',color:'var(--gold-dim)',verticalAlign:'super'}}>PRO</span>}
          </button>
        ))}
      </div>

      {mode==='ai'&&isPremium&&(
        <div style={{marginBottom:'1.2rem'}}>
          <input style={{...st.promptInput,fontSize:'0.8rem',padding:'0.5rem 0.7rem',marginBottom:'0.4rem'}} type="password" placeholder="Anthropic API key" value={apiKey} onChange={e=>saveApiKey(e.target.value)}/>
          <input style={st.promptInput} placeholder="Describe a creature... or leave blank for a surprise" value={aiPrompt} onChange={e=>setAiPrompt(e.target.value)} onKeyDown={e=>e.key==='Enter'&&!loading&&handleAI()}/>
          <div style={{display:'flex',gap:'0.6rem',flexWrap:'wrap'}}><button style={st.btn} onClick={()=>handleAI()} disabled={loading}>{loading?'Summoning...':'Summon creature'}</button></div>
          <div style={st.quickBtns}>{QUICK_PROMPTS.map((p,i)=><button key={i} style={st.quickBtn} onClick={()=>{setAiPrompt(p);handleAI(p);}}>{p}</button>)}</div>
        </div>
      )}

      {mode==='algorithm'&&!loading&&!showUpgrade&&(
        <div style={{marginBottom:'0.8rem',display:'flex',alignItems:'center',gap:'0.8rem'}}>
          <button style={st.btn} onClick={handleReroll}>Re-roll creature</button>
          {!isPremium&&<span style={{fontSize:'0.72rem',color:'var(--text-muted)',fontStyle:'italic'}}>{algoLimit.remaining} rolls left today</span>}
        </div>
      )}

      {mode==='archive'&&!showUpgrade&&<ArchiveView isPremium={isPremium} archiveLimit={archiveLimit} onSelect={handleArchiveSelect}/>}
      {mode==='archive-view'&&<button style={{...st.btn,marginBottom:'0.8rem'}} onClick={handleArchive}>&#8592; Back to archive</button>}
      {showUpgrade&&<UpgradeCard context={upgradeContext} onDismiss={()=>setShowUpgrade(false)}/>}
      {error&&<p style={st.errorMsg}>{error}</p>}
      {loading&&<div style={st.loadingOverlay}><span style={{animation:'pulse 1.5s ease-in-out infinite'}}>The summoning circle glows...</span></div>}
      {creature&&!loading&&mode!=='archive'&&<CreatureCard creature={creature} fadeIn={fadeIn} onShare={handleShare} shareMsg={shareMsg}/>}
      {creature&&!loading&&mode==='archive-view'&&<CreatureCard creature={creature} fadeIn={fadeIn} onShare={handleShare} shareMsg={shareMsg}/>}

      <div style={st.footer}>{CREATURES.length} creatures in the codex{isPremium&&<span> &middot; Premium active</span>}</div>
    </div>
  );
}

const st = {
  app:{fontFamily:"'EB Garamond',Georgia,serif",maxWidth:700,margin:'0 auto',padding:'calc(1.5rem + var(--safe-top,0px)) 1rem calc(1.5rem + var(--safe-bottom,0px))',color:'var(--text-main)',minHeight:'100dvh'},
  header:{textAlign:'center',marginBottom:'2rem'},
  title:{fontFamily:"'Cinzel',serif",fontWeight:700,fontSize:'clamp(1.5rem,4.5vw,2rem)',color:'var(--gold)',letterSpacing:'0.08em',textTransform:'uppercase',margin:0},
  subtitle:{fontSize:'0.92rem',color:'var(--text-muted)',fontStyle:'italic',marginTop:4},
  dateLine:{fontFamily:"'Cinzel',serif",fontSize:'0.72rem',color:'var(--gold-dim)',letterSpacing:'0.1em',textTransform:'uppercase',marginTop:8},
  installBanner:{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'0.8rem 1rem',marginBottom:'1.2rem',background:'rgba(201,168,76,0.06)',border:'0.5px solid var(--border-strong)',borderRadius:8,animation:'slideUp 0.4s ease',flexWrap:'wrap',gap:'0.6rem'},
  installBtn:{fontFamily:"'Cinzel',serif",fontSize:'0.7rem',letterSpacing:'0.06em',textTransform:'uppercase',padding:'0.4rem 1rem',border:'0.5px solid var(--border-strong)',borderRadius:4,background:'rgba(201,168,76,0.12)',color:'var(--gold)',cursor:'pointer'},
  tabs:{display:'flex',gap:0,marginBottom:'1.5rem',border:'0.5px solid var(--border-strong)',borderRadius:6,overflow:'hidden'},
  tab:a=>({flex:1,padding:'0.65rem 0.4rem',fontFamily:"'Cinzel',serif",fontSize:'clamp(0.55rem,1.8vw,0.68rem)',letterSpacing:'0.04em',textTransform:'uppercase',background:a?'rgba(201,168,76,0.1)':'transparent',border:'none',color:a?'var(--gold)':'var(--text-muted)',cursor:'pointer',transition:'all 0.3s'}),
  card:{background:'var(--bg-card)',border:'0.5px solid var(--border)',borderRadius:8,padding:'1.8rem 1.6rem',position:'relative',overflow:'hidden',transition:'opacity 0.5s ease, transform 0.5s ease'},
  topBar:{position:'absolute',top:0,left:0,right:0,height:2,background:'linear-gradient(90deg,transparent,rgba(138,114,53,0.4),transparent)'},
  mythTag:{display:'inline-block',fontFamily:"'Cinzel',serif",fontSize:'0.62rem',letterSpacing:'0.12em',textTransform:'uppercase',color:'var(--gold-dim)',border:'0.5px solid var(--border)',padding:'0.2rem 0.7rem',borderRadius:3,marginBottom:'0.8rem'},
  creatureName:{fontFamily:"'Cinzel',serif",fontSize:'clamp(1.3rem,3.5vw,1.7rem)',fontWeight:600,color:'var(--text-bright)',marginBottom:4,lineHeight:1.2},
  aka:{fontStyle:'italic',fontSize:'0.88rem',color:'var(--text-muted)',marginBottom:'1rem'},
  desc:{fontSize:'1.02rem',lineHeight:1.75,color:'#c4c0b8',marginBottom:'1.2rem'},
  traitsRow:{display:'flex',flexWrap:'wrap',gap:'0.4rem',marginBottom:'1.2rem'},
  trait:{fontSize:'0.72rem',color:'var(--gold-dim)',border:'0.5px solid rgba(201,168,76,0.18)',padding:'0.15rem 0.6rem',borderRadius:3},
  metaGrid:{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0.8rem',paddingTop:'1rem',borderTop:'0.5px solid var(--border)'},
  metaLabel:{fontFamily:"'Cinzel',serif",fontSize:'0.58rem',letterSpacing:'0.1em',textTransform:'uppercase',color:'var(--text-muted)',marginBottom:2},
  metaValue:{fontSize:'0.88rem',color:'var(--text-main)'},
  sourceTag:s=>({position:'absolute',top:12,right:14,fontFamily:"'Cinzel',serif",fontSize:'0.55rem',letterSpacing:'0.1em',textTransform:'uppercase',color:s==='ai'?'#5a9a7a':s==='algorithm'?'#7a6aaa':'var(--gold-dim)',opacity:0.7}),
  shareBtn:{display:'block',width:'100%',marginTop:'1.2rem',padding:'0.6rem',fontFamily:"'Cinzel',serif",fontSize:'0.7rem',letterSpacing:'0.08em',textTransform:'uppercase',background:'rgba(201,168,76,0.06)',border:'0.5px solid var(--border)',borderRadius:4,color:'var(--gold-dim)',cursor:'pointer',transition:'all 0.25s'},
  promptInput:{width:'100%',padding:'0.7rem 0.9rem',fontFamily:"'EB Garamond',serif",fontSize:'0.95rem',background:'rgba(18,18,26,0.6)',border:'0.5px solid var(--border)',borderRadius:6,color:'var(--text-main)',outline:'none',marginBottom:'0.6rem',boxSizing:'border-box'},
  selectInput:{padding:'0.55rem 0.7rem',fontFamily:"'EB Garamond',serif",fontSize:'0.88rem',background:'rgba(18,18,26,0.6)',border:'0.5px solid var(--border)',borderRadius:6,color:'var(--text-main)',outline:'none'},
  btn:{fontFamily:"'Cinzel',serif",fontSize:'0.72rem',letterSpacing:'0.08em',textTransform:'uppercase',padding:'0.55rem 1.2rem',border:'0.5px solid var(--border-strong)',borderRadius:4,background:'rgba(201,168,76,0.08)',color:'var(--gold)',cursor:'pointer',transition:'all 0.25s'},
  quickBtns:{display:'flex',flexWrap:'wrap',gap:'0.4rem',marginTop:'0.5rem'},
  quickBtn:{fontSize:'0.7rem',padding:'0.3rem 0.7rem',background:'rgba(201,168,76,0.05)',border:'0.5px solid rgba(201,168,76,0.15)',borderRadius:3,color:'var(--gold-dim)',cursor:'pointer',fontFamily:"'EB Garamond',serif",fontStyle:'italic'},
  loadingOverlay:{display:'flex',alignItems:'center',justifyContent:'center',padding:'3rem 0',color:'var(--gold-dim)',fontStyle:'italic'},
  errorMsg:{color:'#b84a3a',fontStyle:'italic',textAlign:'center',padding:'1rem 0'},
  footer:{textAlign:'center',marginTop:'2rem',paddingBottom:'1rem',fontSize:'0.72rem',color:'#4a4540',fontStyle:'italic'},
  upgradeCard:{background:'var(--bg-card)',border:'0.5px solid rgba(201,168,76,0.25)',borderRadius:8,padding:'1.8rem 1.6rem',position:'relative',overflow:'hidden',marginBottom:'1.2rem'},
  premiumBtn:{fontFamily:"'Cinzel',serif",fontSize:'0.72rem',letterSpacing:'0.06em',textTransform:'uppercase',padding:'0.6rem 1.4rem',border:'0.5px solid var(--gold)',borderRadius:4,background:'rgba(201,168,76,0.2)',color:'var(--gold)',cursor:'pointer',fontWeight:600},
  bookSection:{marginTop:'1rem',paddingTop:'0.8rem',borderTop:'0.5px solid var(--border)'},
  bookLink:{display:'block',fontSize:'0.82rem',color:'var(--gold-dim)',textDecoration:'none',padding:'0.3rem 0',transition:'color 0.2s'},
  archiveItem:{display:'block',width:'100%',padding:'0.7rem 0.9rem',background:'rgba(18,18,26,0.5)',border:'0.5px solid var(--border)',borderRadius:4,cursor:'pointer',textAlign:'left',transition:'all 0.2s',color:'inherit',fontFamily:'inherit'},
  archiveMythTag:{fontSize:'0.6rem',fontFamily:"'Cinzel',serif",letterSpacing:'0.08em',textTransform:'uppercase',color:'var(--gold-dim)',border:'0.5px solid var(--border)',padding:'0.1rem 0.4rem',borderRadius:2},
};
