// Dedicated interrogation module.
// Dialogue data and interview mechanics live in suspects.js; this module exposes
// a small API so the project architecture can grow into multiple cases later.
export { questions, interview, answerQuestion } from "./suspects.js";
