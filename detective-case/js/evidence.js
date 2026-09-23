import { state } from "./gameState.js";
import { renderEvidence } from "./ui.js";

export const evidenceData = [
  {id:"coffee",name:"Victim's Coffee Cup",category:"Physical",location:"Study",importance:"important",desc:"The victim's porcelain coffee cup contains the final beverage he consumed. Laboratory screening later identifies the same unidentified toxic compound found in the toxicology report. The cup establishes the delivery vehicle, not the handler by itself.",related:["meera"]},
  {id:"watch",name:"Broken Watch",category:"Physical",location:"Study carpet",importance:"minor",desc:"Raghavendra's watch stopped at 11:31 PM after its strap broke. The stop time is useful as a scene marker, but it is not automatically the time of death.",related:["victim"]},
  {id:"torn-document",name:"Torn Business Document",category:"Physical",location:"Desk",importance:"important",desc:"A torn page refers to a cancelled technology partnership and a revised authority clause. The missing line points to an internal review of an altered contract file.",related:["vikram","meera"]},
  {id:"glass",name:"Glass Fragment",category:"Physical",location:"Near bookshelf",importance:"minor",desc:"A small glass fragment from a decorative paperweight. It is unrelated to the fatal event.",related:[]},
  {id:"footprint",name:"Wet Footprint",category:"Environmental",location:"Study doorway",importance:"important",desc:"A partial footprint is wet and carries fine red garden soil. It matches the garden path after the rain, but its direction is ambiguous.",related:["vikram","kiran"]},
  {id:"key",name:"Study Key",category:"Physical",location:"Kiran's desk",importance:"important",desc:"A spare mechanical key for the study is kept in the security room. The log shows it was signed out at 10:58 PM and returned at 11:08 PM.",related:["kiran"]},
  {id:"security",name:"Security Timestamp Log",category:"Digital",location:"Security Room",importance:"critical",desc:"The west-camera feed records Vikram's vehicle still beside the service gate at 11:31 PM, contradicting his claim that he left at 11:20 PM.",related:["vikram","kiran"]},
  {id:"phone",name:"Phone Activity Record",category:"Digital",location:"Garage / phone export",importance:"minor",desc:"Aditya's phone connected to the villa Wi-Fi at 11:24 PM. He said he was outside in the garage. The garage access point reaches the garage, so this does not prove he was inside the house.",related:["aditya"]},
  {id:"deleted-message",name:"Recovered Deleted Message",category:"Digital",location:"Meera's phone backup",importance:"critical",desc:"A recovered backup shows Raghavendra wrote to Meera at 10:46 PM: 'Bring the partnership file. We need to discuss what you changed before tomorrow's board meeting.' The message was deleted from Meera's phone after it was sent.",related:["meera"]},
  {id:"upi",name:"UPI Transaction Record",category:"Digital",location:"Victim's laptop",importance:"important",desc:"A 10:41 PM payment from a shell consultancy to an account controlled by a Vikram-linked entity appears in the victim's transaction history. The payment is part of the business dispute.",related:["vikram"]},
  {id:"computer",name:"Computer Activity",category:"Digital",location:"Study computer",importance:"critical",desc:"A draft email was opened at 11:04 PM and last edited at 11:18 PM. It names Meera as the person responsible for an unauthorized alteration to a contract file and states that the board will be shown the audit trail the next morning.",related:["meera"]},
  {id:"toxicology",name:"Toxicology Report",category:"Forensic",location:"Medical examiner file",importance:"critical",desc:"The medical examiner finds a rare unidentified toxic compound in Raghavendra's blood. The exposure window is consistent with the evening coffee, and the same compound is detected in residue from the victim's cup. This establishes poisoning through the beverage as the cause of death.",related:["meera"]},
  {id:"coffee-trace",name:"Coffee Handling Trace",category:"Forensic",location:"Victim's cup and service tray",importance:"critical",desc:"Trace analysis links the service tray and the victim's cup to Meera's handling during the 10:37 PM coffee service. No corresponding handling trace is found for Ananya, Aditya, Vikram or Kiran in the tested samples.",related:["meera"]},
  {id:"contract-audit",name:"Contract Audit Trail",category:"Digital",location:"Company document system",importance:"critical",desc:"The document system records Meera's credentials making an unauthorized alteration to the partnership contract at 9:58 PM. The change would have redirected a major commission and was scheduled for review by Raghavendra at the next morning's board meeting.",related:["meera"]},
  {id:"termination-draft",name:"Draft Termination Notice",category:"Digital",location:"Victim's computer",importance:"critical",desc:"Raghavendra's unsent draft states that Meera would be removed from the company and referred for formal investigation after the contract audit. The draft was created before the fatal incident and provides a direct, documented motive.",related:["meera"]},
  {id:"coffee-log",name:"Kitchen Service Log",category:"Testimonial",location:"Kitchen",importance:"critical",desc:"The kitchen notebook records that Meera collected the victim's evening coffee at 10:37 PM and delivered it to the office corridor. No one else signed for it. The service time falls inside the toxicology exposure window.",related:["meera"]},
  {id:"camera-gap",name:"Missing Security Footage",category:"Digital",location:"Security Room",importance:"important",desc:"Four minutes are missing from the east-camera archive between 11:26 PM and 11:30 PM. Kiran admits he deleted it after a camera fault and has logs showing the fault.",related:["kiran"]},
  {id:"kannada-note",name:"Kannada Handwritten Note",category:"Physical",location:"Library",importance:"minor",desc:"A note reminding Ananya about a family appointment. It confirms her library alibi was plausible but does not independently prove every minute.",related:["ananya"]},
  {id:"weather",name:"Rainfall Log",category:"Environmental",location:"Security console",importance:"important",desc:"Heavy rain began at 11:18 PM. Garden soil became wet shortly afterward, making a wet footprint possible during the relevant window.",related:[]},
  {id:"door",name:"Self-Latching Study Door",category:"Environmental",location:"Study",importance:"critical",desc:"The study door has a self-latching lock. It locks automatically when pulled shut, while the inside thumb-turn can remain in its normal position. The room did not need to be locked from the inside to appear locked.",related:[]}
];

export function collectEvidence(id, addScore=true) {
  if (state.collectedEvidence.includes(id)) return false;
  state.collectedEvidence.push(id);
  if (addScore) state.score += evidenceData.find(e => e.id === id)?.importance === "critical" ? 500 : 250;
  return true;
}

export function getEvidence(id) {
  return evidenceData.find(e => e.id === id);
}

export function categoryEvidence(category) {
  return evidenceData.filter(e => e.category === category);
}

export function canRevealEvidence(id) {
  const prereqs = {
    "deleted-message": ["meera-interview"],
    "computer": ["meera-interview"],
    "coffee-log": ["kitchen-search"],
    "security": ["kiran-interview"],
    "camera-gap": ["kiran-interview"],
    "door": ["door-puzzle"]
  };
  return !prereqs[id] || prereqs[id].every(p => state.solvedPuzzles.includes(p) || state.interviewedSuspects.includes(p));
}

export function findConnections(a,b) {
  const pair = [a,b].sort().join("|");
  const valid = {
    "security|vikram": "The vehicle timestamp conflicts with Vikram's stated departure time.",
    "computer|meera": "The draft email gives Meera a concrete motive tied to the altered contract.",
    "coffee-log|deleted-message": "Meera handled the victim's coffee shortly after receiving an urgent instruction from him.",
    "door|security": "The self-latching door means the killer did not need to remain inside after leaving.",
    "coffee-log|door": "The coffee was delivered before the victim later secured himself in the study.",
    "computer|coffee-log": "The victim's computer activity continues after the coffee was delivered, placing the drink before the final work session.",
    "upi|vikram": "The payment record strengthens the business-dispute motive, but does not by itself prove murder.",
    "phone|aditya": "Aditya's Wi-Fi connection is consistent with the garage and does not establish a crime-scene presence.",
    "camera-gap|kiran": "Kiran's deletion is supported by a camera-fault record, making the missing footage suspicious but not conclusive."
  };
  return valid[pair] || null;
}

export function registerConnection(a,b) {
  const pair = [a,b].sort().join("|");
  if (state.discoveredConnections.some(c => c.pair === pair)) return null;
  const text = findConnections(a,b);
  if (!text) { state.mistakes++; state.score = Math.max(0,state.score-100); return false; }
  state.discoveredConnections.push({pair,text});
  state.score += 400;
  return text;
}
