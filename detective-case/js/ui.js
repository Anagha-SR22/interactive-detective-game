import { state } from "./gameState.js";
import { evidenceData } from "./evidence.js";
import { suspects, questions, answerQuestion, interview } from "./suspects.js";
import { getTimelineItems, moveEvent, checkTimeline } from "./timeline.js";
import { puzzles, solvePuzzle } from "./puzzles.js";

export const $ = sel => document.querySelector(sel);

export function setStatus(text) {
  const el = $("#status-message"); if (el) el.textContent = text;
}

export function toast(text) {
  const root = $("#toast-root");
  const el = document.createElement("div");
  el.textContent = text;
  el.style.cssText = "position:fixed;right:18px;bottom:52px;z-index:200;max-width:380px;padding:12px 15px;background:#201b17;border:1px solid #725d3d;color:#e4d8c5;box-shadow:0 10px 30px #0008;font-size:.75rem";
  root.appendChild(el); setTimeout(()=>el.remove(),3600);
}

export function showModal(html) {
  const root=$("#modal-root");
  root.innerHTML=`<div class="overlay"><div class="modal-card"><button class="modal-close" aria-label="Close">×</button><div class="modal-body">${html}</div></div></div>`;
  root.querySelector(".modal-close").onclick=()=>root.innerHTML="";
  root.querySelector(".overlay").onclick=e=>{if(e.target.classList.contains("overlay"))root.innerHTML=""};
}

export function renderScene() {
  const found = state.collectedEvidence.length;
  return `<div class="section-head scene-heading"><div><div class="kicker">Crime scene · 11:42 PM</div><h2>Raghavendra Rao's Study</h2><p class="scene-subtitle">A rain-soaked study. Move across the room, inspect highlighted objects and build the evidence chain.</p></div><div class="scene-tools"><span class="scene-live"><i></i> LIVE SCENE</span><span class="scene-counter">${found}/10 evidence</span></div></div>
  <div class="scene-layout enhanced-scene-layout">
    <div class="scene-room cinematic-room" aria-label="Interactive illustrated crime scene">
      <div class="scene-vignette"></div>
      <div class="rain-layer rain-a"></div><div class="rain-layer rain-b"></div>
      <div class="room-wall"></div><div class="wall-panel wall-panel-a"></div><div class="wall-panel wall-panel-b"></div>
      <div class="ceiling-light"></div><div class="lamp-glow"></div>
      <div class="window object hotspot" data-object="window" tabindex="0" role="button" aria-label="Examine rain-streaked window"><div class="window-sky"><span class="moon"></span><span class="cloud c1"></span><span class="cloud c2"></span></div><div class="window-frame-v"></div><div class="window-frame-h"></div><span class="window-label">RAIN · 11:42 PM</span></div>
      <div class="painting object hotspot" data-object="painting" tabindex="0" role="button" aria-label="Examine painting"><div class="painting-art"><span></span></div></div>
      <div class="clock object hotspot" data-object="clock" tabindex="0" role="button" aria-label="Examine wall clock"><span class="clock-face"></span><i class="hand hand-h"></i><i class="hand hand-m"></i><b>11:42</b></div>
      <div class="bookshelf object hotspot" data-object="bookshelf" tabindex="0" role="button" aria-label="Examine bookshelf"><div class="book-row r1"></div><div class="book-row r2"></div><div class="book-row r3"></div></div>
      <div class="fireplace object hotspot" data-object="fireplace" tabindex="0" role="button" aria-label="Examine fireplace"><div class="mantel"></div><div class="firebox"><span></span><span></span><span></span></div></div>
      <div class="desk object hotspot" data-object="desk" tabindex="0" role="button" aria-label="Examine desk"><div class="desk-top"></div><div class="desk-drawer d1"></div><div class="desk-drawer d2"></div><div class="desk-leg l1"></div><div class="desk-leg l2"></div><div class="paper p1"></div><div class="paper p2"></div><div class="desk-lamp"><i></i></div></div>
      <div class="chair object hotspot" data-object="chair" tabindex="0" role="button" aria-label="Examine chair"><div class="chair-back"></div><div class="chair-seat"></div><div class="chair-leg"></div></div>
      <div class="rug"><span></span></div>
      <div class="coffee object hotspot evidence-hotspot" data-object="coffee" tabindex="0" role="button" aria-label="Examine coffee cup"><div class="cup-body"></div><div class="cup-handle"></div><div class="coffee-steam s1"></div><div class="coffee-steam s2"></div><span class="hotspot-pulse"></span><label>COFFEE</label></div>
      <div class="phone object hotspot" data-object="phone" tabindex="0" role="button" aria-label="Examine telephone"><div class="phone-body"></div><div class="phone-screen"></div></div>
      <div class="glass object hotspot" data-object="glass" tabindex="0" role="button" aria-label="Examine glass fragment"><div class="glass-body"></div><span class="glass-shine"></span></div>
      <div class="door object hotspot" data-object="door" tabindex="0" role="button" aria-label="Examine study door"><div class="door-panel ptop"></div><div class="door-panel pbottom"></div><div class="door-knob"></div><span class="door-label">SELF-LATCHING</span></div>
      <div class="scene-caption"><span class="caption-dot"></span><span>Rain against the glass · the study is otherwise silent</span></div>
    </div>
    <aside class="panel scene-legend cinematic-log">
      <div class="log-header"><div><span class="kicker">FIELD NOTES</span><h3>Scene log</h3></div><span class="case-stamp">RRV</span></div>
      <div class="scene-status-card"><span>INITIAL READ</span><strong>Locked room. No forced entry.</strong><small>Click the glowing objects to investigate.</small></div>
      <ul class="scene-clues">
        <li><span class="clue-icon">01</span><div><b>Door</b><small>Self-latching mechanism</small></div></li>
        <li><span class="clue-icon">02</span><div><b>Weather</b><small>Heavy rain · window intact</small></div></li>
        <li><span class="clue-icon">03</span><div><b>Desk</b><small>Documents left mid-work</small></div></li>
        <li><span class="clue-icon clue-hot">04</span><div><b>Coffee</b><small>Priority forensic lead</small></div></li>
      </ul>
      <div class="scene-progress"><div class="progress-head"><span class="kicker">EVIDENCE DISCOVERED</span><strong>${found}/10</strong></div><div class="progress"><i style="width:${Math.min(100,found/10*100)}%"></i></div><small class="muted">Every clue should connect to a defensible timeline.</small></div>
      <button id="hint-btn" class="btn btn-ghost scene-hint">Use Hint · −250</button>
    </aside>
  </div>`;
}

const objectInfo = {
  desk:{title:"DESK",text:"Several documents are scattered across the desk. One appears partially torn. The computer is still powered. A closer review reveals the contract audit trail and an unsent termination notice prepared by the victim.",evidence:["torn-document","contract-audit","termination-draft"]},
  chair:{title:"CHAIR",text:"The chair is slightly displaced. There are no obvious signs of a struggle.",evidence:[]},
  clock:{title:"WALL CLOCK",text:"The wall clock is accurate. It does not match the victim's stopped wristwatch, which is a useful warning against assuming every stopped clock marks the death.",evidence:[]},
  window:{title:"WINDOW",text:"Rain is visible through the window. The latch is intact and there are no fresh scrape marks.",evidence:["weather"]},
  door:{title:"DOOR",text:"The study door is a self-latching design. It can appear locked after someone pulls it shut. This matters to the locked-room puzzle.",evidence:["door"]},
  bookshelf:{title:"BOOKSHELF",text:"Mostly business and Kannada-language books. A decorative paperweight appears chipped.",evidence:["glass"]},
  fireplace:{title:"FIREPLACE",text:"Cold tonight. Ash is undisturbed. Nothing here connects directly to the fatal event.",evidence:[]},
  painting:{title:"PAINTING",text:"A landscape. No hidden compartment, because apparently detectives are not required to dismantle every wall.",evidence:[]},
  phone:{title:"TELEPHONE",text:"The desk telephone has no outgoing call after 11:00 PM.",evidence:["phone"]},
  coffee:{title:"COFFEE CUP",text:"The victim's coffee cup contains residue consistent with the compound identified in the toxicology report. The service log and handling trace can establish who brought the beverage to him.",evidence:["coffee","toxicology","coffee-trace"]},
  glass:{title:"GLASS FRAGMENT",text:"A fragment from a decorative paperweight. It does not fit the broken-watch strap or the window.",evidence:["glass"]},
  chair:{title:"CHAIR",text:"The chair has shifted a few centimetres. This is too weak to establish anything by itself.",evidence:[]}
};

export function examineObject(id) {
  const info=objectInfo[id]; if(!info)return;
  showModal(`<div class="kicker">OBJECT EXAMINATION</div><h2>${info.title}</h2><p class="dialogue-text">${info.text}</p><div class="button-row">${info.evidence.map(e=>`<button class="btn btn-primary collect-evidence" data-evidence="${e}">Collect evidence</button>`).join("")}<button class="btn btn-ghost modal-done">Close</button></div>`);
}

export function renderEvidence(filter="All", search="") {
  const list=evidenceData.filter(e=>state.collectedEvidence.includes(e.id)).filter(e=>filter==="All"||e.category===filter).filter(e=>(e.name+" "+e.desc).toLowerCase().includes(search.toLowerCase()));
  return `<div class="section-head"><div><div class="kicker">Case file</div><h2>Evidence Inventory</h2></div><p class="muted">${state.collectedEvidence.length} items collected</p></div>
  <input class="search-input" id="evidence-search" placeholder="Search evidence..." value="${search}">
  <div class="evidence-toolbar">${["All","Physical","Digital","Testimonial","Environmental","Forensic"].map(c=>`<button class="filter-btn ${filter===c?"active":""}" data-filter="${c}">${c}</button>`).join("")}</div>
  ${list.length?`<div class="grid grid-3">${list.map(e=>`<article class="panel card evidence-card ${e.importance}"><span class="tag">${e.category}</span><h3>${e.name}</h3><p>${e.desc}</p><div class="evidence-meta"><span>${e.location}</span><span>${e.importance}</span></div><button class="btn btn-ghost evidence-detail" data-evidence="${e.id}">Examine</button></article>`).join("")}</div>`:`<div class="empty">No evidence matches this view. Search less aggressively. The truth is already complicated enough.</div>`}`;
}

export function renderSuspects() {
  return `<div class="section-head"><div><div class="kicker">People of interest</div><h2>Five Suspects</h2></div><p class="muted">Suspicion is not proof. Human beings continue to make that mistake.</p></div>
  <div class="grid grid-2">${suspects.map(s=>`<article class="panel suspect-card"><div class="portrait">${s.initial}</div><div style="flex:1"><h3>${s.name}</h3><p>${s.age} · ${s.role}</p><p><b>Motive:</b> ${s.motive}</p><p><b>Alibi:</b> ${s.alibi}</p><p><b>Suspicious detail:</b> ${s.detail}</p><div class="suspicion"><small class="muted">Suspicion ${state.suspectStates[s.id].suspicion}%</small><div class="bar"><i style="width:${state.suspectStates[s.id].suspicion}%"></i></div></div><button class="btn btn-primary interrogate" data-suspect="${s.id}" style="margin-top:12px">Interrogate</button></div></article>`).join("")}</div>`;
}

export function renderInterrogation(id) {
  interview(id);
  const s=suspects.find(x=>x.id===id); const qs=questions[id];
  return `<div class="section-head"><div><div class="kicker">Interview room</div><h2>${s.name}</h2></div><button class="btn btn-ghost" id="back-suspects">Back to suspects</button></div>
  <div class="interrogation"><aside class="panel interrogation-side"><div class="portrait" style="width:85px;height:85px;font-size:1.7rem">${s.initial}</div><h3 style="font:600 1.7rem 'Cormorant Garamond';margin:12px 0 4px">${s.name}</h3><p class="muted">${s.role}</p><hr style="border-color:#332c25"><p class="muted"><b>Motive:</b> ${s.motive}</p><p class="muted"><b>Alibi:</b> ${s.alibi}</p></aside><section class="panel interrogation-main">
  <div class="dialogue-box"><div class="speaker">${s.name}</div><div id="dialogue-text" class="dialogue-text">"Ask a precise question. I will answer what I choose to answer."</div></div>
  <div class="question-list">${qs.map(q=>`<button class="question ${state.suspectStates[id].questions.includes(q.id)?"locked":""}" data-question="${q.id}" data-suspect="${id}" ${state.suspectStates[id].questions.includes(q.id)?"disabled":""}>${q.label}</button>`).join("")}</div>
  ${state.contradictionsFound.includes(id)?`<div class="conflict">CONTRADICTION FOUND · This suspect's account now conflicts with collected evidence.</div>`:""}
  </section></div>`;
}

export function renderTimelineView() {
  const items=getTimelineItems();
  return `<div class="section-head"><div><div class="kicker">Sequence reconstruction</div><h2>Timeline</h2></div><p class="muted">Rearrange the events. Use evidence, not intuition.</p></div>
  <div class="panel card timeline">${items.map((e,i)=>`<div class="timeline-event" draggable="true" data-drag-index="${i}"><span class="dot"></span><span class="time">${e.time}</span><span class="desc">${e.desc}</span><span class="move-buttons"><button data-move="${i},-1" aria-label="Move event up">↑</button><button data-move="${i},1" aria-label="Move event down">↓</button></span></div>`).join("")}</div>
  <div class="timeline-controls"><button id="check-timeline" class="btn btn-primary">Check Timeline</button><button class="btn btn-ghost" data-puzzle="security-puzzle">Security Timestamp Puzzle</button><button class="btn btn-ghost" data-puzzle="phone-puzzle">Phone Records Puzzle</button><button class="btn btn-ghost" data-puzzle="document-puzzle">Document Puzzle</button><button class="btn btn-ghost" data-puzzle="door-puzzle">Locked Door Puzzle</button></div>`;
}

export function openPuzzle(id) {
  const p=puzzles[id];
  showModal(`<div class="kicker">INVESTIGATION PUZZLE</div><h2>${p.title}</h2><p>${p.prompt}</p><div class="question-list">${p.options.map(o=>`<button class="question puzzle-answer" data-puzzle="${id}" data-answer="${o[0]}">${o[1]}</button>`).join("")}</div>`);
}

export function renderNotes() {
  return `<div class="section-head"><div><div class="kicker">Detective notebook</div><h2>Case Notes</h2></div><p class="muted">Your notes persist locally.</p></div>
  <div class="panel card"><textarea id="note-input" rows="7" style="width:100%;background:#141210;border:1px solid #40372f;color:#ddd;padding:13px" placeholder="Write an observation..."></textarea><button id="save-note" class="btn btn-primary" style="margin-top:10px">Save Note</button></div>
  <div class="grid grid-2" style="margin-top:14px">${state.notes.map((n,i)=>`<article class="panel card"><p style="white-space:pre-wrap;line-height:1.6;color:#cfc3b3">${n.text}</p><small class="muted">${n.time}</small><br><button class="btn btn-ghost delete-note" data-note="${i}" style="margin-top:8px">Delete</button></article>`).join("") || `<div class="empty">No notes yet.</div>`}</div>`;
}

export function renderView(view) {
  state.currentView=view;
  document.querySelectorAll(".view").forEach(v=>v.classList.remove("active-view"));
  const el=$("#view-"+view); if(!el)return;
  el.classList.add("active-view");
  if(view==="scene")el.innerHTML=renderScene();
  if(view==="evidence")el.innerHTML=renderEvidence();
  if(view==="suspects")el.innerHTML=renderSuspects();
  if(view==="timeline")el.innerHTML=renderTimelineView();
  if(view==="deduction") {
    import("./deduction.js").then(m=>el.innerHTML=m.renderDeduction());
  }
  if(view==="notes")el.innerHTML=renderNotes();
  document.querySelectorAll(".nav-btn").forEach(b=>b.classList.toggle("active",b.dataset.view===view));
}

export function updateHeader() {
  $("#score-display").textContent=state.score;
  $("#evidence-count").textContent=state.collectedEvidence.length;
  $("#timer-display").textContent=formatTime(state.investigationTime);
}
function formatTime(sec){return `${String(Math.floor(sec/60)).padStart(2,"0")}:${String(sec%60).padStart(2,"0")}`}
