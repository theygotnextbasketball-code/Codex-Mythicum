import { useState, useEffect, useCallback, useMemo } from 'react';
import CREATURES from './creatures';
import { useInstallPrompt, shareCreature } from './hooks';
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

function CornerOrnament({position}) {
  const t = {tl:'',tr:'scaleX(-1)',bl:'scaleY(-1)',br:'scale(-1,-1)'};
  const p = {tl:{top:6,left:6},tr:{top:6,right:6},bl:{bottom:6,left:6},br:{bottom:6,right:6}};
  return <svg width="36" height="36" viewBox="0 0 40 40" style={{position:'absolute',...p[position],transform:t[position]}}><path d="M0 40 L0 20 Q0 0 20 0 L40 0" fill="none" stroke="rgba(201,168,76,0.2)" strokeWidth="1"/><circle cx="20" cy="0" r="2" fill="rgba(201,168,76,0.25)"/><circle cx="0" cy="20" r="2" fill="rgba(201,168,76,0.25)"/></svg>;
}

function getUniqueMythologies() {
  return ['All', ...Array.from(new Set(CREATURES.map(c=>c.mythology))).sort()];
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
      <span style={st.sourceTag}>From the codex</span>
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

function ArchiveView({onSelect}) {
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
  const [fadeIn,setFadeIn]=useState(false);
  const [shareMsg,setShareMsg]=useState('');
  const [dismissedInstall,setDismissedInstall]=useState(false);
  const {isInstallable,isInstalled,promptInstall}=useInstallPrompt();

  const showCreature=useCallback(c=>{setFadeIn(false);setTimeout(()=>{setCreature(c);setFadeIn(true);},150);},[]);
  useEffect(()=>{showCreature(getDailyCreature());},[showCreature]);

  const handleDaily=()=>{setMode('daily');showCreature(getDailyCreature());};
  const handleArchive=()=>{setMode('archive');};
  const handleArchiveSelect=c=>{showCreature({...c,source:'database'});setMode('archive-view');};
  const handleShare=async()=>{if(!creature)return;const ok=await shareCreature(creature);if(ok){setShareMsg('Shared!');setTimeout(()=>setShareMsg(''),2000);}};
  const handleInstall=async()=>{const a=await promptInstall();if(!a)setDismissedInstall(true);};

  const activeTab=mode==='archive'||mode==='archive-view'?'archive':'daily';

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
        <button style={st.tab(activeTab==='daily')} onClick={handleDaily}>Daily</button>
        <button style={st.tab(activeTab==='archive')} onClick={handleArchive}>Archive</button>
      </div>

      {mode==='archive'&&<ArchiveView onSelect={handleArchiveSelect}/>}
      {mode==='archive-view'&&<button style={{...st.btn,marginBottom:'0.8rem'}} onClick={handleArchive}>&#8592; Back to archive</button>}

      {creature&&mode!=='archive'&&<CreatureCard creature={creature} fadeIn={fadeIn} onShare={handleShare} shareMsg={shareMsg}/>}
      {creature&&mode==='archive-view'&&<CreatureCard creature={creature} fadeIn={fadeIn} onShare={handleShare} shareMsg={shareMsg}/>}

      <div style={st.footer}>{CREATURES.length} creatures in the codex</div>
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
  tab:a=>({flex:1,padding:'0.65rem 0.5rem',fontFamily:"'Cinzel',serif",fontSize:'clamp(0.62rem,2vw,0.75rem)',letterSpacing:'0.06em',textTransform:'uppercase',background:a?'rgba(201,168,76,0.1)':'transparent',border:'none',color:a?'var(--gold)':'var(--text-muted)',cursor:'pointer',transition:'all 0.3s'}),
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
  sourceTag:{position:'absolute',top:12,right:14,fontFamily:"'Cinzel',serif",fontSize:'0.55rem',letterSpacing:'0.1em',textTransform:'uppercase',color:'var(--gold-dim)',opacity:0.7},
  shareBtn:{display:'block',width:'100%',marginTop:'1.2rem',padding:'0.6rem',fontFamily:"'Cinzel',serif",fontSize:'0.7rem',letterSpacing:'0.08em',textTransform:'uppercase',background:'rgba(201,168,76,0.06)',border:'0.5px solid var(--border)',borderRadius:4,color:'var(--gold-dim)',cursor:'pointer',transition:'all 0.25s'},
  promptInput:{width:'100%',padding:'0.7rem 0.9rem',fontFamily:"'EB Garamond',serif",fontSize:'0.95rem',background:'rgba(18,18,26,0.6)',border:'0.5px solid var(--border)',borderRadius:6,color:'var(--text-main)',outline:'none',marginBottom:'0.6rem',boxSizing:'border-box'},
  selectInput:{padding:'0.55rem 0.7rem',fontFamily:"'EB Garamond',serif",fontSize:'0.88rem',background:'rgba(18,18,26,0.6)',border:'0.5px solid var(--border)',borderRadius:6,color:'var(--text-main)',outline:'none'},
  btn:{fontFamily:"'Cinzel',serif",fontSize:'0.72rem',letterSpacing:'0.08em',textTransform:'uppercase',padding:'0.55rem 1.2rem',border:'0.5px solid var(--border-strong)',borderRadius:4,background:'rgba(201,168,76,0.08)',color:'var(--gold)',cursor:'pointer',transition:'all 0.25s'},
  footer:{textAlign:'center',marginTop:'2rem',paddingBottom:'1rem',fontSize:'0.72rem',color:'#4a4540',fontStyle:'italic'},
  bookSection:{marginTop:'1rem',paddingTop:'0.8rem',borderTop:'0.5px solid var(--border)'},
  bookLink:{display:'block',fontSize:'0.82rem',color:'var(--gold-dim)',textDecoration:'none',padding:'0.3rem 0',transition:'color 0.2s'},
  archiveItem:{display:'block',width:'100%',padding:'0.7rem 0.9rem',background:'rgba(18,18,26,0.5)',border:'0.5px solid var(--border)',borderRadius:4,cursor:'pointer',textAlign:'left',transition:'all 0.2s',color:'inherit',fontFamily:'inherit'},
  archiveMythTag:{fontSize:'0.6rem',fontFamily:"'Cinzel',serif",letterSpacing:'0.08em',textTransform:'uppercase',color:'var(--gold-dim)',border:'0.5px solid var(--border)',padding:'0.1rem 0.4rem',borderRadius:2},
};
