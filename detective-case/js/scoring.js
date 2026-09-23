import { state } from "./gameState.js";

export function finalScore() {
  return Math.max(0, state.score - state.hintsUsed * 250 - state.mistakes * 100);
}

export function getEnding(verdict) {
  const score = finalScore();
  if (!verdict) return {type:"inconclusive",title:"INSUFFICIENT EVIDENCE",text:"A detective cannot solve a case by guessing. The investigation remains open."};
  if (verdict.culprit === "meera" && verdict.motive === "fraud-exposure" && verdict.method === "poisoned-coffee" && verdict.key === "toxicology" && verdict.support === "contract-audit" && verdict.corroboration === "coffee-trace" && verdict.delivery === "coffee-log") {
    return {type:"perfect",title:"CASE SOLVED · BEYOND REASONABLE DOUBT",text:"The evidence forms a continuous chain: Meera altered the partnership contract for financial gain; Raghavendra discovered the alteration and prepared to expose and terminate her; his 10:46 PM message summoned her; the kitchen log places her handling and delivery of his coffee at 10:37 PM; forensic testing links the same toxic compound to the cup and his blood; the handling trace excludes the other suspects in the tested samples; and the self-latching door explains how she left without creating a forced-entry scene. The motive, opportunity, method and forensic evidence independently reinforce one another.",score};
  }
  if (verdict.culprit === "meera") return {type:"culprit",title:"CULPRIT IDENTIFIED",text:"You identified the correct murderer, but several parts of the method or evidentiary chain remain unresolved.",score};
  return {type:"wrong",title:"CASE UNSOLVED",text:"Your evidence was insufficient to establish guilt. The real sequence of events remains hidden.",score};
}
