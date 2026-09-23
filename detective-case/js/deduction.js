import { state } from "./gameState.js";
import { evidenceData, registerConnection, getEvidence } from "./evidence.js";
import { suspects } from "./suspects.js";
import { getEnding, finalScore } from "./scoring.js";
import { showModal, toast, setStatus } from "./ui.js";

export function renderDeduction() {
  const cards = [
    ...suspects.map(s => ({id:s.id,title:s.name,type:"Suspect",desc:s.role})),
    ...evidenceData.filter(e => state.collectedEvidence.includes(e.id)).map(e => ({id:e.id,title:e.name,type:"Evidence",desc:e.category}))
  ];
  const connections = state.discoveredConnections.map(c => `<div class="connection">${c.text}</div>`).join("");
  return `
    <div class="section-head"><div><div class="kicker">Reasoning layer</div><h2>Deduction Board</h2></div><p class="muted">Select two cards to test a connection. The board does not reward random clicking. Civilization survives another day.</p></div>
    <div class="evidence-board" id="board">
      ${cards.map(c => `<div class="board-card ${state.selectedBoardItems.includes(c.id)?"selected":""}" data-board-id="${c.id}">
        <div class="tag">${c.type}</div><h4>${c.title}</h4><p>${c.desc}</p>
      </div>`).join("")}
    </div>
    <div class="panel card connection-list"><div class="kicker">Discovered relationships</div>${connections || `<p class="muted">No strong connections established yet.</p>`}</div>
    <div class="panel card" style="margin-top:14px">
      <div class="section-head"><div><div class="kicker">Final theory</div><h2 style="font-size:1.7rem">Build the accusation</h2></div></div>
      ${renderVerdictForm()}
    </div>`;
}

function renderVerdictForm() {
  const opts = suspects.map(s => `<option value="${s.id}">${s.name}</option>`).join("");
  const evidenceOpts = evidenceData.filter(e=>state.collectedEvidence.includes(e.id)).map(e=>`<option value="${e.id}">${e.name}</option>`).join("");
  return `<div class="grid grid-2">
    <label>CLUPRIT<select id="verdict-culprit"><option value="">Select suspect</option>${opts}</select></label>
    <label>MOTIVE<select id="verdict-motive"><option value="">Select explanation</option><option value="fraud-exposure">Contract fraud and imminent exposure</option><option value="career">Career and contract alteration</option><option value="inheritance">Inheritance dispute</option><option value="debt">Personal debt</option><option value="business">Business deal collapse</option></select></label>
    <label>METHOD<select id="verdict-method"><option value="">Select explanation</option><option value="poisoned-coffee">Poisoned coffee with delayed effect</option><option value="coffee">Delayed effect through the victim's coffee</option><option value="forced">Forced entry</option><option value="window">Window entry</option><option value="unknown">Unknown</option></select></label>
    <label>KEY EVIDENCE<select id="verdict-key"><option value="">Select evidence</option>${evidenceOpts}</select></label>
    <label>SUPPORTING EVIDENCE<select id="verdict-support"><option value="">Select evidence</option>${evidenceOpts}</select></label>
    <label>CORROBORATING EVIDENCE<select id="verdict-corroboration"><option value="">Select evidence</option>${evidenceOpts}</select></label>
    <label>DELIVERY RECORD<select id="verdict-delivery"><option value="">Select evidence</option>${evidenceOpts}</select></label>
  </div>
  <button id="submit-verdict" class="btn btn-primary" style="margin-top:16px">Submit Final Verdict</button>`;
}

export function handleBoardClick(id) {
  if (!state.selectedBoardItems.includes(id)) state.selectedBoardItems.push(id);
  if (state.selectedBoardItems.length === 2) {
    const [a,b] = state.selectedBoardItems;
    const text = registerConnection(a,b);
    state.selectedBoardItems = [];
    if (text) toast("Connection discovered: " + text);
    else toast("No strong connection. Keep testing evidence logically.");
  }
}

export function submitVerdict() {
  const get = id => document.getElementById(id)?.value;
  const verdict = {culprit:get("verdict-culprit"),motive:get("verdict-motive"),method:get("verdict-method"),key:get("verdict-key"),support:get("verdict-support"),corroboration:get("verdict-corroboration"),delivery:get("verdict-delivery")};
  if (Object.values(verdict).some(v=>!v)) { toast("Complete every part of the final deduction."); return; }
  state.finalAttempted = true;
  const ending = getEnding(verdict);
  showModal(`<div class="kicker">FINAL CASE REPORT</div><h2>${ending.title}</h2><p class="dialogue-text">${ending.text}</p><div class="panel card" style="margin-top:16px"><b>Final Score: ${ending.score ?? finalScore()}</b><p class="muted">Evidence: ${state.collectedEvidence.length} · Contradictions: ${state.contradictionsFound.length} · Mistakes: ${state.mistakes} · Hints: ${state.hintsUsed}</p></div><div class="button-row"><button class="btn btn-primary" id="review-case">Review Case</button><button class="btn btn-danger" id="retry-case">Try Again</button></div>`);
  document.getElementById("review-case").onclick = () => { const modalRoot = document.getElementById("modal-root"); if (modalRoot) modalRoot.innerHTML = ""; };
  document.getElementById("retry-case").onclick = () => location.reload();
}
