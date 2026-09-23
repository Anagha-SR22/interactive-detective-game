import { state } from "./gameState.js";
import { collectEvidence } from "./evidence.js";

export const baseTimeline = [
  {id:"dinner",time:"10:30 PM",desc:"Dinner begins.",fixed:true},
  {id:"message",time:"10:46 PM",desc:"Raghavendra sends Meera an urgent message about the partnership file.",fixed:false},
  {id:"key",time:"10:58 PM",desc:"Security log records the study key being signed out.",fixed:false},
  {id:"coffee",time:"10:37 PM",desc:"Meera collects Raghavendra's evening coffee from the kitchen.",fixed:false},
  {id:"key-return",time:"11:08 PM",desc:"The study key is returned to security.",fixed:false},
  {id:"meera-office",time:"11:05 PM",desc:"Meera begins office work.",fixed:true},
  {id:"vikram-claim",time:"11:20 PM",desc:"Vikram claims he leaves the villa.",fixed:true},
  {id:"rain",time:"11:18 PM",desc:"Heavy rain begins.",fixed:false},
  {id:"computer",time:"11:18 PM",desc:"The victim's study computer is last edited.",fixed:false},
  {id:"vehicle",time:"11:31 PM",desc:"Security camera records Vikram's vehicle at the service gate.",fixed:false},
  {id:"watch",time:"11:31 PM",desc:"Raghavendra's watch stops after its strap breaks.",fixed:false},
  {id:"phone",time:"11:42 PM",desc:"Unknown phone activity is recorded.",fixed:true},
  {id:"discovery",time:"11:47 PM",desc:"Raghavendra is discovered dead.",fixed:true}
];

const solutionOrder = ["dinner","message","coffee","key","key-return","meera-office","rain","vikram-claim","computer","vehicle","watch","phone","discovery"];

export function initTimeline() {
  if (!state.timelineEvents.length) state.timelineEvents = baseTimeline.map(e => e.id);
}

export function getTimelineItems() {
  initTimeline();
  return state.timelineEvents.map(id => baseTimeline.find(e => e.id === id));
}

export function moveEvent(index, direction) {
  initTimeline();
  const next = index + direction;
  if (next < 0 || next >= state.timelineEvents.length) return;
  [state.timelineEvents[index], state.timelineEvents[next]] = [state.timelineEvents[next], state.timelineEvents[index]];
}

export function checkTimeline() {
  initTimeline();
  const correct = JSON.stringify(state.timelineEvents) === JSON.stringify(solutionOrder);
  if (correct && !state.solvedPuzzles.includes("timeline")) {
    state.solvedPuzzles.push("timeline");
    state.score += 1200;
    collectEvidence("door");
    return true;
  }
  if (!correct) {
    state.mistakes++;
    state.score = Math.max(0,state.score-150);
  }
  return false;
}
