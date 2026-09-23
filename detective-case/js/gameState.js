export const initialState = () => ({
  version: 1,
  currentView: "scene",
  currentScene: "study",
  collectedEvidence: [],
  interviewedSuspects: [],
  discoveredConnections: [],
  solvedPuzzles: [],
  contradictionsFound: [],
  timelineEvents: [],
  suspectStates: {
    ananya: { suspicion: 0, trust: 0, questions: [] },
    aditya: { suspicion: 0, trust: 0, questions: [] },
    meera: { suspicion: 0, trust: 0, questions: [] },
    vikram: { suspicion: 0, trust: 0, questions: [] },
    kiran: { suspicion: 0, trust: 0, questions: [] }
  },
  score: 0,
  mistakes: 0,
  hintsUsed: 0,
  investigationTime: 0,
  notes: [],
  selectedBoardItems: [],
  finalAttempted: false
});

export const state = initialState();

export function resetState() {
  Object.assign(state, initialState());
}
