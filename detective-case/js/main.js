import { state, resetState } from "./gameState.js";
import { saveGame, loadGame, hasSave, hydrateState, clearSave } from "./storage.js";
import { renderView, updateHeader, examineObject, showModal, toast, setStatus, renderEvidence, renderInterrogation, openPuzzle } from "./ui.js";
import { collectEvidence, getEvidence } from "./evidence.js";
import { moveEvent, checkTimeline } from "./timeline.js";
import { solvePuzzle } from "./puzzles.js";
import { handleBoardClick, submitVerdict } from "./deduction.js";

const introLines = [
  "11:42 PM · BENGALURU\n\nHeavy rain has brought traffic across the city to a standstill.",
  "Inside Rajarajeshwari Villa, Raghavendra Rao has been found dead inside his private study.",
  "The door was locked. There are no obvious signs of forced entry.",
  "Five people were inside the property. Everyone has a story. Not everyone is telling the truth.",
  "\nYour task is not to guess the murderer.\nBuild the case."
];

let introSkipped=false, timerId=null;

function typeIntro() {
  const el=document.getElementById("intro-text");
  const begin=document.getElementById("begin-btn");
  let line=0, char=0;
  function next(){
    if(introSkipped)return;
    if(line>=introLines.length){begin.disabled=false;return}
    if(char<introLines[line].length){
      el.textContent += introLines[line][char++];
      setTimeout(next, introLines[line][char-1]==="\n"?120:18);
    } else {
      el.textContent += "\n\n"; line++; char=0; setTimeout(next,500);
    }
  }
  next();
  document.getElementById("skip-intro").onclick=()=>{
    introSkipped=true; el.textContent=introLines.join("\n\n"); begin.disabled=false;
  };

  document.getElementById("begin-btn").onclick=()=>{
    if (!begin.disabled) startApp();
  };
}

function startApp(saved=false){
  if(saved) hydrateState(saved);
  document.getElementById("intro-screen").classList.add("hidden");
  document.getElementById("resume-screen").classList.add("hidden");
  document.getElementById("game-app").classList.remove("hidden");
  renderView(state.currentView || "scene");
  updateHeader();
  if(!timerId) timerId=setInterval(()=>{state.investigationTime++;updateHeader();if(state.investigationTime%10===0)saveGame()},1000);
}

function setupResume(){
  if(hasSave()){
    document.getElementById("intro-screen").classList.add("hidden");
    document.getElementById("resume-screen").classList.remove("hidden");
    document.getElementById("continue-btn").onclick=()=>startApp(loadGame());
    document.getElementById("new-case-btn").onclick=()=>{clearSave();resetState();document.getElementById("resume-screen").classList.add("hidden");document.getElementById("intro-screen").classList.remove("hidden");typeIntro()};
  }else typeIntro();
}

document.addEventListener("keydown", e => {
  if ((e.key === "Enter" || e.key === " ") && e.target.closest(".object[role=\"button\"]")) {
    e.preventDefault();
    e.target.closest(".object[role=\"button\"]").click();
  }
});

document.addEventListener("click", async e=>{
  const nav=e.target.closest(".nav-btn");
  if(nav){renderView(nav.dataset.view);return}

  const obj=e.target.closest(".object");
  if(obj){examineObject(obj.dataset.object);return}

  const collect=e.target.closest(".collect-evidence");
  if(collect){
    const id=collect.dataset.evidence;
    if(collectEvidence(id)){
      toast(`Evidence collected: ${getEvidence(id).name}`);
      setStatus("New evidence added to the case file.");
      updateHeader();
      collect.textContent = "Collected";
      collect.disabled = true;
      collect.classList.add("is-collected");
      const remaining = [...collect.parentElement.querySelectorAll(".collect-evidence:not(:disabled)")];
      if(!remaining.length) setTimeout(()=>collect.parentElement.querySelector(".modal-done")?.click(),250);
    } else {
      collect.textContent = "Collected";
      collect.disabled = true;
    }
    return;
  }

  if(e.target.closest(".modal-done")){document.querySelector("#modal-root").innerHTML="";return}

  const filter=e.target.closest(".filter-btn");
  if(filter){
    const view=document.querySelector("#view-evidence");
    const search=view.querySelector("#evidence-search")?.value||"";
    view.innerHTML=renderEvidence(filter.dataset.filter,search);return;
  }

  if(e.target.closest(".evidence-detail")){
    const id=e.target.closest(".evidence-detail").dataset.evidence, ev=getEvidence(id);
    showModal(`<div class="kicker">${ev.category} EVIDENCE</div><h2>${ev.name}</h2><p class="dialogue-text">${ev.desc}</p><p class="muted">Discovered at: ${ev.location}<br>Importance: ${ev.importance}</p>`);return;
  }

  const interrogate=e.target.closest(".interrogate");
  if(interrogate){document.querySelector("#view-suspects").innerHTML=renderInterrogation(interrogate.dataset.suspect);return}

  if(e.target.closest("#back-suspects")){renderView("suspects");return}

  const q=e.target.closest(".question[data-question]");
  if(q && !q.disabled){
    const {answerQuestion}=await import("./suspects.js");
    const answer=answerQuestion(q.dataset.suspect,q.dataset.question);
    document.querySelector("#dialogue-text").textContent=`"${answer}"`;
    const side=document.querySelector("#view-suspects");
    const old=side.innerHTML; side.innerHTML=renderInterrogation(q.dataset.suspect);
    side.querySelector("#dialogue-text").textContent=`"${answer}"`;
    updateHeader(); saveGame(); return;
  }

  const move=e.target.closest("[data-move]");
  if(move){const [i,d]=move.dataset.move.split(",").map(Number);moveEvent(i,d);renderView("timeline");saveGame();return}

  if(e.target.closest("#check-timeline")){
    const ok=checkTimeline(); toast(ok?"TIMELINE RECONSTRUCTED. The sequence now exposes the important gaps.":"The order is not yet supported by the evidence.");renderView("timeline");updateHeader();saveGame();return;
  }

  const puzzleBtn=e.target.closest("[data-puzzle]");
  if(puzzleBtn && !puzzleBtn.classList.contains("puzzle-answer")){openPuzzle(puzzleBtn.dataset.puzzle);return}

  const answer=e.target.closest(".puzzle-answer");
  if(answer){
    const result=solvePuzzle(answer.dataset.puzzle,answer.dataset.answer);
    showModal(`<div class="kicker">${result.correct?"PUZZLE SOLVED":"PUZZLE INCOMPLETE"}</div><h2>${result.correct?"Correct interpretation":"Not enough support"}</h2><p class="dialogue-text">${result.text}</p><button class="btn btn-primary modal-done" style="margin-top:15px">Continue</button>`);
    updateHeader();saveGame();return;
  }

  const board=e.target.closest("[data-board-id]");
  if(board){handleBoardClick(board.dataset.boardId);const {renderDeduction}=await import("./deduction.js");document.querySelector("#view-deduction").innerHTML=renderDeduction();return}

  if(e.target.closest("#submit-verdict")){submitVerdict();saveGame();return}

  if(e.target.closest("#save-note")){
    const input=document.querySelector("#note-input"); if(input.value.trim()){state.notes.push({text:input.value.trim(),time:new Date().toLocaleString("en-IN")});input.value="";saveGame();renderView("notes");toast("Note saved.");} return;
  }

  const del=e.target.closest(".delete-note");
  if(del){state.notes.splice(Number(del.dataset.note),1);saveGame();renderView("notes");return}

  if(e.target.closest("#hint-btn")){
    state.hintsUsed++;state.score=Math.max(0,state.score-250);
    const hints=[
      "One suspect's timeline does not completely match their statement.",
      "Look carefully at the security records and the coffee service log.",
      "Compare what Meera handled before the victim's final work session with the locked-door mechanism."
    ];
    showModal(`<div class="kicker">HINT ${state.hintsUsed}</div><h2>Investigation Hint</h2><p class="dialogue-text">${hints[Math.min(state.hintsUsed-1,2)]}</p>`);
    updateHeader();saveGame();return;
  }

  if(e.target.closest("#save-now")){saveGame();toast("Case saved locally.");}
});


let draggedTimelineIndex = null;
document.addEventListener("dragstart", e => {
  const item = e.target.closest(".timeline-event");
  if (!item) return;
  draggedTimelineIndex = Number(item.dataset.dragIndex);
  item.style.opacity = ".45";
});
document.addEventListener("dragend", e => {
  const item = e.target.closest(".timeline-event");
  if (item) item.style.opacity = "";
  draggedTimelineIndex = null;
});
document.addEventListener("dragover", e => {
  if (e.target.closest(".timeline-event")) e.preventDefault();
});
document.addEventListener("drop", e => {
  const target = e.target.closest(".timeline-event");
  if (!target || draggedTimelineIndex === null) return;
  e.preventDefault();
  const targetIndex = Number(target.dataset.dragIndex);
  if (draggedTimelineIndex === targetIndex) return;
  import("./gameState.js").then(({state}) => {
    const arr = state.timelineEvents;
    const [moved] = arr.splice(draggedTimelineIndex, 1);
    arr.splice(targetIndex, 0, moved);
    renderView("timeline");
    saveGame();
  });
});

document.addEventListener("input",e=>{
  if(e.target.id==="evidence-search"){
    const view=document.querySelector("#view-evidence");
    const active=view.querySelector(".filter-btn.active")?.dataset.filter||"All";
    view.innerHTML=renderEvidence(active,e.target.value);
  }
});

window.addEventListener("beforeunload",saveGame);
setupResume();
