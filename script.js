const measures = [
  {id:"trainer", name:"Trainer Observation", weight:35, hint:"Facilitation, communication, subject knowledge, engagement and delivery quality."},
  {id:"feedback", name:"Participant Feedback", weight:20, hint:"L1 feedback, relevance, engagement, usefulness and overall learner experience."},
  {id:"knowledge", name:"Knowledge Assessment", weight:15, hint:"Knowledge gained or retained through assessments, tests, quizzes or evaluations."},
  {id:"application", name:"Learning Application", weight:20, hint:"Whether participants apply the learning on the job after the program."},
  {id:"attendance", name:"Attendance / Completion", weight:10, hint:"Attendance, completion and participant participation across the program."}
];

let lastResult = null;

const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);

function status(score){
  if(score >= 90) return {name:"STRONG", color:"var(--strong)"};
  if(score >= 85) return {name:"GOOD", color:"var(--good)"};
  if(score >= 75) return {name:"NEEDS FOCUS", color:"var(--focus)"};
  return {name:"CRITICAL", color:"var(--critical)"};
}

function renderMeasures(){
  $("#measureCards").innerHTML = measures.map(m => `
    <article class="measure-card card">
      <div>
        <div class="measure-title">${m.name}</div>
        <div class="weight">${m.weight}% WEIGHTAGE</div>
        <div class="measure-sub">${m.hint}</div>
      </div>
      <div class="slider-wrap">
        <input class="slider" type="range" min="0" max="100" value="85" id="${m.id}Range">
      </div>
      <div>
        <input class="score-input" type="number" min="0" max="100" value="85" id="${m.id}" aria-label="${m.name} score">
        <div class="score-status" id="${m.id}Status">GOOD</div>
      </div>
    </article>`).join("");

  measures.forEach(m => {
    const range = $(`#${m.id}Range`);
    const input = $(`#${m.id}`);
    const sync = val => {
      val = Math.max(0, Math.min(100, Number(val) || 0));
      range.value = val; input.value = val;
      range.style.setProperty("--fill", `${val}%`);
      const s = status(val);
      $(`#${m.id}Status`).textContent = s.name;
      $(`#${m.id}Status`).style.color = s.color;
    };
    range.addEventListener("input", e => sync(e.target.value));
    input.addEventListener("input", e => sync(e.target.value));
    sync(85);
  });
}

function showStep(n){
  $("#step1").classList.toggle("active", n===1);
  $("#step2").classList.toggle("active", n===2);
  $("#stepNumber").textContent = n===1 ? "01" : "02";
  $("#stepName").textContent = n===1 ? "PROGRAM CONTEXT" : "EFFECTIVENESS MEASURES";
  $("#progressBar").style.width = n===1 ? "50%" : "100%";
}

function getScores(){
  return Object.fromEntries(measures.map(m => [m.id, Math.max(0, Math.min(100, Number($(`#${m.id}`).value) || 0))]));
}

function calculate(){
  const scores = getScores();
  const overall = measures.reduce((sum,m)=>sum + scores[m.id]*(m.weight/100),0);
  const anyBelow75 = measures.some(m => scores[m.id] < 75);

  let rating;
  if(overall < 85 || scores.trainer < 80 || scores.application < 70) rating = "NEEDS IMPROVEMENT";
  else if(overall >= 90 && !anyBelow75) rating = "EFFECTIVE";
  else rating = "SATISFACTORY";

  const sorted = [...measures].sort((a,b)=>scores[b.id]-scores[a.id]);
  const strongest = sorted[0];
  const weakest = sorted[sorted.length-1];
  const priorities = measures.filter(m => scores[m.id] < 85);

  let recommendationTitle, recommendationText;
  if(rating === "EFFECTIVE"){
    recommendationTitle = "Maintain and scale what is working";
    recommendationText = "The training is performing strongly across the key effectiveness measures. Maintain the current approach, continue monitoring performance and reinforce the practices contributing to these results.";
  } else if(scores.trainer < 80){
    recommendationTitle = "Prioritise trainer development";
    recommendationText = "Focus on strengthening facilitation and delivery skills through structured trainer feedback, observation, coaching and targeted development support. Pay particular attention to engagement, communication, session structure and handling questions.";
  } else if(scores.application < 70){
    recommendationTitle = "Strengthen learning transfer";
    recommendationText = "Increase post-training reinforcement by involving managers, assigning practical application activities and conducting structured follow-ups, coaching and application tracking to help participants transfer learning to the workplace.";
  } else {
    const recs = {
      feedback:"Improve learner engagement, content relevance and the overall training experience. Review participant expectations and increase opportunities for interaction.",
      knowledge:"Strengthen knowledge retention through clearer content, practical exercises, regular knowledge checks, effective assessments and reinforcement opportunities.",
      application:"Strengthen on-the-job application through manager support, practical assignments, follow-ups, coaching and application tracking.",
      attendance:"Review scheduling, manager communication, participant availability, reminders and completion tracking to improve participation."
    };
    recommendationTitle = `Focus on ${weakest.name}`;
    recommendationText = recs[weakest.id];
  }

  return {scores,overall,rating,strongest,weakest,priorities,recommendationTitle,recommendationText};
}

function ratingCopy(rating){
  if(rating==="EFFECTIVE") return ["The training is demonstrating strong effectiveness.","Performance is consistently strong across the assessment measures."];
  if(rating==="SATISFACTORY") return ["A balanced result with room to improve.","The training is performing adequately overall, but selected areas should be strengthened before scaling."];
  return ["Important improvement is required.","One or more critical conditions are affecting the overall effectiveness of this training."];
}

function renderResults(result){
  lastResult = result;
  const details = {
    program: $("#programName").value.trim() || "Training Assessment",
    trainer: $("#trainerName").value.trim(),
    department: $("#department").value.trim(),
    date: $("#trainingDate").value,
    participants: $("#participants").value
  };
  lastResult.details = details;

  $("#resultProgram").textContent = details.program;
  $("#resultMeta").textContent = [details.trainer && `Trainer: ${details.trainer}`, details.department, details.participants && `${details.participants} participants`].filter(Boolean).join(" · ");

  $("#overallScore").textContent = result.overall.toFixed(2);
  const degree = Math.max(0,Math.min(100,result.overall))*3.6;
  requestAnimationFrame(()=>$("#gauge").style.background=`conic-gradient(var(--teal) ${degree}deg, rgba(255,255,255,.08) ${degree}deg)`);

  const [headline,description] = ratingCopy(result.rating);
  $("#ratingBadge").textContent=result.rating;
  $("#ratingHeadline").textContent=headline;
  $("#ratingDescription").textContent=description;

  const why = [];
  why.push(`Overall: ${result.overall.toFixed(2)}%`);
  why.push(`Trainer: ${result.scores.trainer}%`);
  why.push(`Application: ${result.scores.application}%`);
  if(result.rating==="EFFECTIVE") why.push("No score below 75%");
  $("#whyResult").innerHTML=why.map(x=>`<span>${x}</span>`).join("");

  $("#metricsGrid").innerHTML = measures.map(m=>{
    const score=result.scores[m.id], s=status(score);
    return `<article class="metric card">
      <div class="metric-top"><span class="metric-name">${m.name}</span><span class="metric-score">${score}%</span></div>
      <div class="bar"><i style="width:${score}%;background:${s.color}"></i></div>
      <small style="color:${s.color}">${s.name} · ${m.weight}% WT</small>
    </article>`;
  }).join("");

  $("#strongestArea").textContent=result.strongest.name;
  $("#strongestScore").textContent=`${result.scores[result.strongest.id]}%`;
  $("#strongestText").textContent="This is the highest raw score across the five effectiveness measures.";
  $("#weakestArea").textContent=result.weakest.name;
  $("#weakestScore").textContent=`${result.scores[result.weakest.id]}%`;
  $("#weakestText").textContent="This is the lowest raw score and the key area currently requiring attention.";

  $("#priorityAreas").innerHTML = result.priorities.length
    ? `<div class="priority-list">${result.priorities.map((m,i)=>`<div class="priority-item"><div class="priority-left"><span class="priority-num">0${i+1}</span><b>${m.name}</b></div><span class="metric-score">${result.scores[m.id]}%</span></div>`).join("")}</div>`
    : `<div class="priority-empty">Excellent performance. No priority improvement areas have been identified.</div>`;

  $("#recommendationTitle").textContent=result.recommendationTitle;
  $("#recommendationText").textContent=result.recommendationText;

  $("#assessment").classList.add("hidden");
  $("#home").classList.add("hidden");
  $("#results").classList.remove("hidden");
  window.scrollTo({top:0,behavior:"smooth"});
}

function escapePdf(text){ return String(text || "").replace(/[^\x20-\x7E]/g,""); }

function exportPDF(){
  if(!lastResult) return;
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({unit:"pt",format:"a4"});
  const r = lastResult, d=r.details;
  const margin=48; let y=55;

  doc.setFillColor(9,17,17); doc.rect(0,0,595,842,"F");
  doc.setTextColor(85,223,199); doc.setFont("courier","normal"); doc.setFontSize(9);
  doc.text("GG LEARNLABS / TRAINING EFFECTIVENESS REPORT",margin,y);
  y+=42; doc.setTextColor(237,244,242); doc.setFont("times","bold"); doc.setFontSize(26);
  doc.text(escapePdf(d.program),margin,y); y+=28;
  doc.setFont("helvetica","normal"); doc.setFontSize(10); doc.setTextColor(145,163,160);
  doc.text(escapePdf([d.trainer && `Trainer: ${d.trainer}`,d.department,d.participants && `${d.participants} participants`].filter(Boolean).join(" | ")),margin,y);

  y+=65; doc.setTextColor(85,223,199); doc.setFontSize(9); doc.text("OVERALL EFFECTIVENESS",margin,y);
  y+=52; doc.setTextColor(237,244,242); doc.setFont("courier","bold"); doc.setFontSize(42); doc.text(`${r.overall.toFixed(2)}%`,margin,y);
  doc.setFontSize(16); doc.setTextColor(85,223,199); doc.text(r.rating,250,y);

  y+=50; doc.setDrawColor(55,70,68); doc.line(margin,y,547,y); y+=25;
  doc.setTextColor(237,244,242); doc.setFont("helvetica","bold"); doc.setFontSize(13); doc.text("Score Breakdown",margin,y); y+=22;
  measures.forEach(m=>{
    doc.setFont("helvetica","normal");doc.setFontSize(10);doc.setTextColor(145,163,160);doc.text(escapePdf(m.name),margin,y);
    doc.setTextColor(237,244,242);doc.text(`${r.scores[m.id]}%`,480,y);doc.text(`${m.weight}% weight`,530,y);y+=21;
  });

  y+=12; doc.setTextColor(85,223,199);doc.setFont("helvetica","bold");doc.setFontSize(12);doc.text("Strongest Area",margin,y);y+=18;
  doc.setTextColor(237,244,242);doc.setFont("helvetica","normal");doc.text(`${escapePdf(r.strongest.name)} — ${r.scores[r.strongest.id]}%`,margin,y);
  y+=30;doc.setTextColor(242,183,94);doc.setFont("helvetica","bold");doc.text("Area Requiring Most Attention",margin,y);y+=18;
  doc.setTextColor(237,244,242);doc.setFont("helvetica","normal");doc.text(`${escapePdf(r.weakest.name)} — ${r.scores[r.weakest.id]}%`,margin,y);

  y+=35;doc.setTextColor(85,223,199);doc.setFont("helvetica","bold");doc.text("Recommendation",margin,y);y+=20;
  doc.setTextColor(237,244,242);doc.text(escapePdf(r.recommendationTitle),margin,y);y+=17;
  doc.setFont("helvetica","normal");doc.setTextColor(145,163,160);
  const lines=doc.splitTextToSize(escapePdf(r.recommendationText),495);doc.text(lines,margin,y);

  doc.setFontSize(8);doc.setTextColor(100,120,116);doc.text("Weighted calculation: Trainer 35% + Feedback 20% + Knowledge 15% + Application 20% + Attendance 10%",margin,805);
  doc.save(`${(d.program || "GG-LearnLabs-Report").replace(/[^a-z0-9]+/gi,"-")}.pdf`);
}

function toast(text){
  const t=$("#toast");t.textContent=text;t.classList.add("show");setTimeout(()=>t.classList.remove("show"),2600);
}

renderMeasures();

$("#startAssessment").addEventListener("click",()=>{ $("#home").classList.add("hidden"); $("#assessment").classList.remove("hidden"); showStep(1); window.scrollTo({top:0,behavior:"smooth"}); });
$("#howItWorks").addEventListener("click",()=>{ $("#home").classList.add("hidden"); $("#assessment").classList.remove("hidden"); showStep(1); });
$("#toStep2").addEventListener("click",()=>{
  if(!$("#programName").reportValidity()) return;
  showStep(2); window.scrollTo({top:0,behavior:"smooth"});
});
$("#backToStep1").addEventListener("click",()=>showStep(1));
$("#assessmentForm").addEventListener("submit",e=>{e.preventDefault();renderResults(calculate())});
$("#newAssessment").addEventListener("click",()=>{ $("#results").classList.add("hidden");$("#home").classList.remove("hidden");window.scrollTo({top:0,behavior:"smooth"}); });
$("#editAssessment").addEventListener("click",()=>{ $("#results").classList.add("hidden");$("#assessment").classList.remove("hidden");showStep(2);window.scrollTo({top:0,behavior:"smooth"}); });
$("#methodToggle").addEventListener("click",()=>{ $("#methodContent").classList.toggle("open"); });
$("#exportPDF").addEventListener("click",()=>{try{exportPDF();toast("Your report has been generated.");}catch(e){toast("PDF export could not be completed.");console.error(e)}});