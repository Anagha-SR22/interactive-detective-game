import { state } from "./gameState.js";
import { collectEvidence } from "./evidence.js";

export const puzzles = {
  "door-puzzle": {
    title:"Puzzle 3 · Locked Door",
    prompt:"The study was found locked. Which explanation best fits the physical evidence?",
    options:[
      ["forced","The door was kicked shut from outside."],
      ["self","The door self-latches when pulled closed, so the killer could leave before it locked."],
      ["magic","The lock was controlled by an unknown supernatural force."]
    ],
    correct:"self",
    success:"The self-latching mechanism explains the locked-room appearance without requiring the killer to remain inside."
  },
  "document-puzzle": {
    title:"Puzzle 4 · Torn Document",
    prompt:"Reconstruct the missing logic in the torn business document.",
    options:[
      ["a","The document says the partnership was expanding normally."],
      ["b","The missing clause concerns an internal review of an altered contract file."],
      ["c","The document is a personal family invitation."]
    ],
    correct:"b",
    success:"The torn page connects the business dispute to an internal contract alteration."
  },
  "security-puzzle": {
    title:"Puzzle 1 · Security Timestamp",
    prompt:"Vikram says he left at 11:20 PM. What should you conclude from the 11:31 PM vehicle record?",
    options:[
      ["a","His vehicle was still near the service gate, so his departure story is incomplete."],
      ["b","The camera proves Vikram was inside the study."],
      ["c","The camera is automatically false because it disagrees with a suspect."]
    ],
    correct:"a",
    success:"The record establishes a contradiction, but not by itself a murder conviction."
  },
  "phone-puzzle": {
    title:"Puzzle 2 · Phone Records",
    prompt:"Aditya's phone connects to the villa Wi-Fi at 11:24 PM. What is the strongest interpretation?",
    options:[
      ["a","He must have been in the study."],
      ["b","The garage has an access point, so the record does not establish his location inside the house."],
      ["c","His phone was switched off."]
    ],
    correct:"b",
    success:"This clue is a red herring. Network presence is not the same as room presence."
  }
};

export function solvePuzzle(id, answer) {
  const puzzle = puzzles[id];
  if (!puzzle) return null;
  if (answer === puzzle.correct) {
    if (!state.solvedPuzzles.includes(id)) {
      state.solvedPuzzles.push(id);
      state.score += 700;
      if (id === "door-puzzle") collectEvidence("door");
      if (id === "security-puzzle") collectEvidence("security");
      if (id === "phone-puzzle") collectEvidence("phone");
    }
    return {correct:true,text:puzzle.success};
  }
  state.mistakes++;
  state.score = Math.max(0,state.score-150);
  return {correct:false,text:"That interpretation is not sufficiently supported by the evidence."};
}
