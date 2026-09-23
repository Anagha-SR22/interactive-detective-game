import { state } from "./gameState.js";
import { collectEvidence } from "./evidence.js";

export const suspects = [
  {id:"ananya",name:"Ananya Rao",age:52,role:"Wife of the victim",initial:"AR",motive:"Inheritance disagreement and conflict over the future of the family company.",alibi:"Library, 11:10 PM–11:55 PM",detail:"Her coffee is found near the study."},
  {id:"aditya",name:"Aditya Rao",age:27,role:"Son of the victim",initial:"AD",motive:"Personal debt and disagreement over company control.",alibi:"Garage, making a phone call",detail:"His phone connected to the villa Wi-Fi at 11:24 PM."},
  {id:"meera",name:"Meera Nair",age:31,role:"Personal assistant",initial:"MN",motive:"She secretly altered a partnership contract to redirect a major commission to a company account she controlled. Raghavendra discovered the alteration and planned to expose and terminate her at the next morning's board meeting.",alibi:"Office, working",detail:"She deleted Raghavendra's 10:46 PM message and later denied returning to the study after the coffee delivery."},
  {id:"vikram",name:"Vikram Shetty",age:45,role:"Business partner",initial:"VS",motive:"A major partnership deal was collapsing and money had moved through a linked consultancy.",alibi:"Left the villa at 11:20 PM",detail:"Security records place his vehicle near the service gate at 11:31 PM."},
  {id:"kiran",name:"Kiran Gowda",age:41,role:"Head of security",initial:"KG",motive:"Unknown at first.",alibi:"Security room monitoring cameras",detail:"A section of footage is missing."}
];

export const questions = {
  ananya: [
    {id:"where",label:"Where were you?",answer:"I was in the library from around 11:10 until I heard the commotion. I was sorting the family papers."},
    {id:"relationship",label:"Your relationship with Raghavendra",answer:"We argued about the business and inheritance. Arguments are not unusual in a family. Murder is."},
    {id:"study",label:"Did you enter the study?",answer:"Not after dinner. My coffee was prepared for me in the kitchen, and I left it on a side table earlier."}
  ],
  aditya: [
    {id:"where",label:"Where were you?",answer:"In the garage. I needed privacy for a call about a debt. I did not go into the study."},
    {id:"phone",label:"Your phone was on the villa Wi-Fi",answer:"The garage has its own access point. Check the network map before turning a connection into a crime scene."},
    {id:"debt",label:"Tell me about your debt",answer:"I owed money. Father knew. He refused to bail me out. That is embarrassing, not evidence of murder."}
  ],
  meera: [
    {id:"where",label:"Where were you?",answer:"I was in the office working through tomorrow's board papers."},
    {id:"relationship",label:"What was your relationship with Raghavendra?",answer:"Professional. Demanding, but professional."},
    {id:"study",label:"Did you enter the study?",answer:"I delivered papers earlier. I did not return there after that."},
    {id:"message",label:"Ask about the deleted message",answer:"He sent too many messages. I deleted one because it contained a private accusation and I did not want it on my personal phone."},
    {id:"confront",label:"Confront Meera with the recovered message",answer:"He found the contract alteration and said the board would see the audit trail in the morning. I knew my job was at risk. I panicked, but I did not kill him."}
  ],
  vikram: [
    {id:"where",label:"Where were you?",answer:"I left at 11:20 PM. The rain was getting worse and the meeting was over."},
    {id:"deal",label:"Ask about the business deal",answer:"The partnership was under strain, but business disputes are settled with lawyers, not murder."},
    {id:"security",label:"Confront the 11:31 PM vehicle record",answer:"My driver may have waited at the gate. I was not in the house. The vehicle record does not put me in the study."}
  ],
  kiran: [
    {id:"where",label:"What were you doing?",answer:"Watching the security feeds. The east camera faulted during the rain and I restarted its recorder."},
    {id:"footage",label:"Why is footage missing?",answer:"I deleted the corrupted four-minute segment while troubleshooting. The system log records the fault."},
    {id:"key",label:"Who used the spare study key?",answer:"It was signed out from 10:58 to 11:08 PM. I was on duty, and the log records the return."}
  ]
};

export function interview(id) {
  if (!state.interviewedSuspects.includes(id)) {
    state.interviewedSuspects.push(id);
    state.score += 200;
  }
}

export function answerQuestion(suspectId, questionId) {
  const q = questions[suspectId].find(x => x.id === questionId);
  if (!q) return null;
  state.suspectStates[suspectId].questions.push(questionId);
  if (suspectId === "meera" && questionId === "message") {
    collectEvidence("deleted-message");
  }
  if (suspectId === "meera" && questionId === "confront") {
    collectEvidence("computer");
    if (!state.contradictionsFound.includes("meera")) {
      state.contradictionsFound.push("meera");
      state.score += 500;
    }
  }
  if (suspectId === "vikram" && questionId === "security") {
    collectEvidence("security");
    if (!state.contradictionsFound.includes("vikram")) {
      state.contradictionsFound.push("vikram");
      state.score += 500;
    }
  }
  if (suspectId === "kiran" && questionId === "footage") {
    collectEvidence("camera-gap");
  }
  if (suspectId === "kiran" && questionId === "key") {
    collectEvidence("key");
  }
  return q.answer;
}
