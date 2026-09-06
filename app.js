(function(){
"use strict";

/* ---------------- Music theory data (mirrors MusicTheory.kt) ---------------- */
const KEYS = [
  {id:"C_MAJOR", name:"C-Dur / a-Moll", short:"C-Dur", count:0, sharp:true},
  {id:"G_MAJOR", name:"G-Dur / e-Moll (1♯: F♯)", short:"G-Dur", count:1, sharp:true},
  {id:"D_MAJOR", name:"D-Dur / h-Moll (2♯: F♯ C♯)", short:"D-Dur", count:2, sharp:true},
  {id:"A_MAJOR", name:"A-Dur / fis-Moll (3♯)", short:"A-Dur", count:3, sharp:true},
  {id:"F_MAJOR", name:"F-Dur / d-Moll (1♭: B♭)", short:"F-Dur", count:1, sharp:false},
  {id:"B_FLAT_MAJOR", name:"B-Dur / g-Moll (2♭: B♭ E♭)", short:"B-Dur", count:2, sharp:false},
  {id:"E_FLAT_MAJOR", name:"Es-Dur / c-Moll (3♭)", short:"Es-Dur", count:3, sharp:false},
];
const TIME_SIGS = [
  {b:4,v:4,name:"4/4 Takt (Standard)"}, {b:3,v:4,name:"3/4 Takt (Walzer)"},
  {b:2,v:4,name:"2/4 Takt (Marsch)"}, {b:6,v:8,name:"6/8 Takt (Schwungvoll)"},
  {b:2,v:2,name:"2/2 Alla Breve"},
];
const TEMPO_PRESETS = [
  {bpm:45,it:"Largo",de:"Sehr langsam, breit"},{bpm:60,it:"Adagio",de:"Ruhig, langsam"},
  {bpm:76,it:"Andante",de:"Gehend, gemächlich"},{bpm:96,it:"Andantino",de:"Etwas rascher"},
  {bpm:108,it:"Moderato",de:"Mäßig bewegt"},{bpm:120,it:"Allegretto",de:"Mäßig schnell"},
  {bpm:138,it:"Allegro",de:"Fröhlich, schnell"},{bpm:156,it:"Vivace",de:"Lebhaft, heiter"},
  {bpm:180,it:"Presto",de:"Sehr schnell"},
];
const INSTRUMENTS = [
  {id:"PIANO",name:"Klavier / Piano",clef:"treble",timbre:"PIANO",transpose:0},
  {id:"VIOLIN",name:"Violine / Geige",clef:"treble",timbre:"VIOLIN",transpose:0},
  {id:"FLUTE",name:"Flöte / Querflöte",clef:"treble",timbre:"FLUTE",transpose:0},
  {id:"GUITAR",name:"Akustikgitarre",clef:"treble",timbre:"GUITAR",transpose:-12},
  {id:"TRUMPET",name:"Trompete (in B)",clef:"treble",timbre:"TRUMPET",transpose:-2},
  {id:"CELLO",name:"Violoncello / Cello",clef:"bass",timbre:"CELLO_BASS",transpose:0},
  {id:"SAXOPHONE",name:"Altsaxophon (in Es)",clef:"treble",timbre:"DEFAULT",transpose:-9},
  {id:"CLARINET",name:"Klarinette (in B)",clef:"treble",timbre:"DEFAULT",transpose:-2},
  {id:"BASS",name:"E-Bass / Kontrabass",clef:"bass",timbre:"CELLO_BASS",transpose:-12},
  {id:"VOICE",name:"Gesang / Singstimme",clef:"treble",timbre:"DEFAULT",transpose:0},
];
const DURATIONS = [
  {id:"WHOLE",symbol:"𝅝",label:"1/1",beats:4},
  {id:"HALF",symbol:"𝅘𝅥",label:"1/2",beats:2},
  {id:"QUARTER",symbol:"♩",label:"1/4",beats:1},
  {id:"EIGHTH",symbol:"♪",label:"1/8",beats:0.5},
  {id:"SIXTEENTH",symbol:"𝅯",label:"1/16",beats:0.25},
];
const ACCIDENTALS = [
  {id:"NONE",symbol:"♮",label:"Standard",shift:0},
  {id:"SHARP",symbol:"♯",label:"Kreuz",shift:1},
  {id:"FLAT",symbol:"♭",label:"Be",shift:-1},
  {id:"NATURAL",symbol:"♮",label:"Auflösung",shift:0},
];
const ARTICULATIONS = [
  {id:"STACCATO",symbol:"•",label:"Staccato"},
  {id:"ACCENT",symbol:">",label:"Akzent"},
  {id:"TENUTO",symbol:"—",label:"Tenuto"},
  {id:"FERMATA",symbol:"𝄐",label:"Fermate"},
];
const REST_GLYPH = {WHOLE:"𝄻",HALF:"𝄼",QUARTER:"𝄽",EIGHTH:"𝄾",SIXTEENTH:"𝄿"};

function midiName(m){
  const names=["C","C♯","D","D♯","E","F","F♯","G","G♯","A","B","H"];
  return names[((m%12)+12)%12]+ (Math.floor(m/12)-1);
}
function midiFreq(m){ return 440*Math.pow(2,(m-69)/12); }
const DIATONIC=[0,2,4,5,7,9,11];
function staffStep(midi,clef){
  const oct=Math.floor(midi/12)-1, s=((midi%12)+12)%12;
  const dia=[0,0,1,1,2,3,3,4,4,5,6,6][s];
  const abs=oct*7+dia;
  const base = clef==="bass" ? 18 : 30;
  return (abs-base)*0.5;
}

/* ---------------- Sample content ---------------- */
function newMeasures(n){
  const arr=[]; for(let i=0;i<n;i++) arr.push({notes:[]}); return arr;
}
function makeSong(o){
  return Object.assign({
    id:"s"+Math.random().toString(36).slice(2),
    title:"Mein Song", artist:"", composer:"Komponist", subtitle:"",
    key:"C_MAJOR", timeSig:{b:4,v:4}, tempo:120,
    instrument:"PIANO", measures: newMeasures(4), durationText:"–"
  }, o);
}
const state = {
  tab: "BIBLIOTHEK",
  drawerOpen: false,
  songs: [
    makeSong({title:"Feuer & Flamme", artist:"Nordlicht", composer:"J. Berg", key:"D_MAJOR", tempo:128, instrument:"GUITAR", durationText:"3:24",
      measures:[
        {notes:[n(62,"QUARTER"),n(64,"QUARTER"),n(66,"QUARTER"),n(67,"QUARTER")]},
        {notes:[n(69,"HALF"),n(67,"QUARTER"),n(66,"QUARTER")]},
        {notes:[]},{notes:[]}
      ]}),
    makeSong({title:"Blaue Stunde", artist:"Mira Lindt", composer:"M. Lindt", key:"F_MAJOR", tempo:88, instrument:"PIANO", durationText:"4:02"}),
    makeSong({title:"Wolkenbruch", artist:"Kapelle Ostwind", composer:"T. Feldmann", key:"G_MAJOR", tempo:142, instrument:"TRUMPET", durationText:"2:51"}),
    makeSong({title:"Herzschlag", artist:"Nordlicht", composer:"J. Berg", key:"E_FLAT_MAJOR", tempo:96, instrument:"SAXOPHONE", durationText:"3:40"}),
  ],
  setlists: [],
  selectedSetlist: null,
  currentSongId: null,
  activeDuration:"QUARTER", isDotted:false, isTriplet:false,
  activeAccidental:"NONE", activeArticulation:"NONE",
  selectedNoteRef: null, cursorMeasure: null, insertBeforeIndex: null, noteEditIntent: false, staffZoom: 1,
  showPiano: true, showToolbar: true, baseOctave: 4,
  isPlaying: false, playingRef: null, playTimer: null,
};
state.setlists = [
  {id:"sl1", title:"Open Air 2026", desc:"Hauptbühne", date:"14.06.2026", songIds:[state.songs[0].id, state.songs[2].id, state.songs[3].id]},
  {id:"sl2", title:"Akustik-Session", desc:"Probe Donnerstag", date:"03.09.2026", songIds:[state.songs[1].id]},
];
function n(pitch,dur,extra){ return Object.assign({pitch:pitch,dur:dur,dotted:false,triplet:false,acc:"NONE",art:"NONE",rest:false},extra||{}); }
function currentSong(){ return state.songs.find(s=>s.id===state.currentSongId); }
function keyOf(id){ return KEYS.find(k=>k.id===id); }
function instrOf(id){ return INSTRUMENTS.find(i=>i.id===id); }
function durOf(id){ return DURATIONS.find(d=>d.id===id); }
function tsName(ts){ return ts.b+"/"+ts.v; }
function totalBeats(ts){ return ts.b*(4/ts.v); }
function measureBeats(m){ return m.notes.reduce((a,nn)=>a+noteBeats(nn),0); }
function noteBeats(nn){ let b=durOf(nn.dur).beats; if(nn.dotted)b*=1.5; if(nn.triplet)b*=2/3; return b; }
function formatDuration(song){
  if(song.durationText && song.durationText!=="–") return song.durationText;
  let beats=0; song.measures.forEach(m=>beats+=measureBeats(m));
  const secs=Math.round(beats*(60/song.tempo));
  if(secs<=0) return "–";
  return Math.floor(secs/60)+":"+String(secs%60).padStart(2,"0");
}

/* ---------------- Persistenz (localStorage) ----------------
 * Ohne diese Schicht lebte die gesamte Bibliothek nur im Arbeitsspeicher:
 * jeder Neustart der App (und bei einer installierten PWA schon jedes
 * Beenden) warf alle angelegten Notenblätter weg. */
const STORAGE_KEY = "notebase.store.v1";
let saveTimer = null, storageWarned = false;

/** Bringt einen gespeicherten Song wieder in die Form, die die App erwartet –
 *  auch wenn er von einer älteren Version geschrieben wurde. */
function reviveSong(raw){
  const s = Object.assign(makeSong({}), raw || {});
  const rawMeasures = Array.isArray(s.measures) && s.measures.length ? s.measures : newMeasures(4);
  s.measures = rawMeasures.map(m=>({
    notes: (Array.isArray(m && m.notes) ? m.notes : []).filter(nt=>nt && typeof nt==="object").map(nt=>n(
      Number.isFinite(+nt.pitch) ? +nt.pitch : 60,
      durOf(nt.dur) ? nt.dur : "QUARTER",
      {
        dotted: !!nt.dotted,
        triplet: !!nt.triplet,
        acc: ACCIDENTALS.some(a=>a.id===nt.acc) ? nt.acc : "NONE",
        art: ARTICULATIONS.some(a=>a.id===nt.art) ? nt.art : "NONE",
        rest: !!nt.rest,
        lyric: nt.lyric || "",
        chord: nt.chord || ""
      }
    ))
  }));
  if(!keyOf(s.key)) s.key = "C_MAJOR";
  if(!instrOf(s.instrument)) s.instrument = "PIANO";
  if(!s.timeSig || !+s.timeSig.b || !+s.timeSig.v) s.timeSig = {b:4, v:4};
  s.timeSig = {b:+s.timeSig.b, v:+s.timeSig.v};
  s.tempo = Math.min(300, Math.max(20, +s.tempo || 120));
  s.title = String(s.title || "Ohne Titel");
  s.artist = String(s.artist || "");
  s.composer = String(s.composer || "");
  s.subtitle = String(s.subtitle || "");
  return s;
}

function storeSnapshot(){
  return {
    v: 1,
    songs: state.songs,
    setlists: state.setlists,
    ui: {
      currentSongId: state.currentSongId,
      tab: (state.tab==="EDITOR" && !currentSong()) ? "BIBLIOTHEK" : state.tab,
      showPiano: state.showPiano,
      showToolbar: state.showToolbar,
      baseOctave: state.baseOctave,
      staffZoom: state.staffZoom,
      activeDuration: state.activeDuration
    }
  };
}

function persistNow(){
  clearTimeout(saveTimer); saveTimer = null;
  try{
    localStorage.setItem(STORAGE_KEY, JSON.stringify(storeSnapshot()));
    storageWarned = false;
  }catch(e){
    // Privater Modus oder volles Speicherkontingent – einmal melden, nicht bei jedem Tastendruck.
    if(!storageWarned){
      storageWarned = true;
      toast("Speichern nicht möglich – Browser-Speicher voll oder blockiert (privates Fenster?).");
    }
  }
}
/** Fasst die vielen Render-getriebenen Speicherwünsche zu einem Schreibvorgang zusammen. */
function persist(){ clearTimeout(saveTimer); saveTimer = setTimeout(persistNow, 300); }

function loadPersisted(){
  let raw = null;
  try{ raw = localStorage.getItem(STORAGE_KEY); }catch(e){ return false; }
  if(!raw) return false;
  let data;
  try{ data = JSON.parse(raw); }catch(e){ return false; }
  if(!data || !Array.isArray(data.songs)) return false;

  state.songs = data.songs.filter(x=>x && typeof x==="object").map(reviveSong);
  state.setlists = Array.isArray(data.setlists) ? data.setlists.filter(sl=>sl && sl.id).map(sl=>({
    id: String(sl.id),
    title: String(sl.title || "Setliste"),
    desc: String(sl.desc || ""),
    date: String(sl.date || ""),
    songIds: (Array.isArray(sl.songIds) ? sl.songIds : []).filter(id=>state.songs.some(s=>s.id===id))
  })) : [];

  const ui = data.ui || {};
  if(ui.currentSongId && state.songs.some(s=>s.id===ui.currentSongId)) state.currentSongId = ui.currentSongId;
  if(ui.tab==="BIBLIOTHEK" || ui.tab==="SETLISTEN" || (ui.tab==="EDITOR" && state.currentSongId)) state.tab = ui.tab;
  if(typeof ui.showPiano==="boolean") state.showPiano = ui.showPiano;
  if(typeof ui.showToolbar==="boolean") state.showToolbar = ui.showToolbar;
  if(+ui.baseOctave>=2 && +ui.baseOctave<=6) state.baseOctave = +ui.baseOctave;
  if(+ui.staffZoom) state.staffZoom = Math.max(0.6, Math.min(2.5, +ui.staffZoom));
  if(durOf(ui.activeDuration)) state.activeDuration = ui.activeDuration;
  return true;
}

/* ---------------- Audio (ports ScoreAudioSynthesizer.kt's per-instrument additive synthesis) ---------------- */
let actx=null;
function ensureAudio(){ if(!actx) actx=new (window.AudioContext||window.webkitAudioContext)(); if(actx.state==="suspended") actx.resume(); return actx; }

function timbreSample(timbre, freq, t, progress){
  const w = 2*Math.PI*freq;
  switch(timbre){
    case "PIANO": {
      const env = Math.exp(-3.2*t) * (1 - Math.exp(-150*t));
      return (Math.sin(w*t) + 0.5*Math.sin(w*2*t) + 0.25*Math.sin(w*3*t) + 0.12*Math.sin(w*4*t)) * env;
    }
    case "FLUTE": {
      const vib = 1 + 0.008*Math.sin(2*Math.PI*5.5*t);
      const env = (1 - Math.exp(-35*t)) * (1 - Math.pow(progress,3));
      return (Math.sin(w*vib*t) + 0.15*Math.sin(w*2*vib*t)) * env;
    }
    case "VIOLIN": {
      const vib = 1 + 0.012*Math.sin(2*Math.PI*6*t);
      const env = (1 - Math.exp(-20*t)) * (1 - Math.pow(progress,2));
      return (Math.sin(w*vib*t) + 0.65*Math.sin(w*2*vib*t) + 0.45*Math.sin(w*3*vib*t) + 0.3*Math.sin(w*4*vib*t)) * 0.4 * env;
    }
    case "GUITAR": {
      const env = Math.exp(-4.5*t) * (1 - Math.exp(-250*t));
      return (Math.sin(w*t) + 0.6*Math.sin(w*2*t) + 0.3*Math.sin(w*3*t)) * env;
    }
    case "TRUMPET": {
      const env = (1 - Math.exp(-80*t)) * (1 - Math.pow(progress,4));
      return (Math.sin(w*t) + 0.8*Math.sin(w*2*t) + 0.6*Math.sin(w*3*t) + 0.4*Math.sin(w*4*t)) * 0.35 * env;
    }
    case "CELLO_BASS": {
      const env = (1 - Math.exp(-30*t)) * Math.exp(-1.8*t);
      return (Math.sin(w*t) + 0.7*Math.sin(w*2*t) + 0.4*Math.sin(w*3*t)) * 0.45 * env;
    }
    default: {
      const env = (1 - Math.exp(-50*t)) * Math.exp(-2*t);
      return Math.sin(w*t) * env;
    }
  }
}
function articulationDurationFactor(art){
  if(art==="STACCATO") return 0.45;
  if(art==="TENUTO") return 0.98;
  if(art==="FERMATA") return 1.5;
  return 0.90;
}
function synthesizeBuffer(ctx, freq, durationSeconds, timbre, volume, articulation){
  const effDur = Math.max(0.05, durationSeconds * articulationDurationFactor(articulation));
  const total = Math.max(1, Math.floor(ctx.sampleRate * effDur));
  const buf = ctx.createBuffer(1, total, ctx.sampleRate);
  const data = buf.getChannelData(0);
  const vol = Math.min(1, Math.max(0.05, volume));
  for(let i=0;i<total;i++){
    const t = i/ctx.sampleRate;
    const raw = timbreSample(timbre, freq, t, i/total);
    data[i] = Math.max(-1, Math.min(1, raw*vol));
  }
  return buf;
}
function playTone(midi, seconds, instrumentId, articulation){
  try{
    const ctx=ensureAudio();
    const instr = instrOf(instrumentId) || {timbre:"DEFAULT", transpose:0};
    const freq = midiFreq(midi + (instr.transpose||0));
    const buf = synthesizeBuffer(ctx, freq, Math.max(0.15,seconds), instr.timbre, 0.55, articulation||"NONE");
    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.connect(ctx.destination);
    src.start();
  }catch(e){}
}

/* ---------------- Icons ---------------- */
const ICON = {
  menu:'<span class="burger"><span></span><span></span><span></span></span>',
  add:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>',
  search:'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.3-4.3"/></svg>',
  clear:'<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>',
  edit:'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4z"/></svg>',
  trash:'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M19 6l-1 14H6L5 6"/></svg>',
  back:'<svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>',
  undo:'<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><path d="M9 14L4 9l5-5"/><path d="M4 9h10.5A5.5 5.5 0 0120 14.5v0A5.5 5.5 0 0114.5 20H11"/></svg>',
  redo:'<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><path d="M15 14l5-5-5-5"/><path d="M20 9H9.5A5.5 5.5 0 004 14.5v0A5.5 5.5 0 009.5 20H13"/></svg>',
  play:'<svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>',
  stop:'<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="6" width="12" height="12" rx="1.5"/></svg>',
  download:'<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v13"/><path d="M7 11l5 5 5-5"/><path d="M4 20h16"/></svg>',
  more:'<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="12" cy="19" r="1.6"/></svg>',
  keyboard:'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="6" width="20" height="12" rx="2"/><path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M6 14h12"/></svg>',
  library:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>',
  queue:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 6H8M21 12H8M21 18H8M3 6h.01M3 12h.01M3 18h.01"/></svg>',
  editnote:'<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2v-5"/><path d="M18.5 2.5a2.1 2.1 0 013 3L11 16l-4 1 1-4z"/></svg>',
  speed:'<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22a10 10 0 100-20 10 10 0 000 20z"/><path d="M12 12l4-3"/></svg>',
  piano:'<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M7 4v10M12 4v10M17 4v10"/></svg>',
  doc:'<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6"/></svg>',
  arrowUp:'<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg>',
  arrowDown:'<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M19 12l-7 7-7-7"/></svg>',
  arrowLeft:'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>',
  arrowRight:'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>',
  musicOff:'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/><path d="M2 2l20 20"/></svg>',
  backspace:'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 5H8l-6 7 6 7h13a2 2 0 002-2V7a2 2 0 00-2-2z"/><path d="M13.5 9.5l5 5M18.5 9.5l-5 5"/></svg>',
  speaker:'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 9v6h4l5 5V4L8 9H4z"/><path d="M16.5 8.5a5 5 0 010 7M19 6a8.5 8.5 0 010 12"/></svg>',
  sliders:'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 6h8M16 6h4M4 12h2M8 12h12M4 18h12M20 18h0"/><circle cx="14" cy="6" r="2" fill="currentColor" stroke="none"/><circle cx="6" cy="12" r="2" fill="currentColor" stroke="none"/><circle cx="16" cy="18" r="2" fill="currentColor" stroke="none"/></svg>',
  minus:'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M5 12h14"/></svg>',
  zoomReset:'<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 9-9"/><path d="M3 4v5h5"/></svg>',
  chevronLeft:'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M15 6l-6 6 6 6"/></svg>',
  chevronRight:'<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6l6 6-6 6"/></svg>',
};

/* ---------------- Toast ---------------- */
let toastTimer=null;
function toast(msg){
  const el=document.getElementById("toast");
  el.textContent=msg; el.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer=setTimeout(()=>el.classList.remove("show"), 2200);
}

/* ---------------- Header ---------------- */
function renderHeader(){
  const el=document.getElementById("appHeader");
  if(state.tab==="EDITOR" && currentSong()){
    const song=currentSong();
    const key=keyOf(song.key), instr=instrOf(song.instrument);
    el.innerHTML = '<div class="editor-topbar">'
      + '<button class="icon-btn" id="btnBackLib" title="Zurück zur Bibliothek">'+ICON.back+'</button>'
      + '<div class="editor-title-block">'
        + '<div class="editor-title">'+esc(song.title)+'</div>'
        + '<div class="editor-subtitle">'+esc(song.artist||"Song")+' • '+esc(instr.name.split("/")[0].trim())+' • '+esc(key.short)+' • '+tsName(song.timeSig)+' • '+song.tempo+' BPM</div>'
      + '</div>'
      + '<button class="icon-btn" id="btnEditProps" title="Titel &amp; Angaben bearbeiten">'+ICON.edit+'</button>'
      + '<button class="icon-btn" id="btnUndo" title="Rückgängig">'+ICON.undo+'</button>'
      + '<button class="icon-btn" id="btnRedo" title="Wiederholen">'+ICON.redo+'</button>'
      + '<button class="play-fab'+(state.isPlaying?' playing':'')+'" id="btnPlay" title="Abspielen">'+(state.isPlaying?ICON.stop:ICON.play)+'</button>'
      + '<button class="icon-btn amberify" id="btnExport" title="Exportieren">'+ICON.download+'</button>'
      + '<button class="icon-btn" id="btnMore" title="Optionen">'+ICON.more+'</button>'
    + '</div>';
    document.getElementById("btnBackLib").onclick=()=>setTab("BIBLIOTHEK");
    document.getElementById("btnEditProps").onclick=openPropertiesModal;
    document.getElementById("btnUndo").onclick=()=>toast("Rückgängig (Demo: Verlauf nicht simuliert)");
    document.getElementById("btnRedo").onclick=()=>toast("Wiederholen (Demo: Verlauf nicht simuliert)");
    document.getElementById("btnPlay").onclick=togglePlay;
    document.getElementById("btnExport").onclick=()=>openExportModal();
    document.getElementById("btnMore").onclick=openMoreMenu;
  } else {
    el.innerHTML = '<div class="header-left">'
      + '<button class="hbtn" id="btnMenu" title="Menü">'+ICON.menu+'</button>'
      + '<div class="brand" id="brandHome"><div class="brand-dot"></div><div class="brand-name">NoteBase</div></div>'
      + '<div class="tabgroup">'
        + '<button class="tab-btn'+(state.tab==="BIBLIOTHEK"?' active':'')+'" data-tab="BIBLIOTHEK">Bibliothek</button>'
        + '<button class="tab-btn'+(state.tab==="SETLISTEN"?' active':'')+'" data-tab="SETLISTEN">Setlisten</button>'
      + '</div>'
    + '</div>'
    + '<button class="btn-amber" id="btnAddSong">'+ICON.add+'<span>Song</span></button>';
    document.getElementById("btnMenu").onclick=()=>toggleDrawer(true);
    document.getElementById("brandHome").onclick=()=>setTab("BIBLIOTHEK");
    el.querySelectorAll(".tab-btn").forEach(b=>b.onclick=()=>setTab(b.dataset.tab));
    document.getElementById("btnAddSong").onclick=openAddSongModal;
  }
}

/* ---------------- Drawer ---------------- */
function renderDrawer(){
  const nav=document.getElementById("drawerNav");
  const items=[
    {tab:"BIBLIOTHEK", icon:ICON.library, label:"Song-Bibliothek"},
    {tab:"SETLISTEN", icon:ICON.queue, label:"Setlisten"},
    {tab:"EDITOR", icon:ICON.editnote, label:"Notenblatt-Editor"},
  ];
  nav.innerHTML = items.map(it=>{
    const active = state.tab===it.tab;
    return '<button class="drawer-item'+(active?' active':'')+'" data-tab="'+it.tab+'"><span class="di-icon">'+it.icon+'</span>'+it.label+'</button>';
  }).join("");
  nav.querySelectorAll(".drawer-item").forEach(b=>b.onclick=()=>{
    if(b.dataset.tab==="EDITOR" && !currentSong()){
      if(state.songs.length){ state.currentSongId=state.songs[0].id; } else { toast("Noch kein Song vorhanden – zuerst einen anlegen."); toggleDrawer(false); return; }
    }
    setTab(b.dataset.tab); toggleDrawer(false);
  });
  const quick=document.getElementById("drawerQuick");
  quick.innerHTML =
    '<button class="drawer-item" id="qTempo"><span class="di-icon">'+ICON.speed+'</span>Metronom &amp; Tempo</button>'
    +'<button class="drawer-item" id="qInstr"><span class="di-icon">'+ICON.piano+'</span>Instrumente &amp; Vorzeichen</button>'
    +'<button class="drawer-item" id="qExport"><span class="di-icon">'+ICON.doc+'</span>PDF &amp; Bild Exportieren</button>';
  document.getElementById("qTempo").onclick=()=>{ if(!currentSong()){toast("Öffne zuerst einen Song im Editor.");toggleDrawer(false);return;} toggleDrawer(false); openTempoModal(); };
  document.getElementById("qInstr").onclick=()=>{ if(!currentSong()){toast("Öffne zuerst einen Song im Editor.");toggleDrawer(false);return;} toggleDrawer(false); openInstrumentModal(); };
  document.getElementById("qExport").onclick=()=>{ if(!currentSong()){toast("Öffne zuerst einen Song im Editor.");toggleDrawer(false);return;} toggleDrawer(false); openExportModal(); };
}
function toggleDrawer(open){
  state.drawerOpen=open;
  document.getElementById("drawer").classList.toggle("open",open);
  document.getElementById("scrim").classList.toggle("open",open);
}
document.addEventListener("DOMContentLoaded",()=>{
  document.getElementById("scrim").addEventListener("click",()=>toggleDrawer(false));
});

function esc(s){ return String(s==null?"":s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c])); }

function setTab(tab){
  state.tab=tab;
  document.querySelectorAll(".view").forEach(v=>v.classList.remove("active"));
  document.getElementById("view-"+tab).classList.add("active");
  document.getElementById("editorDock").classList.toggle("active", tab==="EDITOR");
  renderHeader(); renderDrawer();
  if(tab==="BIBLIOTHEK") renderLibrary();
  if(tab==="SETLISTEN") renderSetlists();
  if(tab==="EDITOR") renderEditor();
}

/* ---------------- Library ---------------- */
let libSearch="";
function renderLibrary(){
  const el=document.getElementById("view-BIBLIOTHEK");
  const filtered=state.songs.filter(s=>{
    if(!libSearch) return true;
    const q=libSearch.toLowerCase();
    return s.title.toLowerCase().includes(q)||s.artist.toLowerCase().includes(q)||s.composer.toLowerCase().includes(q)||keyOf(s.key).short.toLowerCase().includes(q);
  });
  el.innerHTML = '<div class="view-head"><div class="view-title">Song-Bibliothek</div>'
    + '<button class="btn-amber" id="libAddBtn">'+ICON.add+'<span>Song hinzufügen</span></button></div>'
    + '<div class="search-wrap">'+ICON.search+'<input id="libSearchInput" placeholder="Songs nach Titel, Künstler oder Tonart suchen..." value="'+esc(libSearch)+'">'
      + (libSearch?'<button class="icon-btn" id="libClearBtn" style="position:absolute;right:2px;top:2px">'+ICON.clear+'</button>':'')
    + '</div>'
    + '<div class="count-line">'+filtered.length+' Songs '+(libSearch?'gefunden':'in der Bibliothek')+'</div>'
    + (filtered.length? '<div class="card-list">'+filtered.map(songCardHtml).join("")+'</div>'
        : '<div class="empty-state">'+ICON.library+'<div class="t1">'+(libSearch?'Keine Songs gefunden':'Noch keine Songs vorhanden')+'</div><div class="t2">Erstelle deinen ersten Song mit dem Button oben</div></div>');

  document.getElementById("libAddBtn").onclick=openAddSongModal;
  document.getElementById("libSearchInput").oninput=(e)=>{ libSearch=e.target.value; renderLibrary(); };
  const clearBtn=document.getElementById("libClearBtn");
  if(clearBtn) clearBtn.onclick=()=>{ libSearch=""; renderLibrary(); };
  el.querySelectorAll(".song-card").forEach(c=>{
    c.onclick=(e)=>{ if(e.target.closest("[data-action]")) return; openSong(c.dataset.id); };
  });
  el.querySelectorAll("[data-action=edit]").forEach(b=>b.onclick=()=>openSong(b.closest(".song-card").dataset.id));
  el.querySelectorAll("[data-action=delete]").forEach(b=>b.onclick=()=>confirmDeleteSong(b.closest(".song-card").dataset.id));
  persist();
}
function songCardHtml(song){
  const key=keyOf(song.key);
  return '<div class="song-card" data-id="'+song.id+'">'
    + '<div class="song-main"><div class="song-title">'+esc(song.title)+'</div>'
      + '<div class="song-sub">— · '+esc(song.artist||song.composer)+'</div></div>'
    + '<div class="song-meta">'
      + '<div class="meta-col bpm"><span class="lbl">BPM</span><span class="val">'+song.tempo+'</span></div>'
      + '<div class="meta-col"><span class="lbl">Tonart</span><span class="val">'+key.short+'</span></div>'
      + '<div class="meta-col"><span class="lbl">Dauer</span><span class="val">'+formatDuration(song)+'</span></div>'
      + '<button class="icon-btn amberify" data-action="edit" title="Bearbeiten">'+ICON.edit+'</button>'
      + '<button class="icon-btn" data-action="delete" title="Löschen">'+ICON.trash+'</button>'
    + '</div></div>';
}
function confirmDeleteSong(id){
  const song=state.songs.find(s=>s.id===id); if(!song) return;
  openModal('<h3>Song löschen?</h3><p style="color:var(--text-2);font-size:13.5px;line-height:1.5">Möchtest du den Song &bdquo;'+esc(song.title)+'&ldquo; wirklich aus deiner NoteBase-Bibliothek entfernen?</p>'
    + '<div class="modal-actions"><button class="btn-ghost" id="mCancel">Abbrechen</button>'
    + '<button class="btn-amber" style="background:var(--accent-red);color:#fff" id="mDel">Löschen</button></div>');
  document.getElementById("mCancel").onclick=closeModal;
  document.getElementById("mDel").onclick=()=>{
    state.songs=state.songs.filter(s=>s.id!==id);
    state.setlists.forEach(sl=>sl.songIds=sl.songIds.filter(i=>i!==id));
    persistNow();
    closeModal(); toast("Song gelöscht."); renderLibrary();
  };
}
function openSong(id){
  state.currentSongId=id; state.selectedNoteRef=null; state.cursorMeasure=null;
  state.insertBeforeIndex=null; state.noteEditIntent=false;
  setTab("EDITOR");
}

/* ---------------- Setlists ---------------- */
function renderSetlists(){
  const el=document.getElementById("view-SETLISTEN");
  if(state.selectedSetlist){ renderSetlistDetail(el); return; }
  el.innerHTML = '<div class="view-head"><div class="view-title">Setlisten</div>'
    + '<button class="btn-amber" id="createSetlistBtn">'+ICON.add+'<span>Setliste erstellen</span></button></div>'
    + (state.setlists.length? '<div class="card-list">'+state.setlists.map(setlistCardHtml).join("")+'</div>'
       : '<div class="empty-state">'+ICON.queue+'<div class="t1">Noch keine Setlisten angelegt</div><div class="t2">Stelle deine Songs für Konzerte und Proben zusammen</div></div>');
  document.getElementById("createSetlistBtn").onclick=openCreateSetlistModal;
  el.querySelectorAll(".setlist-card").forEach(c=>c.onclick=(e)=>{
    if(e.target.closest("[data-action=delete]")) return;
    state.selectedSetlist=c.dataset.id; renderSetlists();
  });
  el.querySelectorAll("[data-action=delete]").forEach(b=>b.onclick=(e)=>{
    e.stopPropagation();
    state.setlists=state.setlists.filter(s=>s.id!==b.closest(".setlist-card").dataset.id);
    renderSetlists();
  });
  persist();
}
function setlistCardHtml(sl){
  const songs=sl.songIds.map(id=>state.songs.find(s=>s.id===id)).filter(Boolean);
  const avg=songs.length? Math.round(songs.reduce((a,s)=>a+s.tempo,0)/songs.length) : 120;
  return '<div class="setlist-card" data-id="'+sl.id+'">'
    + '<div><div class="setlist-title">'+esc(sl.title)+'</div><div class="setlist-sub">'+esc(sl.desc)+' • '+esc(sl.date)+'</div>'
      + '<div class="setlist-row"><span class="pill">'+songs.length+' Songs</span><span style="color:var(--text-3);font-size:12px">Ø '+avg+' BPM</span></div></div>'
    + '<button class="icon-btn" data-action="delete" title="Löschen">'+ICON.trash+'</button></div>';
}
function renderSetlistDetail(el){
  const sl=state.setlists.find(s=>s.id===state.selectedSetlist);
  const songs=sl.songIds.map(id=>state.songs.find(s=>s.id===id)).filter(Boolean);
  el.innerHTML = '<div style="display:flex;align-items:center;gap:8px;margin-bottom:14px">'
    + '<button class="icon-btn" id="backBtn">'+ICON.back+'</button>'
    + '<div style="flex:1"><div style="font-size:19px;font-weight:700">'+esc(sl.title)+'</div><div style="font-size:12.5px;color:var(--text-2)">'+esc(sl.desc)+' • '+esc(sl.date)+'</div></div>'
    + '<button class="btn-amber" id="addToSetlistBtn">'+ICON.add+'<span>Song +</span></button></div>'
    + (songs.length? songs.map((song,i)=>
        '<div class="detail-song-row" data-id="'+song.id+'">'
        + '<div style="display:flex;align-items:center;gap:11px;min-width:0"><div class="idx-badge">'+(i+1)+'</div>'
        + '<div style="min-width:0"><div style="font-weight:700;font-size:15px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">'+esc(song.title)+'</div>'
        + '<div style="font-size:11.5px;color:var(--text-2)">'+esc(song.artist)+' • '+song.tempo+' BPM • '+keyOf(song.key).short+'</div></div></div>'
        + '<div style="display:flex;gap:2px">'
          + '<button class="icon-btn" data-act="up" '+(i===0?'disabled':'')+'>'+ICON.arrowUp+'</button>'
          + '<button class="icon-btn" data-act="down" '+(i===songs.length-1?'disabled':'')+'>'+ICON.arrowDown+'</button>'
          + '<button class="icon-btn" data-act="rm">'+ICON.trash+'</button>'
        + '</div></div>').join("")
      : '<div class="empty-state">Noch keine Songs in dieser Setliste. Klicke auf &bdquo;Song +&ldquo;.</div>');
  document.getElementById("backBtn").onclick=()=>{ state.selectedSetlist=null; renderSetlists(); };
  document.getElementById("addToSetlistBtn").onclick=()=>openAddToSetlistModal(sl);
  persist();
  el.querySelectorAll(".detail-song-row").forEach(row=>{
    row.querySelector('[data-act=up]').onclick=(e)=>{e.stopPropagation();moveInSetlist(sl,row.dataset.id,-1);};
    row.querySelector('[data-act=down]').onclick=(e)=>{e.stopPropagation();moveInSetlist(sl,row.dataset.id,1);};
    row.querySelector('[data-act=rm]').onclick=(e)=>{e.stopPropagation();sl.songIds=sl.songIds.filter(i=>i!==row.dataset.id);renderSetlists();};
    row.onclick=()=>openSong(row.dataset.id);
  });
}
function moveInSetlist(sl,id,dir){
  const idx=sl.songIds.indexOf(id); const j=idx+dir;
  if(j<0||j>=sl.songIds.length) return;
  [sl.songIds[idx],sl.songIds[j]]=[sl.songIds[j],sl.songIds[idx]];
  renderSetlists();
}
function openCreateSetlistModal(){
  openModal('<h3>Neue Setliste erstellen</h3>'
    + '<div class="field"><label>Titel der Setliste (z.B. Open Air 2026)</label><input id="fTitle"></div>'
    + '<div class="field"><label>Beschreibung (z.B. Hauptbühne)</label><input id="fDesc"></div>'
    + '<div class="field"><label>Datum / Anlass</label><input id="fDate" value="2026"></div>'
    + '<div class="modal-actions"><button class="btn-ghost" id="mCancel">Abbrechen</button><button class="btn-amber" id="mCreate">Erstellen</button></div>');
  document.getElementById("mCancel").onclick=closeModal;
  document.getElementById("mCreate").onclick=()=>{
    const title=document.getElementById("fTitle").value.trim();
    if(!title){ toast("Bitte einen Titel eingeben."); return; }
    state.setlists.push({id:"sl"+Math.random().toString(36).slice(2), title, desc:document.getElementById("fDesc").value, date:document.getElementById("fDate").value, songIds:[]});
    closeModal(); renderSetlists();
  };
}
function openAddToSetlistModal(sl){
  const avail=state.songs.filter(s=>!sl.songIds.includes(s.id));
  openModal('<h3>Song zur Setliste hinzufügen</h3>'
    + (avail.length? '<div class="option-list">'+avail.map(s=>
        '<div class="option-row" data-id="'+s.id+'"><div><div class="option-name">'+esc(s.title)+'</div><div class="option-sub">'+esc(s.artist)+' • '+s.tempo+' BPM</div></div>'+ICON.add+'</div>').join("")+'</div>'
      : '<p style="color:var(--text-2);font-size:13.5px">Alle Songs sind bereits in dieser Setliste.</p>')
    + '<div class="modal-actions"><button class="btn-ghost" id="mClose">Schließen</button></div>');
  document.querySelectorAll(".option-row").forEach(r=>r.onclick=()=>{ sl.songIds.push(r.dataset.id); closeModal(); renderSetlists(); });
  document.getElementById("mClose").onclick=closeModal;
}

/* ---------------- Editor ---------------- */
function renderEditor(){
  const el=document.getElementById("view-EDITOR");
  const dock=document.getElementById("editorDock");
  const song=currentSong();
  if(!song){
    el.innerHTML='<div class="empty-state">'+ICON.editnote+'<div class="t1">Kein Song geöffnet</div><div class="t2">Wähle einen Song aus der Bibliothek.</div></div>';
    dock.innerHTML="";
    return;
  }
  el.innerHTML = '<div class="staff-wrap" id="staffWrap">'
      + '<div class="zoom-controls">'
        + '<button class="round-btn" id="zoomOutBtn" title="Verkleinern">'+ICON.minus+'</button>'
        + '<span class="zoom-label" id="zoomLabel">100%</span>'
        + '<button class="round-btn" id="zoomInBtn" title="Vergrößern">'+ICON.add+'</button>'
        + (state.staffZoom!==1 ? '<button class="round-btn" id="zoomResetBtn" title="Zoom zurücksetzen">'+ICON.zoomReset+'</button>' : '')
      + '</div>'
      + '<div class="staff-pages" id="staffPaper"></div>'
    + '</div>';
  renderStaff();
  renderEditorDock();
  setupZoomControls();
}

function setupZoomControls(){
  const wrap = document.getElementById("staffWrap");
  if(!wrap) return;
  applyZoom(state.staffZoom);
  document.getElementById("zoomInBtn").onclick=()=>applyZoom(state.staffZoom+0.2);
  document.getElementById("zoomOutBtn").onclick=()=>applyZoom(state.staffZoom-0.2);
  const resetBtn = document.getElementById("zoomResetBtn");
  if(resetBtn) resetBtn.onclick=()=>applyZoom(1);

  // Pinch-to-zoom with two touch points
  let pinchStartDist = null, pinchStartZoom = 1;
  wrap.addEventListener("touchstart", (e)=>{
    if(e.touches.length===2){
      pinchStartDist = touchDistance(e.touches);
      pinchStartZoom = state.staffZoom;
    }
  }, {passive:true});
  wrap.addEventListener("touchmove", (e)=>{
    if(e.touches.length===2 && pinchStartDist){
      e.preventDefault();
      const factor = touchDistance(e.touches) / pinchStartDist;
      applyZoom(pinchStartZoom*factor, true);
    }
  }, {passive:false});
  wrap.addEventListener("touchend", (e)=>{ if(e.touches.length<2) pinchStartDist=null; });

  wrap.ondblclick = ()=>applyZoom(state.staffZoom===1 ? 1.6 : 1);
}
function touchDistance(touches){
  const dx=touches[0].clientX-touches[1].clientX, dy=touches[0].clientY-touches[1].clientY;
  return Math.hypot(dx,dy);
}
function applyZoom(zoom, skipLabelButtonRebuild){
  state.staffZoom = Math.max(0.6, Math.min(2.5, zoom));
  const paper = document.getElementById("staffPaper");
  const label = document.getElementById("zoomLabel");
  if(paper) paper.style.transform = "scale("+state.staffZoom+")";
  if(label) label.textContent = Math.round(state.staffZoom*100)+"%";
  persist();
  if(!skipLabelButtonRebuild){
    const resetBtn = document.getElementById("zoomResetBtn");
    const controls = document.querySelector(".zoom-controls");
    if(state.staffZoom!==1 && !resetBtn && controls){
      controls.insertAdjacentHTML("beforeend",'<button class="round-btn" id="zoomResetBtn" title="Zoom zurücksetzen">'+ICON.zoomReset+'</button>');
      document.getElementById("zoomResetBtn").onclick=()=>applyZoom(1);
    } else if(state.staffZoom===1 && resetBtn){
      resetBtn.remove();
    }
  }
}

/**
 * Pinned bottom dock: a slim always-visible handle with two single toggle
 * buttons, plus the toolbar/piano panels each independently shown or hidden.
 */
function renderEditorDock(){
  const dock=document.getElementById("editorDock");
  dock.innerHTML = '<div class="dock-handle">'
      + '<button class="dock-toggle'+(state.showToolbar?' active':'')+'" id="dockToggleToolbar">'+ICON.sliders+'<span>Werkzeuge</span></button>'
      + '<button class="dock-toggle'+(state.showPiano?' active':'')+'" id="dockTogglePiano">'+ICON.keyboard+'<span>Klaviatur</span></button>'
    + '</div>'
    + '<div class="editor-dock-scroll" id="editorDockScroll">'
      + (state.showToolbar? '<div class="toolbar-card" id="toolbarCard"></div>' : '')
      + (state.showPiano? '<div id="pianoSlot"></div>' : '')
    + '</div>';
  document.getElementById("dockToggleToolbar").onclick=()=>{ state.showToolbar=!state.showToolbar; renderEditorDock(); };
  document.getElementById("dockTogglePiano").onclick=()=>{ state.showPiano=!state.showPiano; renderEditorDock(); };
  if(state.showToolbar) renderToolbar();
  if(state.showPiano) renderPiano();
  persist();
}

const MIN_NOTE_SLOT=26, NOTE_SLOT_PAD=10;

/** Lays out a hand's notes left-to-right, each getting width proportional to its
 *  duration (with a floor so 16th notes etc. don't crowd together). */
function layoutNotes(items, beatWidth){
  let cx=NOTE_SLOT_PAD; const slots=[]; const gapEdges=[NOTE_SLOT_PAD];
  items.forEach(it=>{
    const w=Math.max(MIN_NOTE_SLOT, noteBeats(it.note)*beatWidth);
    slots.push({note:it.note, idx:it.idx, x:cx+w*0.4, w});
    cx+=w;
    gapEdges.push(cx);
  });
  return {width:cx+NOTE_SLOT_PAD, slots, gapEdges};
}
/** Splits a measure's notes into right-hand (treble) / left-hand (bass) for the
 *  piano grand staff, by pitch (middle C and above = treble) — a simplification
 *  since the data model doesn't track which hand a note belongs to. */
function splitHands(notes){
  const treble=[], bass=[];
  notes.forEach((nt,idx)=>{ (!nt.rest && nt.pitch<60 ? bass : treble).push({note:nt, idx}); });
  return {treble,bass};
}
function bracePath(x, yTop, yBottom){
  const midY=(yTop+yBottom)/2;
  return 'M '+(x+8)+' '+yTop+' C '+x+' '+yTop+' '+(x+4)+' '+(midY-18)+' '+(x-7)+' '+midY
    +' C '+(x+4)+' '+(midY+18)+' '+x+' '+yBottom+' '+(x+8)+' '+yBottom;
}
/** Renders one note or rest as an SVG snippet against a given staff's yFor().
 *  opts.interactive === false strips every editor-only element (hit targets,
 *  selection and playback highlights) so the same routine can produce a clean
 *  sheet for PDF/PNG export. */
function drawNote(nt, mi, idx, nx, yFor, clefForPitch, opts){
  opts = opts || {};
  const live = opts.interactive !== false;
  let s='';
  const isSel = live && state.selectedNoteRef && state.selectedNoteRef.m===mi && state.selectedNoteRef.i===idx;
  const isPlay = live && state.playingRef && state.playingRef.m===mi && state.playingRef.i===idx;
  const hitRect = (hx,hy,hw,hh)=> live
    ? '<rect data-m="'+mi+'" data-i="'+idx+'" class="notehit" x="'+hx+'" y="'+hy+'" width="'+hw+'" height="'+hh+'" fill="#000000" opacity="0" pointer-events="all" style="cursor:pointer"/>'
    : '';
  const noteTag = live ? ' data-m="'+mi+'" data-i="'+idx+'" class="notehit"' : '';
  if(nt.rest){
    const ry = yFor(2);
    if(isPlay) s += '<circle cx="'+nx+'" cy="'+ry+'" r="15" fill="#F59E0B" opacity="0.35" pointer-events="none"/>';
    if(isSel) s += '<circle cx="'+nx+'" cy="'+ry+'" r="15" fill="#3B82F6" opacity="0.3" pointer-events="none"/>';
    s += hitRect(nx-11, ry-18, 22, 36);
    s += '<text'+noteTag+' x="'+nx+'" y="'+(ry+7)+'" font-size="26" text-anchor="middle" fill="#171522" pointer-events="none">'+REST_GLYPH[nt.dur]+'</text>';
    if(nt.dotted) s += '<circle cx="'+(nx+13)+'" cy="'+(ry-3)+'" r="2" fill="#171522" pointer-events="none"/>';
  } else {
    const step = staffStep(nt.pitch+((ACCIDENTALS.find(a=>a.id===nt.acc)||{shift:0}).shift), clefForPitch);
    const y = yFor(step);
    for(let sN=-1; sN>=Math.ceil(step-0.1) && step<-0.5; sN--){ s+='<line x1="'+(nx-11)+'" y1="'+yFor(sN)+'" x2="'+(nx+11)+'" y2="'+yFor(sN)+'" stroke="#171522" stroke-width="1.2"/>'; if(sN<Math.floor(step)) break; }
    for(let sN=5; sN<=Math.floor(step+0.1) && step>4.5; sN++){ s+='<line x1="'+(nx-11)+'" y1="'+yFor(sN)+'" x2="'+(nx+11)+'" y2="'+yFor(sN)+'" stroke="#171522" stroke-width="1.2"/>'; if(sN>Math.ceil(step)) break; }
    if(isSel) s += '<circle cx="'+nx+'" cy="'+y+'" r="15" fill="#3B82F6" opacity="0.3" pointer-events="none"/>';
    if(isPlay) s += '<circle cx="'+nx+'" cy="'+y+'" r="15" fill="#F59E0B" opacity="0.4" pointer-events="none"/>';
    const accSym=(ACCIDENTALS.find(a=>a.id===nt.acc)||{}).symbol;
    if(accSym && nt.acc!=="NONE") s += '<text x="'+(nx-18)+'" y="'+(y+6)+'" font-size="16" fill="#171522" pointer-events="none">'+accSym+'</text>';
    s += hitRect(nx-11, y-20, 22, 36);
    s += '<text'+noteTag+' x="'+nx+'" y="'+(y+8)+'" font-size="30" text-anchor="middle" fill="#171522" pointer-events="none">'+durOf(nt.dur).symbol+'</text>';
    if(nt.dotted) s += '<circle cx="'+(nx+13)+'" cy="'+(y-3)+'" r="2" fill="#171522" pointer-events="none"/>';
    if(nt.art && nt.art!=="NONE") s += '<text x="'+nx+'" y="'+(y-16)+'" font-size="13" text-anchor="middle" fill="#171522" pointer-events="none">'+(ARTICULATIONS.find(a=>a.id===nt.art)||{}).symbol+'</text>';
    if(opts.chordY!=null && nt.chord) s += '<text x="'+nx+'" y="'+opts.chordY+'" font-size="12" font-weight="700" text-anchor="middle" fill="#0A50A0" pointer-events="none">'+esc(nt.chord)+'</text>';
    if(opts.lyricY!=null && nt.lyric) s += '<text x="'+nx+'" y="'+opts.lyricY+'" font-size="11" font-style="italic" text-anchor="middle" fill="#4B4A57" pointer-events="none">'+esc(nt.lyric)+'</text>';
  }
  return s;
}

const EXPORT_FONT_STACK = "'Source Serif 4','Bravura Text','Segoe UI Symbol','Apple Symbols',Georgia,'Times New Roman',serif";

/**
 * Packs measures into systems (line breaks) that fit a DIN-A4-proportioned page width,
 * then packs systems into pages (page breaks) that fit the A4-proportioned page height —
 * mirroring how ScoreSheetExporter.kt would paginate a real PDF export. Measure width
 * follows actual note content (denser measures take more room), and piano scores get a
 * full grand staff (treble + bass, braced) like real piano sheet music.
 *
 * Returns the finished SVG string per page. The on-screen editor and the PDF/PNG
 * export both go through here, so what is printed is exactly what is displayed.
 *   opts.pageWidth   – page width in px, the height follows the A4 ratio
 *   opts.interactive – true for the editor, false for a clean export sheet
 */
function buildScorePages(song, opts){
  opts = opts || {};
  const live = opts.interactive !== false;
  const clef = instrOf(song.instrument).clef;
  const key=keyOf(song.key);
  const isGrand = song.instrument==="PIANO";
  const LINE_GAP=15, beatWidth=32;
  const marginLeft = isGrand? 80 : 62, marginRight=18;
  const GRAND_STAFF_GAP=46;
  const SYSTEM_HEIGHT = isGrand? 232 : 150;
  const A4_RATIO = 297/210;

  const pageWidth = Math.round(opts.pageWidth || 700);
  const pageHeight = Math.round(pageWidth * A4_RATIO);
  const usableWidth = pageWidth - marginLeft - marginRight;
  const marginTopFirst = 92, marginTopCont = 40, marginBottom = 46;

  // 1) Layout each measure by its actual note content, then pack into systems by page width
  const measureLayouts = song.measures.map(m=>{
    if(!m.notes.length){
      const width = Math.max(2.6, totalBeats(song.timeSig))*beatWidth*0.55;
      return isGrand? {width, trebleSlots:[], bassSlots:[], trebleGapEdges:[NOTE_SLOT_PAD], bassGapEdges:[NOTE_SLOT_PAD]}
                     : {width, slots:[], gapEdges:[NOTE_SLOT_PAD]};
    }
    if(isGrand){
      const {treble,bass} = splitHands(m.notes);
      const tl=layoutNotes(treble,beatWidth), bl=layoutNotes(bass,beatWidth);
      const width = Math.max(tl.width, bl.width);
      const scaleFactor=(layout)=>{
        if(!layout.slots.length || layout.width>=width-0.01) return 1;
        const innerOld=layout.width-2*NOTE_SLOT_PAD, innerNew=width-2*NOTE_SLOT_PAD;
        return innerOld>0? innerNew/innerOld : 1;
      };
      const stretchX=(v,f)=> NOTE_SLOT_PAD+(v-NOTE_SLOT_PAD)*f;
      const tf=scaleFactor(tl), bf=scaleFactor(bl);
      return {
        width,
        trebleSlots: tl.slots.map(s=>Object.assign({},s,{x:stretchX(s.x,tf)})),
        bassSlots: bl.slots.map(s=>Object.assign({},s,{x:stretchX(s.x,bf)})),
        trebleGapEdges: tl.gapEdges.map(v=>stretchX(v,tf)),
        bassGapEdges: bl.gapEdges.map(v=>stretchX(v,bf)),
      };
    } else {
      const items = m.notes.map((nt,idx)=>({note:nt,idx}));
      const l = layoutNotes(items, beatWidth);
      return {width:l.width, slots:l.slots, gapEdges:l.gapEdges};
    }
  });
  const measureWidths = measureLayouts.map(l=>l.width);

  const systems=[]; let sys=[], sysW=0;
  song.measures.forEach((m,mi)=>{
    const w=measureWidths[mi];
    if(sys.length && sysW+w > usableWidth){ systems.push(sys); sys=[]; sysW=0; }
    sys.push(mi); sysW+=w;
  });
  if(sys.length) systems.push(sys);
  if(!systems.length) systems.push([]);

  // 2) Pack systems into pages by available page height
  const firstPageCapacity = Math.max(1, Math.floor((pageHeight-marginTopFirst-marginBottom)/SYSTEM_HEIGHT));
  const contPageCapacity = Math.max(1, Math.floor((pageHeight-marginTopCont-marginBottom)/SYSTEM_HEIGHT));
  const pages=[]; let remaining=systems.slice();
  pages.push(remaining.splice(0, firstPageCapacity));
  while(remaining.length) pages.push(remaining.splice(0, contPageCapacity));

  const tempoLabel=(TEMPO_PRESETS.slice().sort((a,b)=>Math.abs(a.bpm-song.tempo)-Math.abs(b.bpm-song.tempo))[0]).it;
  const kt = key.count===0 ? "–" : (key.count+(key.sharp?"♯":"♭"));

  const out=[];
  pages.forEach((pageSystems,pageIdx)=>{
    const isFirst = pageIdx===0;
    const marginTop = isFirst? marginTopFirst : marginTopCont;
    let svg = '<svg width="'+pageWidth+'" height="'+pageHeight+'" viewBox="0 0 '+pageWidth+' '+pageHeight+'" xmlns="http://www.w3.org/2000/svg"'
            + (live? '' : ' font-family="'+EXPORT_FONT_STACK+'"')+'>';
    // Exported pages carry their own white page ground; on screen the CSS supplies it.
    if(!live) svg += '<rect x="0" y="0" width="'+pageWidth+'" height="'+pageHeight+'" fill="#FFFFFF"/>';

    if(isFirst){
      svg += '<text x="'+(pageWidth/2)+'" y="30" text-anchor="middle" font-size="22" font-weight="700" fill="#171522">'+esc(song.title)+'</text>';
      const metaLine=[song.subtitle, song.composer? 'Komp.: '+song.composer:''].filter(Boolean).join('  •  ');
      if(metaLine) svg += '<text x="'+(pageWidth/2)+'" y="48" text-anchor="middle" font-size="12" font-style="italic" fill="#5b596a">'+esc(metaLine)+'</text>';
      svg += '<text x="'+(pageWidth-16)+'" y="30" text-anchor="end" font-size="12" font-weight="700" fill="#2b2a3a">'+song.tempo+' BPM • '+esc(tempoLabel)+'</text>';
    } else {
      svg += '<text x="16" y="24" font-size="12" font-weight="700" fill="#5b596a">'+esc(song.title)+'</text>';
    }
    if(pages.length>1) svg += '<text x="'+(pageWidth-16)+'" y="'+(pageHeight-16)+'" text-anchor="end" font-size="10.5" fill="#9a98a8">Seite '+(pageIdx+1)+' / '+pages.length+'</text>';

    pageSystems.forEach((sys,sysIdxOnPage)=>{
      const staffTopY = marginTop + sysIdxOnPage*SYSTEM_HEIGHT;
      const trebleBottomY = staffTopY + 4*LINE_GAP;
      const yForTreble = (step)=> trebleBottomY - step*LINE_GAP;
      const isVeryFirstSystem = isFirst && sysIdxOnPage===0;

      let bassTopY, bassBottomY, yForBass;
      if(isGrand){
        bassTopY = trebleBottomY + GRAND_STAFF_GAP;
        bassBottomY = bassTopY + 4*LINE_GAP;
        yForBass = (step)=> bassBottomY - step*LINE_GAP;
      }
      const systemBottomY = isGrand? bassBottomY : trebleBottomY;

      // Treble (or the only) staff
      for(let i=0;i<5;i++){
        const y=staffTopY+i*LINE_GAP;
        svg += '<line x1="'+marginLeft+'" y1="'+y+'" x2="'+(pageWidth-marginRight)+'" y2="'+y+'" stroke="#171522" stroke-width="1.3"/>';
      }
      const topClefSym = isGrand? "𝄞" : (clef==="bass"?"𝄢":"𝄞");
      svg += '<text x="'+(marginLeft-42)+'" y="'+(yForTreble(clef==="bass"&&!isGrand?2:1)+5)+'" font-size="28" fill="#171522">'+topClefSym+'</text>';
      svg += '<text x="'+(marginLeft-14)+'" y="'+(staffTopY+2*LINE_GAP+3)+'" font-size="11" font-weight="700" fill="#5b596a">'+kt+'</text>';
      if(isVeryFirstSystem){
        svg += '<text x="'+(marginLeft+2)+'" y="'+(staffTopY+LINE_GAP+2)+'" font-size="14" font-weight="700" fill="#171522">'+song.timeSig.b+'</text>';
        svg += '<text x="'+(marginLeft+2)+'" y="'+(staffTopY+3*LINE_GAP+2)+'" font-size="14" font-weight="700" fill="#171522">'+song.timeSig.v+'</text>';
      }

      // Bass staff + brace, piano only
      if(isGrand){
        for(let i=0;i<5;i++){
          const y=bassTopY+i*LINE_GAP;
          svg += '<line x1="'+marginLeft+'" y1="'+y+'" x2="'+(pageWidth-marginRight)+'" y2="'+y+'" stroke="#171522" stroke-width="1.3"/>';
        }
        svg += '<text x="'+(marginLeft-42)+'" y="'+(yForBass(2)+5)+'" font-size="28" fill="#171522">𝄢</text>';
        svg += '<text x="'+(marginLeft-14)+'" y="'+(bassTopY+2*LINE_GAP+3)+'" font-size="11" font-weight="700" fill="#5b596a">'+kt+'</text>';
        if(isVeryFirstSystem){
          svg += '<text x="'+(marginLeft+2)+'" y="'+(bassTopY+LINE_GAP+2)+'" font-size="14" font-weight="700" fill="#171522">'+song.timeSig.b+'</text>';
          svg += '<text x="'+(marginLeft+2)+'" y="'+(bassTopY+3*LINE_GAP+2)+'" font-size="14" font-weight="700" fill="#171522">'+song.timeSig.v+'</text>';
        }
        svg += '<path d="'+bracePath(marginLeft-52, staffTopY, bassBottomY)+'" stroke="#171522" stroke-width="2.4" fill="none" stroke-linecap="round"/>';
      }

      let x = marginLeft + (isGrand? 24 : 20);
      sys.forEach((mi)=>{
        const layout = measureLayouts[mi];
        const mw = layout.width;
        const isCursorHere = live && (state.cursorMeasure!=null ? mi===state.cursorMeasure : mi===song.measures.length-1);
        if(isCursorHere){
          svg += '<rect x="'+x+'" y="'+(staffTopY-6)+'" width="'+mw+'" height="'+(systemBottomY-staffTopY+12)+'" fill="#E5A93C" opacity="0.12" rx="4"/>';
        }
        if(isCursorHere && state.insertBeforeIndex!=null && !state.noteEditIntent){
          let caretX, caretTopY, caretBottomY;
          if(isGrand){
            const notesArr = song.measures[mi].notes;
            const flatIdx = Math.min(state.insertBeforeIndex, notesArr.length);
            const handNote = notesArr[flatIdx] || notesArr[flatIdx-1];
            const isBassHand = handNote && !handNote.rest && handNote.pitch<60;
            const slots = isBassHand? layout.bassSlots : layout.trebleSlots;
            const edges = isBassHand? layout.bassGapEdges : layout.trebleGapEdges;
            const handRelIdx = slots.filter(s=>s.idx<flatIdx).length;
            caretX = x + edges[Math.min(handRelIdx, edges.length-1)];
            caretTopY = isBassHand? bassTopY-8 : staffTopY-8;
            caretBottomY = isBassHand? bassBottomY+8 : trebleBottomY+8;
          } else {
            const flatIdx = Math.min(state.insertBeforeIndex, layout.gapEdges.length-1);
            caretX = x + layout.gapEdges[flatIdx];
            caretTopY = staffTopY-8;
            caretBottomY = systemBottomY+8;
          }
          svg += '<line class="insert-caret" x1="'+caretX+'" y1="'+caretTopY+'" x2="'+caretX+'" y2="'+caretBottomY+'" stroke="#E5A93C" stroke-width="2.5" stroke-linecap="round"/>';
        }
        if(live){
          const mkMidpoints = (slots)=> slots.map(sl=>sl.x.toFixed(1)+':'+sl.idx).join(',');
          const midAttrs = isGrand
            ? ' data-grand="1" data-mid-y="'+((trebleBottomY+bassTopY)/2)+'" data-treble-midpoints="'+mkMidpoints(layout.trebleSlots)+'" data-bass-midpoints="'+mkMidpoints(layout.bassSlots)+'"'
            : ' data-midpoints="'+mkMidpoints(layout.slots)+'"';
          svg += '<rect class="measure-hit" data-mi="'+mi+'"'+midAttrs+' x="'+x+'" y="'+staffTopY+'" width="'+mw+'" height="'+(systemBottomY-staffTopY)+'" fill="#000000" opacity="0" pointer-events="all" style="cursor:pointer"/>';
        }
        const noteOpts = {interactive: live};
        if(isGrand){
          layout.trebleSlots.forEach(sl=>{ svg += drawNote(sl.note, mi, sl.idx, x+sl.x, yForTreble, "treble", Object.assign({chordY: staffTopY-8, lyricY: systemBottomY+34}, noteOpts)); });
          layout.bassSlots.forEach(sl=>{ svg += drawNote(sl.note, mi, sl.idx, x+sl.x, yForBass, "bass", noteOpts); });
        } else {
          layout.slots.forEach(sl=>{ svg += drawNote(sl.note, mi, sl.idx, x+sl.x, yForTreble, clef, Object.assign({chordY: staffTopY-8, lyricY: trebleBottomY+34}, noteOpts)); });
        }
        x += mw;
        const isLastMeasureOfPiece = mi===song.measures.length-1;
        svg += '<line x1="'+x+'" y1="'+staffTopY+'" x2="'+x+'" y2="'+systemBottomY+'" stroke="#171522" stroke-width="'+(isLastMeasureOfPiece?2.6:1.4)+'"/>';
        if(isLastMeasureOfPiece){ svg += '<line x1="'+(x-4)+'" y1="'+staffTopY+'" x2="'+(x-4)+'" y2="'+systemBottomY+'" stroke="#171522" stroke-width="1"/>'; }
      });
    });

    svg += '</svg>';
    out.push(svg);
  });

  return {pages: out, pageWidth, pageHeight};
}

function renderStaff(){
  const song=currentSong(); if(!song) return;
  const wrapEl = document.querySelector(".staff-wrap");
  const containerWidth = wrapEl ? wrapEl.clientWidth - 28 : 700;
  const built = buildScorePages(song, {
    pageWidth: Math.max(480, Math.min(900, containerWidth)),
    interactive: true
  });

  const wrap=document.getElementById("staffPaper");
  wrap.innerHTML = built.pages.map(svg=>'<div class="staff-page">'+svg+'</div>').join("");
  wrap.querySelectorAll(".notehit").forEach(elx=>{
    elx.addEventListener("click",()=>{
      const m=+elx.dataset.m, i=+elx.dataset.i;
      const wasSelected = state.selectedNoteRef && state.selectedNoteRef.m===m && state.selectedNoteRef.i===i;
      state.selectedNoteRef = wasSelected ? null : {m,i};
      state.noteEditIntent = !wasSelected;
      state.insertBeforeIndex = null;
      state.cursorMeasure = m;
      renderStaff();
    });
  });
  wrap.querySelectorAll(".measure-hit").forEach(elx=>{
    elx.addEventListener("click",(e)=>{
      const mi = +elx.dataset.mi;
      const svgEl = elx.ownerSVGElement;
      const pt = svgEl.createSVGPoint();
      pt.x = e.clientX; pt.y = e.clientY;
      const svgP = pt.matrixTransform(svgEl.getScreenCTM().inverse());
      const localX = svgP.x - (+elx.getAttribute("x"));

      const parseMidpoints = (str)=> (str||"").split(",").filter(Boolean).map(pair=>{
        const [mx,idx] = pair.split(":"); return {x:+mx, idx:+idx};
      });
      const findInsertIdx = (list, fallbackLen)=>{
        const hit = list.find(p=>localX < p.x);
        return hit ? hit.idx : (list.length ? list[list.length-1].idx+1 : fallbackLen);
      };

      let insertIdx;
      if(elx.dataset.grand==="1"){
        const midY = +elx.dataset.midY;
        const list = svgP.y < midY ? parseMidpoints(elx.dataset.trebleMidpoints) : parseMidpoints(elx.dataset.bassMidpoints);
        insertIdx = findInsertIdx(list, 0);
      } else {
        insertIdx = findInsertIdx(parseMidpoints(elx.dataset.midpoints), 0);
      }

      state.selectedNoteRef = null;
      state.noteEditIntent = false;
      state.cursorMeasure = mi;
      state.insertBeforeIndex = insertIdx;
      renderStaff();
    });
  });
  // Every score edit ends in a renderStaff(), so this is the one place that
  // reliably catches note, measure, tempo, key and instrument changes.
  persist();
}

function renderToolbar(){
  const song=currentSong(); const el=document.getElementById("toolbarCard");
  if(!el) return;
  const instr=instrOf(song.instrument), key=keyOf(song.key);
  el.innerHTML =
    '<div class="chip-row" id="rowGlobal">'
      + chip("instrument",'<span class="sym">⚙</span>'+instr.name.split("/")[0].trim(),false,"tint-tan")
      + chip("key",'<span class="sym">▤</span>'+key.short,false,"tint-blue")
      + chip("timesig",'<span class="sym">⏱</span>'+tsName(song.timeSig),false,"tint-green")
      + chip("tempo",'<span class="sym">⚡</span>'+song.tempo+' BPM',false,"")
      + chip("lyricchord",'<span class="sym">❝</span>Text / Akkord',false,"")
      + chip("addmeasure",'<span class="sym">+</span>Takt',false,"")
      + chip("removemeasure",'<span class="sym">−</span>Takt',false,"")
    + '</div>'
    + '<div class="chip-row"><span class="row-label">Notenwert:</span>'
      + DURATIONS.map(d=>chip("dur:"+d.id,'<span class="sym">'+d.symbol+'</span>'+d.label,state.activeDuration===d.id)).join("")
      + chip("dotted","• Punktiert",state.isDotted)
      + chip("triplet","3 Triole",state.isTriplet)
    + '</div>'
    + '<div class="chip-row"><span class="row-label">Vorzeichen:</span>'
      + ACCIDENTALS.map(a=>chip("acc:"+a.id,(a.symbol?a.symbol+' ':'')+a.label,state.activeAccidental===a.id)).join("")
      + '<span class="row-label" style="margin-left:6px">Artikulation:</span>'
      + ARTICULATIONS.map(a=>chip("art:"+a.id,a.symbol+' '+a.label,state.activeArticulation===a.id)).join("")
    + '</div>';

  el.querySelector('[data-chip="instrument"]').onclick=openInstrumentModal;
  el.querySelector('[data-chip="key"]').onclick=openKeyModal;
  el.querySelector('[data-chip="timesig"]').onclick=openTimeSigModal;
  el.querySelector('[data-chip="tempo"]').onclick=openTempoModal;
  el.querySelector('[data-chip="lyricchord"]').onclick=openLyricChordModal;
  el.querySelector('[data-chip="addmeasure"]').onclick=()=>{ song.measures.push({notes:[]}); renderStaff(); };
  el.querySelector('[data-chip="removemeasure"]').onclick=()=>{ if(song.measures.length>1){ song.measures.pop(); renderStaff(); } };
  DURATIONS.forEach(d=>el.querySelector('[data-chip="dur:'+d.id+'"]').onclick=()=>{ state.activeDuration=d.id; renderToolbar(); });
  el.querySelector('[data-chip="dotted"]').onclick=()=>{ state.isDotted=!state.isDotted; renderToolbar(); };
  el.querySelector('[data-chip="triplet"]').onclick=()=>{ state.isTriplet=!state.isTriplet; renderToolbar(); };
  ACCIDENTALS.forEach(a=>el.querySelector('[data-chip="acc:'+a.id+'"]').onclick=()=>{ state.activeAccidental=(state.activeAccidental===a.id?"NONE":a.id); renderToolbar(); });
  ARTICULATIONS.forEach(a=>el.querySelector('[data-chip="art:'+a.id+'"]').onclick=()=>{ state.activeArticulation=(state.activeArticulation===a.id?"NONE":a.id); renderToolbar(); });
}
function chip(id,html,selected,tint){
  return '<button class="chip'+(selected?' selected':'')+(tint?' '+tint:'')+'" data-chip="'+id+'">'+html+'</button>';
}

function renderPiano(){
  const slot=document.getElementById("pianoSlot");
  if(!slot) return;
  slot.innerHTML = '<div class="piano-card">'
    + '<div class="piano-controls"><div class="oct-group">'
      + '<button class="round-btn" id="octDown" '+(state.baseOctave<=2?"disabled":"")+'>'+ICON.arrowLeft+'</button>'
      + '<span class="oct-label">Oktave C'+state.baseOctave+' – H'+(state.baseOctave+1)+'</span>'
      + '<button class="round-btn" id="octUp" '+(state.baseOctave>=6?"disabled":"")+'>'+ICON.arrowRight+'</button>'
    + '</div>'
    + '<div class="oct-group" style="gap:4px">'
      + '<button class="round-btn" id="stepPrev" title="Zur vorherigen Note/Lücke springen">'+ICON.chevronLeft+'</button>'
      + '<span class="oct-label">Position</span>'
      + '<button class="round-btn" id="stepNext" title="Zur nächsten Note/Lücke springen">'+ICON.chevronRight+'</button>'
    + '</div>'
    + '<div style="display:flex;gap:6px">'
      + '<button class="round-btn tint-green" id="restBtn" title="Pause einfügen">'+ICON.musicOff+'</button>'
      + '<button class="round-btn tint-red" id="delBtn" title="Note löschen">'+ICON.backspace+'</button>'
    + '</div></div>'
    + '<div class="keys-frame" id="keysFrame"></div>'
  + '</div>';
  buildKeys();
  document.getElementById("octDown").onclick=()=>{ if(state.baseOctave>2){state.baseOctave--; renderPiano();} };
  document.getElementById("octUp").onclick=()=>{ if(state.baseOctave<6){state.baseOctave++; renderPiano();} };
  document.getElementById("stepPrev").onclick=()=>stepCursor(-1);
  document.getElementById("stepNext").onclick=()=>stepCursor(1);
  document.getElementById("restBtn").onclick=()=>addNote(60,true);
  document.getElementById("delBtn").onclick=deleteNote;
}

/** Steps the edit/insert cursor one stop left or right through the sequence
 *  of notes and the gaps between them, moving into neighboring measures too. */
function stepCursor(dir){
  const song=currentSong(); if(!song || !song.measures.length) return;
  let mi, pos;
  if(state.cursorMeasure!=null && song.measures[state.cursorMeasure]){
    mi = state.cursorMeasure;
    if(state.noteEditIntent && state.selectedNoteRef && state.selectedNoteRef.m===mi){
      pos = state.selectedNoteRef.i*2+1;
    } else if(state.insertBeforeIndex!=null){
      pos = state.insertBeforeIndex*2;
    } else {
      pos = song.measures[mi].notes.length*2;
    }
  } else {
    mi = song.measures.length-1;
    pos = song.measures[mi].notes.length*2;
  }

  pos += dir;
  if(pos < 0){
    if(mi>0){ mi--; pos = song.measures[mi].notes.length*2; } else { pos = 0; }
  } else if(pos > song.measures[mi].notes.length*2){
    if(mi < song.measures.length-1){ mi++; pos = 0; } else { pos = song.measures[mi].notes.length*2; }
  }

  if(pos%2===0){
    state.cursorMeasure=mi; state.insertBeforeIndex=pos/2; state.selectedNoteRef=null; state.noteEditIntent=false;
  } else {
    state.cursorMeasure=mi; state.selectedNoteRef={m:mi, i:(pos-1)/2}; state.noteEditIntent=true; state.insertBeforeIndex=null;
  }
  renderStaff();
}
function buildKeys(){
  const frame=document.getElementById("keysFrame");
  frame.innerHTML="";
  const whites=[];
  for(let oct=state.baseOctave; oct<=state.baseOctave+1; oct++){
    const base=(oct+1)*12;
    [[0,"C"],[2,"D"],[4,"E"],[5,"F"],[7,"G"],[9,"A"],[11,"H"]].forEach(([off,nm])=>whites.push({pitch:base+off,name:nm+oct}));
  }
  whites.forEach(w=>{
    const b=document.createElement("div");
    b.className="wkey"+(w.name[0]==="C"?" c-key":"");
    b.textContent=w.name; b.title=midiName(w.pitch);
    b.addEventListener("click",()=>addNote(w.pitch,false));
    frame.appendChild(b);
  });
  const keyWidth=frame.clientWidth/whites.length;
  for(let octIdx=0;octIdx<2;octIdx++){
    const base=(state.baseOctave+octIdx+1)*12;
    const octOffset=octIdx*7;
    [[0,1],[1,3],[3,6],[4,8],[5,10]].forEach(([wi,semi])=>{
      const bk=document.createElement("div");
      bk.className="bkey";
      const left=keyWidth*(octOffset+wi+0.65);
      bk.style.left=left+"px"; bk.style.width=(keyWidth*0.7)+"px";
      const pitch=base+semi;
      bk.textContent=midiName(pitch).slice(0,2);
      bk.addEventListener("click",(e)=>{ e.stopPropagation(); addNote(pitch,false); });
      frame.appendChild(bk);
    });
  }
}

/** Finds the first measure at or after startMi with room for `neededBeats`,
 *  extending the piece with a new measure only if none of the existing ones fit. */
function findRoomStartingAt(song, startMi, neededBeats){
  const cap = totalBeats(song.timeSig);
  let mi = startMi;
  while(mi < song.measures.length && measureBeats(song.measures[mi]) + neededBeats > cap+0.001){
    mi++;
  }
  if(mi >= song.measures.length){
    song.measures.push({notes:[]});
    mi = song.measures.length-1;
  }
  return mi;
}

function addNote(pitch,isRest){
  const song=currentSong(); if(!song) return;
  let dur=state.activeDuration, dotted=state.isDotted, triplet=state.isTriplet;
  let beats=durOf(dur).beats*(dotted?1.5:1)*(triplet?2/3:1);

  // A note was explicitly clicked (edit mode): change its pitch instead of inserting a new one.
  if(state.noteEditIntent && state.selectedNoteRef){
    const {m,i} = state.selectedNoteRef;
    const target = song.measures[m] && song.measures[m].notes[i];
    if(target){
      target.rest = isRest;
      if(!isRest){
        target.pitch = pitch;
        target.acc = state.activeAccidental;
        target.art = state.activeArticulation;
        const shift=(ACCIDENTALS.find(a=>a.id===target.acc)||{shift:0}).shift;
        playTone(pitch+shift, noteBeats(target)*(60/song.tempo), song.instrument, target.art);
      }
      renderStaff();
      return;
    }
  }

  const note={pitch,dur,dotted,triplet,acc:isRest?"NONE":state.activeAccidental,art:isRest?"NONE":state.activeArticulation,rest:isRest};
  let mi, insertIdx;
  if(state.cursorMeasure!=null && song.measures[state.cursorMeasure] && state.insertBeforeIndex!=null){
    // An explicit gap was clicked: insert exactly there. The time signature still caps how
    // many beats a measure may hold, so any overflow cascades forward into later measures
    // (creating a new one at the end if needed) instead of silently overfilling this one.
    mi = state.cursorMeasure;
    insertIdx = Math.min(state.insertBeforeIndex, song.measures[mi].notes.length);
  } else {
    const startMi = (state.cursorMeasure!=null && song.measures[state.cursorMeasure]) ? state.cursorMeasure : song.measures.length-1;
    mi = findRoomStartingAt(song, startMi, beats);
    insertIdx = song.measures[mi].notes.length;
  }
  song.measures[mi].notes.splice(insertIdx, 0, note);
  reflowFromMeasure(song, mi);

  // The cascade may have pushed our note into a later measure — find where it landed.
  let foundM=mi, foundI=-1;
  for(let m=mi; m<song.measures.length; m++){
    const idx = song.measures[m].notes.indexOf(note);
    if(idx!==-1){ foundM=m; foundI=idx; break; }
  }
  state.cursorMeasure = foundM;
  state.insertBeforeIndex = foundI!==-1 ? Math.min(foundI+1, song.measures[foundM].notes.length) : null;
  state.selectedNoteRef = foundI!==-1 ? {m:foundM, i:foundI} : null;
  state.noteEditIntent = false;
  if(!isRest){
    const shift=(ACCIDENTALS.find(a=>a.id===note.acc)||{shift:0}).shift;
    playTone(pitch+shift, beats*(60/song.tempo), song.instrument, note.art);
  }
  renderStaff();
}
/** Pushes any beats past a measure's time-signature capacity into the following
 *  measures, one note at a time from the end — cascading forward as needed,
 *  extending the piece with a new measure only if the very end is reached. */
function reflowFromMeasure(song, startMi){
  const cap = totalBeats(song.timeSig);
  let mi = startMi;
  while(mi < song.measures.length && measureBeats(song.measures[mi]) > cap + 0.001){
    const m = song.measures[mi];
    const overflow = [];
    while(measureBeats(m) > cap + 0.001 && m.notes.length){
      overflow.unshift(m.notes.pop());
    }
    if(mi+1 >= song.measures.length) song.measures.push({notes:[]});
    song.measures[mi+1].notes = overflow.concat(song.measures[mi+1].notes);
    mi++;
  }
}
function deleteNote(){
  const song=currentSong(); if(!song) return;
  if(state.selectedNoteRef){
    const {m,i}=state.selectedNoteRef;
    if(song.measures[m]){ song.measures[m].notes.splice(i,1); }
    state.selectedNoteRef=null;
    state.noteEditIntent=false;
    state.cursorMeasure=m;
    state.insertBeforeIndex=i;
  } else {
    for(let m=song.measures.length-1;m>=0;m--){
      if(song.measures[m].notes.length){
        song.measures[m].notes.pop();
        state.cursorMeasure=m;
        state.insertBeforeIndex=song.measures[m].notes.length;
        break;
      }
    }
  }
  renderStaff();
}

/* Playback sequencer */
function togglePlay(){ state.isPlaying ? stopPlay() : startPlay(); }
function startPlay(){
  const song=currentSong(); if(!song) return;
  const seq=[]; song.measures.forEach((m,mi)=>m.notes.forEach((nt,ni)=>seq.push({mi,ni,nt})));
  if(!seq.length){ toast("Keine Noten zum Abspielen."); return; }
  state.isPlaying=true; renderHeader();
  // Start from the selected note, if any, instead of always from the beginning.
  let idx=0;
  if(state.selectedNoteRef){
    const found = seq.findIndex(s=>s.mi===state.selectedNoteRef.m && s.ni===state.selectedNoteRef.i);
    if(found!==-1) idx = found;
  }
  function step(){
    if(!state.isPlaying || idx>=seq.length){ stopPlay(); return; }
    const {mi,ni,nt}=seq[idx];
    state.playingRef={m:mi,i:ni}; renderStaff();
    const beats=noteBeats(nt); const secs=beats*(60/song.tempo);
    if(!nt.rest) playTone(nt.pitch+((ACCIDENTALS.find(a=>a.id===nt.acc)||{shift:0}).shift), secs, song.instrument, nt.art);
    idx++;
    state.playTimer=setTimeout(step, secs*1000);
  }
  step();
}
function stopPlay(){
  state.isPlaying=false; clearTimeout(state.playTimer); state.playTimer=null;
  state.playingRef=null; renderHeader(); renderStaff();
}

/* ---------------- Modals ---------------- */
function openModal(html){ document.getElementById("modalBody").innerHTML=html; document.getElementById("modalScrim").classList.add("open"); }
function closeModal(){ document.getElementById("modalScrim").classList.remove("open"); }
document.addEventListener("DOMContentLoaded",()=>{
  document.getElementById("modalScrim").addEventListener("click",(e)=>{ if(e.target.id==="modalScrim") closeModal(); });
});

function openAddSongModal(){
  openModal('<h3>Neuen Song anlegen</h3>'
    + '<div class="field"><label>Titel</label><input id="fTitle" value="Neuer Song"></div>'
    + '<div class="field"><label>Künstler / Interpret</label><input id="fArtist"></div>'
    + '<div class="field"><label>Tempo (BPM)</label><input id="fBpm" type="number" value="120" min="20" max="240"></div>'
    + '<div class="field"><label>Tonart</label><select id="fKey">'+KEYS.map(k=>'<option value="'+k.id+'">'+k.short+'</option>').join("")+'</select></div>'
    + '<div class="field"><label>Taktart</label><select id="fTs">'+TIME_SIGS.map(t=>'<option value="'+t.b+'/'+t.v+'">'+t.name+'</option>').join("")+'</select></div>'
    + '<div class="field"><label>Instrument</label><select id="fInstr">'+INSTRUMENTS.map(i=>'<option value="'+i.id+'">'+i.name+'</option>').join("")+'</select></div>'
    + '<div class="modal-actions"><button class="btn-ghost" id="mCancel">Abbrechen</button><button class="btn-amber" id="mCreate">Song erstellen</button></div>');
  document.getElementById("mCancel").onclick=closeModal;
  document.getElementById("mCreate").onclick=()=>{
    const title=document.getElementById("fTitle").value.trim()||"Neuer Song";
    const [b,v]=document.getElementById("fTs").value.split("/").map(Number);
    const song=makeSong({title, artist:document.getElementById("fArtist").value, tempo:+document.getElementById("fBpm").value||120,
      key:document.getElementById("fKey").value, timeSig:{b,v}, instrument:document.getElementById("fInstr").value, durationText:"–"});
    state.songs.push(song);
    persistNow();
    closeModal(); toast("Song angelegt und gespeichert."); openSong(song.id);
  };
}
function openPropertiesModal(){
  const song=currentSong();
  openModal('<h3>Titel &amp; Angaben</h3>'
    + '<div class="field"><label>Titel</label><input id="fTitle" value="'+esc(song.title)+'"></div>'
    + '<div class="field"><label>Künstler</label><input id="fArtist" value="'+esc(song.artist)+'"></div>'
    + '<div class="field"><label>Untertitel</label><input id="fSub" value="'+esc(song.subtitle)+'"></div>'
    + '<div class="field"><label>Komponist</label><input id="fComp" value="'+esc(song.composer)+'"></div>'
    + '<div class="modal-actions"><button class="btn-ghost" id="mCancel">Abbrechen</button><button class="btn-amber" id="mSave">Speichern</button></div>');
  document.getElementById("mCancel").onclick=closeModal;
  document.getElementById("mSave").onclick=()=>{
    song.title=document.getElementById("fTitle").value||song.title;
    song.artist=document.getElementById("fArtist").value;
    song.subtitle=document.getElementById("fSub").value;
    song.composer=document.getElementById("fComp").value;
    persistNow();
    closeModal(); renderHeader(); renderStaff(); renderLibrary();
  };
}
function openInstrumentModal(){
  const song=currentSong();
  openModal('<h3>Instrument wählen</h3><p style="color:var(--text-3);font-size:11.5px;margin:-6px 0 10px">Auf das Lautsprecher-Symbol tippen, um die Klangfarbe zu hören.</p><div class="option-list">'+INSTRUMENTS.map(i=>
    '<div class="option-row'+(i.id===song.instrument?' current':'')+'" data-id="'+i.id+'">'
    + '<div><div class="option-name">'+i.name+'</div><div class="option-sub">'+(i.clef==="bass"?"Bassschlüssel":"Violinschlüssel")+'</div></div>'
    + '<button class="icon-btn amberify" data-preview="'+i.id+'" title="Klang anhören">'+ICON.speaker+'</button>'
    + '</div>').join("")+'</div>'
    + '<div class="modal-actions"><button class="btn-ghost" id="mClose">Schließen</button></div>');
  document.querySelectorAll(".option-row").forEach(r=>r.onclick=()=>{ song.instrument=r.dataset.id; closeModal(); renderHeader(); renderToolbar(); renderStaff(); });
  document.querySelectorAll("[data-preview]").forEach(b=>b.addEventListener("click",(e)=>{
    e.stopPropagation();
    playTone(60, 0.9, b.dataset.preview, "NONE");
  }));
  document.getElementById("mClose").onclick=closeModal;
}
function openKeyModal(){
  const song=currentSong();
  openModal('<h3>Tonart / Vorzeichen</h3><div class="option-list">'+KEYS.map(k=>
    '<div class="option-row'+(k.id===song.key?' current':'')+'" data-id="'+k.id+'"><div class="option-name">'+k.short+'</div><div class="option-sub">'+k.name+'</div></div>').join("")+'</div>'
    + '<div class="modal-actions"><button class="btn-ghost" id="mClose">Schließen</button></div>');
  document.querySelectorAll(".option-row").forEach(r=>r.onclick=()=>{ song.key=r.dataset.id; closeModal(); renderHeader(); renderToolbar(); renderStaff(); });
  document.getElementById("mClose").onclick=closeModal;
}
function openTimeSigModal(){
  const song=currentSong();
  openModal('<h3>Taktart wählen</h3><div class="option-list">'+TIME_SIGS.map(t=>
    '<div class="option-row'+(t.b===song.timeSig.b&&t.v===song.timeSig.v?' current':'')+'" data-b="'+t.b+'" data-v="'+t.v+'"><div class="option-name">'+t.b+'/'+t.v+'</div><div class="option-sub">'+t.name+'</div></div>').join("")+'</div>'
    + '<div class="modal-actions"><button class="btn-ghost" id="mClose">Schließen</button></div>');
  document.querySelectorAll(".option-row").forEach(r=>r.onclick=()=>{ song.timeSig={b:+r.dataset.b,v:+r.dataset.v}; closeModal(); renderHeader(); renderToolbar(); renderStaff(); });
  document.getElementById("mClose").onclick=closeModal;
}
function openTempoModal(){
  const song=currentSong();
  openModal('<h3>Tempo wählen</h3><div class="option-list">'+TEMPO_PRESETS.map(t=>
    '<div class="option-row'+(t.bpm===song.tempo?' current':'')+'" data-bpm="'+t.bpm+'"><div class="option-name">'+t.bpm+' BPM — '+t.it+'</div><div class="option-sub">'+t.de+'</div></div>').join("")+'</div>'
    + '<div class="field" style="margin-top:8px"><label>Eigener Wert (BPM)</label><input id="fCustom" type="number" value="'+song.tempo+'" min="20" max="300"></div>'
    + '<div class="modal-actions"><button class="btn-ghost" id="mClose">Schließen</button><button class="btn-amber" id="mApply">Übernehmen</button></div>');
  document.querySelectorAll(".option-row").forEach(r=>r.onclick=()=>{ song.tempo=+r.dataset.bpm; closeModal(); renderHeader(); renderToolbar(); renderStaff(); });
  document.getElementById("mClose").onclick=closeModal;
  document.getElementById("mApply").onclick=()=>{ song.tempo=+document.getElementById("fCustom").value||song.tempo; closeModal(); renderHeader(); renderToolbar(); renderStaff(); };
}
function openLyricChordModal(){
  const song=currentSong();
  const ref=state.selectedNoteRef;
  if(!ref){ toast("Bitte zuerst eine Note antippen."); return; }
  const nt=song.measures[ref.m].notes[ref.i];
  openModal('<h3>Text &amp; Akkord</h3>'
    + '<div class="field"><label>Silbe / Text (z.B. "Freu-")</label><input id="fLyric" value="'+esc(nt.lyric||"")+'"></div>'
    + '<div class="field"><label>Akkordsymbol (z.B. "G7", "Am")</label><input id="fChord" value="'+esc(nt.chord||"")+'"></div>'
    + '<div class="modal-actions"><button class="btn-ghost" id="mCancel">Abbrechen</button><button class="btn-amber" id="mSave">Speichern</button></div>');
  document.getElementById("mCancel").onclick=closeModal;
  document.getElementById("mSave").onclick=()=>{
    nt.lyric=document.getElementById("fLyric").value; nt.chord=document.getElementById("fChord").value;
    persistNow();
    closeModal(); renderStaff();
  };
}
/* ---------------- Export (PDF / PNG) ---------------- */
const EXPORT_PAGE_WIDTH = 794; // 210 mm bei 96 dpi -> exaktes A4-Seitenverhältnis

function safeFileName(s){
  const cleaned = String(s || "Notenblatt").replace(/[\\/:*?"<>|\u0000-\u001F]+/g, "-").replace(/\s+/g, " ").trim();
  return (cleaned || "Notenblatt").slice(0, 70);
}

/** Reicht die Datei je nach Plattform an das Teilen-Menü (iOS/installierte PWA)
 *  oder an einen klassischen Download weiter. */
async function saveBlob(blob, filename){
  try{
    const file = new File([blob], filename, {type: blob.type});
    const standalone = window.matchMedia && window.matchMedia("(display-mode: standalone)").matches;
    const isIOS = /iP(hone|ad|od)/.test(navigator.userAgent) || (navigator.platform==="MacIntel" && navigator.maxTouchPoints>1);
    if((isIOS || standalone) && navigator.canShare && navigator.canShare({files:[file]})){
      await navigator.share({files:[file], title: filename});
      return;
    }
  }catch(e){
    if(e && e.name==="AbortError") return; // Nutzer hat das Teilen-Menü abgebrochen
  }
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.rel = "noopener";
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(()=>URL.revokeObjectURL(url), 8000);
}

/** UTF-8-sicheres Base64, auch für mehrseitige Partituren mit Sonderzeichen. */
function utf8ToBase64(str){
  const bytes = new TextEncoder().encode(str);
  let bin = "", chunk = 0x8000;
  for(let i=0;i<bytes.length;i+=chunk) bin += String.fromCharCode.apply(null, bytes.subarray(i, i+chunk));
  return btoa(bin);
}

function svgToImage(svgString){
  return new Promise((resolve, reject)=>{
    const img = new Image();
    img.onload = ()=>resolve(img);
    img.onerror = ()=>reject(new Error("SVG konnte nicht gerendert werden."));
    // Data-URL statt Blob-URL: in Safari die zuverlässigere Variante für <img src=svg>.
    img.src = "data:image/svg+xml;base64," + utf8ToBase64(svgString);
  });
}

/** Alle Seiten untereinander in ein PNG. Die Seitenbreite im SVG wird für die
 *  Rasterung hochskaliert, damit die Noten scharf bleiben. */
async function exportAsPng(){
  const song = currentSong(); if(!song) return;
  const scale = 2, gap = 24;
  const {pages, pageWidth, pageHeight} = buildScorePages(song, {pageWidth: EXPORT_PAGE_WIDTH, interactive: false});

  const canvas = document.createElement("canvas");
  canvas.width = pageWidth*scale;
  canvas.height = (pageHeight*pages.length + gap*(pages.length-1))*scale;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for(let i=0;i<pages.length;i++){
    const scaled = pages[i]
      .replace('width="'+pageWidth+'"', 'width="'+(pageWidth*scale)+'"')
      .replace('height="'+pageHeight+'"', 'height="'+(pageHeight*scale)+'"');
    const img = await svgToImage(scaled);
    ctx.drawImage(img, 0, i*(pageHeight+gap)*scale);
  }

  const blob = await new Promise(res=>canvas.toBlob(res, "image/png"));
  if(!blob) throw new Error("PNG konnte nicht erzeugt werden.");
  await saveBlob(blob, safeFileName(song.title) + ".png");
}

/** Baut ein eigenständiges A4-Druckdokument in einem versteckten iframe und
 *  öffnet den Druckdialog – dort führt "Als PDF sichern" zum fertigen PDF.
 *  Das ist der Weg, der ohne zusätzliche Bibliothek auf Desktop, Android und
 *  iOS gleichermaßen funktioniert. */
function exportAsPdf(){
  const song = currentSong(); if(!song) return;
  const {pages} = buildScorePages(song, {pageWidth: EXPORT_PAGE_WIDTH, interactive: false});
  const doc = '<!doctype html><html lang="de"><head><meta charset="utf-8"><title>' + esc(song.title) + '</title>'
    + '<style>'
    + '@page{size:A4 portrait;margin:0}'
    + 'html,body{margin:0;padding:0;background:#fff;-webkit-print-color-adjust:exact;print-color-adjust:exact}'
    + '.pg{width:210mm;height:297mm;overflow:hidden;page-break-after:always;break-after:page}'
    + '.pg:last-child{page-break-after:auto;break-after:auto}'
    + '.pg svg{display:block;width:210mm;height:297mm}'
    + '</style></head><body>'
    + pages.map(s=>'<div class="pg">'+s+'</div>').join("")
    + '</body></html>';

  const frame = document.createElement("iframe");
  frame.setAttribute("aria-hidden", "true");
  frame.style.cssText = "position:fixed;left:-10000px;top:0;width:230mm;height:320mm;border:0;background:#fff";
  document.body.appendChild(frame);
  frame.onload = ()=>{
    setTimeout(()=>{
      try{
        frame.contentWindow.focus();
        frame.contentWindow.print();
      }catch(e){
        toast("Druckdialog konnte nicht geöffnet werden – bitte den Bild-Export nutzen.");
      }
      setTimeout(()=>frame.remove(), 60000);
    }, 400);
  };
  frame.srcdoc = doc;
}

function openExportModal(){
  const song = currentSong();
  if(!song){ toast("Öffne zuerst einen Song im Editor."); return; }
  const pageCount = buildScorePages(song, {pageWidth: EXPORT_PAGE_WIDTH, interactive: false}).pages.length;
  openModal('<h3>Notenblatt exportieren</h3>'
    + '<p style="color:var(--text-2);font-size:13px;line-height:1.5;margin-top:-4px">&bdquo;'+esc(song.title)+'&ldquo; &middot; '+pageCount+' Seite'+(pageCount>1?'n':'')+' im Format A4.</p>'
    + '<div class="option-list">'
      + '<div class="option-row" id="expPdf"><div><div class="option-name">Als PDF exportieren</div><div class="option-sub">Öffnet den Druckdialog &ndash; dort &bdquo;Als PDF sichern&ldquo; wählen</div></div></div>'
      + '<div class="option-row" id="expImg"><div><div class="option-name">Als Bild exportieren</div><div class="option-sub">PNG in doppelter Auflösung, alle Seiten untereinander</div></div></div>'
    + '</div><div class="modal-actions"><button class="btn-ghost" id="mClose">Schließen</button></div>');
  document.getElementById("mClose").onclick=closeModal;
  document.getElementById("expPdf").onclick=()=>{
    closeModal();
    toast("Druckansicht wird vorbereitet …");
    setTimeout(exportAsPdf, 120);
  };
  document.getElementById("expImg").onclick=async ()=>{
    closeModal();
    toast("Bild wird erzeugt …");
    try{
      await exportAsPng();
      toast("Notenblatt als PNG exportiert.");
    }catch(e){
      toast("Bild-Export fehlgeschlagen: " + (e && e.message ? e.message : "unbekannter Fehler"));
    }
  };
}
function openMoreMenu(){
  openModal('<h3>Optionen</h3><div class="option-list">'
    + '<div class="option-row" id="oInstr"><div class="option-name">Instrument ändern</div></div>'
    + '<div class="option-row" id="oKey"><div class="option-name">Tonart ändern</div></div>'
    + '<div class="option-row" id="oTs"><div class="option-name">Taktart ändern</div></div>'
    + '<div class="option-row" id="oTempo"><div class="option-name">Tempo ändern</div></div>'
    + '</div><div class="modal-actions"><button class="btn-ghost" id="mClose">Schließen</button></div>');
  document.getElementById("mClose").onclick=closeModal;
  document.getElementById("oInstr").onclick=()=>{closeModal();openInstrumentModal();};
  document.getElementById("oKey").onclick=()=>{closeModal();openKeyModal();};
  document.getElementById("oTs").onclick=()=>{closeModal();openTimeSigModal();};
  document.getElementById("oTempo").onclick=()=>{closeModal();openTempoModal();};
}

/* ---------------- Boot ---------------- */
// Gespeicherte Bibliothek laden; ohne Speicherstand bleiben die Demo-Songs stehen
// und werden sofort einmal weggeschrieben, damit ab jetzt alles erhalten bleibt.
const hadStoredData = loadPersisted();
renderHeader(); renderDrawer(); renderLibrary(); renderSetlists();
setTab(state.tab || "BIBLIOTHEK");
if(!hadStoredData) persistNow();

// Letzte Rettung: beim Wegwischen oder Schließen der App sofort schreiben,
// statt auf den 300-ms-Timer zu warten.
window.addEventListener("pagehide", persistNow);
window.addEventListener("beforeunload", persistNow);
document.addEventListener("visibilitychange", ()=>{ if(document.visibilityState==="hidden") persistNow(); });

let resizeT=null;
window.addEventListener("resize", ()=>{
  clearTimeout(resizeT);
  resizeT=setTimeout(()=>{ if(state.tab==="EDITOR" && currentSong()) renderStaff(); }, 150);
});

window.addEventListener("notebase:update-ready", ()=>{
  document.getElementById("updateBanner").classList.add("show");
});
document.getElementById("updateReloadBtn").addEventListener("click", ()=>{ window.location.reload(); });
document.getElementById("updateDismissBtn").addEventListener("click", ()=>{
  document.getElementById("updateBanner").classList.remove("show");
});
})();
