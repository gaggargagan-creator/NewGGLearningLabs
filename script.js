const measures = [

  {
    id: "trainer",
    name: "Trainer Observation",
    weight: 35,
    hint:
      "Facilitation, communication, subject knowledge, engagement and delivery quality."
  },

  {
    id: "feedback",
    name: "Participant Feedback",
    weight: 20,
    hint:
      "L1 feedback, relevance, engagement, usefulness and overall learner experience."
  },

  {
    id: "knowledge",
    name: "Knowledge Assessment",
    weight: 15,
    hint:
      "Knowledge gained or retained through assessments, tests, quizzes or evaluations."
  },

  {
    id: "application",
    name: "Learning Application",
    weight: 20,
    hint:
      "Whether participants apply the learning on the job after the program."
  },

  {
    id: "attendance",
    name: "Attendance / Completion",
    weight: 10,
    hint:
      "Attendance, completion and participant participation across the program."
  }

];


let lastResult = null;

let currentScreen = "home";


const $ = selector =>
  document.querySelector(selector);


/* --------------------------------------------------
   STATUS
-------------------------------------------------- */

function status(score) {

  if (score >= 90) {

    return {
      name: "STRONG",
      color: "var(--strong)"
    };

  }

  if (score >= 85) {

    return {
      name: "GOOD",
      color: "var(--good)"
    };

  }

  if (score >= 75) {

    return {
      name: "NEEDS FOCUS",
      color: "var(--focus)"
    };

  }

  return {
    name: "CRITICAL",
    color: "var(--critical)"
  };

}


/* --------------------------------------------------
   NAVIGATION
-------------------------------------------------- */

function updateNavigation() {

  const headerBack = $("#headerBack");
  const howItWorks = $("#howItWorks");

  if (currentScreen === "home") {

    headerBack.classList.add("hidden");

    howItWorks.classList.remove("hidden");

  } else {

    headerBack.classList.remove("hidden");

    howItWorks.classList.add("hidden");

  }

}


function showHome() {

  currentScreen = "home";

  $("#home").classList.remove("hidden");

  $("#assessment").classList.add("hidden");

  $("#results").classList.add("hidden");

  updateNavigation();

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });

}


function showAssessment(step = 1) {

  currentScreen = "assessment";

  $("#home").classList.add("hidden");

  $("#results").classList.add("hidden");

  $("#assessment").classList.remove("hidden");

  showStep(step);

  updateNavigation();

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });

}


function showResults() {

  currentScreen = "results";

  $("#home").classList.add("hidden");

  $("#assessment").classList.add("hidden");

  $("#results").classList.remove("hidden");

  updateNavigation();

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });

}


function goBack() {

  if (currentScreen === "results") {

    showAssessment(2);

    return;

  }

  if (currentScreen === "assessment") {

    if ($("#step2").classList.contains("active")) {

      showStep(1);

      window.scrollTo({
        top: 0,
        behavior: "smooth"
      });

    } else {

      showHome();

    }

  }

}


/* --------------------------------------------------
   RENDER MEASURES
-------------------------------------------------- */

function renderMeasures() {

  $("#measureCards").innerHTML =
    measures.map(measure => `

      <article class="measure-card card">

        <div>

          <div class="measure-title">
            ${measure.name}
          </div>

          <div class="weight">
            ${measure.weight}% WEIGHTAGE
          </div>

          <div class="measure-sub">
            ${measure.hint}
          </div>

        </div>


        <div class="slider-wrap">

          <input
            class="slider"
            type="range"
            min="0"
            max="100"
            value="85"
            id="${measure.id}Range"
          >

        </div>


        <div>

          <input
            class="score-input"
            type="number"
            min="0"
            max="100"
            value="85"
            id="${measure.id}"
            aria-label="${measure.name} score"
          >

          <div
            class="score-status"
            id="${measure.id}Status"
          >
            GOOD
          </div>

        </div>

      </article>

    `).join("");


  measures.forEach(measure => {

    const range =
      $(`#${measure.id}Range`);

    const input =
      $(`#${measure.id}`);


    const sync = value => {

      value =
        Math.max(
          0,
          Math.min(
            100,
            Number(value) || 0
          )
        );


      range.value = value;

      input.value = value;


      range.style.setProperty(
        "--fill",
        `${value}%`
      );


      const currentStatus =
        status(value);


      $(`#${measure.id}Status`).textContent =
        currentStatus.name;


      $(`#${measure.id}Status`).style.color =
        currentStatus.color;

    };


    range.addEventListener(
      "input",
      event => {

        sync(event.target.value);

      }
    );


    input.addEventListener(
      "input",
      event => {

        sync(event.target.value);

      }
    );


    sync(85);

  });

}


/* --------------------------------------------------
   STEP NAVIGATION
-------------------------------------------------- */

function showStep(step) {

  $("#step1").classList.toggle(
    "active",
    step === 1
  );


  $("#step2").classList.toggle(
    "active",
    step === 2
  );


  $("#stepNumber").textContent =
    step === 1
      ? "01"
      : "02";


  $("#stepName").textContent =
    step === 1
      ? "PROGRAM CONTEXT"
      : "EFFECTIVENESS MEASURES";


  $("#progressBar").style.width =
    step === 1
      ? "50%"
      : "100%";

}


/* --------------------------------------------------
   GET SCORES
-------------------------------------------------- */

function getScores() {

  return Object.fromEntries(

    measures.map(measure => [

      measure.id,

      Math.max(
        0,

        Math.min(
          100,

          Number(
            $(`#${measure.id}`).value
          ) || 0

        )

      )

    ])

  );

}


/* --------------------------------------------------
   CALCULATE RESULT
-------------------------------------------------- */

function calculate() {

  const scores =
    getScores();


  const overall =
    measures.reduce(
      (sum, measure) => {

        return (
          sum +
          scores[measure.id] *
          (measure.weight / 100)
        );

      },
      0
    );


  const anyBelow75 =
    measures.some(
      measure =>
        scores[measure.id] < 75
    );


  let rating;


  if (
    overall < 85 ||
    scores.trainer < 80 ||
    scores.application < 70
  ) {

    rating = "NEEDS IMPROVEMENT";

  }

  else if (
    overall >= 90 &&
    !anyBelow75
  ) {

    rating = "EFFECTIVE";

  }

  else {

    rating = "SATISFACTORY";

  }


  const sorted =
    [...measures].sort(
      (a, b) =>
        scores[b.id] -
        scores[a.id]
    );


  const strongest =
    sorted[0];


  const weakest =
    sorted[
      sorted.length - 1
    ];


  const priorities =
    measures.filter(
      measure =>
        scores[measure.id] < 85
    );


  let recommendationTitle;

  let recommendationText;


  if (rating === "EFFECTIVE") {

    recommendationTitle =
      "Maintain and scale what is working";


    recommendationText =
      "The training is performing strongly across the key effectiveness measures. Maintain the current approach, continue monitoring performance and reinforce the practices contributing to these results.";

  }

  else if (scores.trainer < 80) {

    recommendationTitle =
      "Prioritise trainer development";


    recommendationText =
      "Focus on strengthening facilitation and delivery skills through structured trainer feedback, observation, coaching and targeted development support. Pay particular attention to engagement, communication, session structure and handling questions.";

  }

  else if (scores.application < 70) {

    recommendationTitle =
      "Strengthen learning transfer";


    recommendationText =
      "Increase post-training reinforcement by involving managers, assigning practical application activities and conducting structured follow-ups, coaching and application tracking to help participants transfer learning to the workplace.";

  }

  else {

    const recommendations = {

      feedback:
        "Improve learner engagement, content relevance and the overall training experience. Review participant expectations and increase opportunities for interaction.",

      knowledge:
        "Strengthen knowledge retention through clearer content, practical exercises, regular knowledge checks, effective assessments and reinforcement opportunities.",

      application:
        "Strengthen on-the-job application through manager support, practical assignments, follow-ups, coaching and application tracking.",

      attendance:
        "Review scheduling, manager communication, participant availability, reminders and completion tracking to improve participation."

    };


    recommendationTitle =
      `Focus on ${weakest.name}`;


    recommendationText =
      recommendations[weakest.id] ||
      "Review the identified area and introduce targeted improvement actions.";

  }


  return {

    scores,

    overall,

    rating,

    strongest,

    weakest,

    priorities,

    recommendationTitle,

    recommendationText

  };

}


/* --------------------------------------------------
   RATING COPY
-------------------------------------------------- */

function ratingCopy(rating) {

  if (rating === "EFFECTIVE") {

    return [

      "The training is demonstrating strong effectiveness.",

      "Performance is consistently strong across the assessment measures."

    ];

  }


  if (rating === "SATISFACTORY") {

    return [

      "A balanced result with room to improve.",

      "The training is performing adequately overall, but selected areas should be strengthened before scaling."

    ];

  }


  return [

    "Important improvement is required.",

    "One or more critical conditions are affecting the overall effectiveness of this training."

  ];

}


/* --------------------------------------------------
   RENDER RESULTS
-------------------------------------------------- */

function renderResults(result) {

  lastResult = result;


  const details = {

    program:
      $("#programName").value.trim() ||
      "Training Assessment",

    trainer:
      $("#trainerName").value.trim(),

    department:
      $("#department").value.trim(),

    date:
      $("#trainingDate").value,

    participants:
      $("#participants").value

  };


  lastResult.details =
    details;


  $("#resultProgram").textContent =
    details.program;


  $("#resultMeta").textContent =
    [

      details.trainer &&
        `Trainer: ${details.trainer}`,

      details.department,

      details.date &&
        formatDate(details.date),

      details.participants &&
        `${details.participants} participants`

    ]
      .filter(Boolean)
      .join(" · ");


  $("#overallScore").textContent =
    result.overall.toFixed(2);


  const degree =
    Math.max(
      0,
      Math.min(
        100,
        result.overall
      )
    ) * 3.6;


  requestAnimationFrame(() => {

    $("#gauge").style.background =
      `conic-gradient(
        var(--teal) ${degree}deg,
        rgba(255,255,255,.08) ${degree}deg
      )`;

  });


  const [
    headline,
    description
  ] =
    ratingCopy(result.rating);


  $("#ratingBadge").textContent =
    result.rating;


  $("#ratingHeadline").textContent =
    headline;


  $("#ratingDescription").textContent =
    description;


  const why = [];


  why.push(
    `Overall: ${result.overall.toFixed(2)}%`
  );


  why.push(
    `Trainer: ${result.scores.trainer}%`
  );


  why.push(
    `Application: ${result.scores.application}%`
  );


  if (result.rating === "EFFECTIVE") {

    why.push(
      "No score below 75%"
    );

  }


  $("#whyResult").innerHTML =
    why
      .map(
        item =>
          `<span>${item}</span>`
      )
      .join("");


  $("#metricsGrid").innerHTML =
    measures.map(measure => {

      const score =
        result.scores[measure.id];


      const currentStatus =
        status(score);


      return `

        <article class="metric card">

          <div class="metric-top">

            <span class="metric-name">
              ${measure.name}
            </span>

            <span class="metric-score">
              ${score}%
            </span>

          </div>


          <div class="bar">

            <i
              style="
                width:${score}%;
                background:${currentStatus.color}
              "
            ></i>

          </div>


          <small
            style="
              color:${currentStatus.color}
            "
          >
            ${currentStatus.name}
            ·
            ${measure.weight}% WT
          </small>

        </article>

      `;

    }).join("");


  $("#strongestArea").textContent =
    result.strongest.name;


  $("#strongestScore").textContent =
    `${result.scores[result.strongest.id]}%`;


  $("#strongestText").textContent =
    "This is the highest raw score across the five effectiveness measures.";


  $("#weakestArea").textContent =
    result.weakest.name;


  $("#weakestScore").textContent =
    `${result.scores[result.weakest.id]}%`;


  $("#weakestText").textContent =
    "This is the lowest raw score and the key area currently requiring attention.";


  $("#priorityAreas").innerHTML =
    result.priorities.length

      ? `

        <div class="priority-list">

          ${result.priorities.map(
            (measure, index) => `

              <div class="priority-item">

                <div class="priority-left">

                  <span class="priority-num">

                    ${String(index + 1).padStart(2, "0")}

                  </span>

                  <b>
                    ${measure.name}
                  </b>

                </div>


                <span class="metric-score">

                  ${result.scores[measure.id]}%

                </span>

              </div>

            `
          ).join("")}

        </div>

      `

      : `

        <div class="priority-empty">

          Excellent performance.
          No priority improvement areas have been identified.

        </div>

      `;


  $("#recommendationTitle").textContent =
    result.recommendationTitle;


  $("#recommendationText").textContent =
    result.recommendationText;


  showResults();

}


/* --------------------------------------------------
   DATE FORMAT
-------------------------------------------------- */

function formatDate(dateString) {

  if (!dateString) {
    return "";
  }


  const date =
    new Date(
      `${dateString}T00:00:00`
    );


  if (Number.isNaN(date.getTime())) {
    return dateString;
  }


  return date.toLocaleDateString(
    "en-GB",
    {

      day: "2-digit",

      month: "short",

      year: "numeric"

    }
  );

}


/* --------------------------------------------------
   PDF
-------------------------------------------------- */

function escapePdf(text) {

  return String(text || "")
    .replace(
      /[^\x20-\x7E]/g,
      ""
    );

}


function getPdfRatingColor(rating) {

  if (rating === "EFFECTIVE") {
    return [24, 145, 120];
  }

  if (rating === "SATISFACTORY") {
    return [53, 110, 185];
  }

  return [190, 86, 86];

}


function exportPDF() {

  if (!lastResult) {
    return;
  }


  const { jsPDF } =
    window.jspdf;


  const doc =
    new jsPDF({
      unit: "pt",
      format: "a4"
    });


  const r =
    lastResult;


  const d =
    r.details;


  const pageWidth =
    595.28;


  const pageHeight =
    841.89;


  const margin =
    45;


  const contentWidth =
    pageWidth -
    margin * 2;


  let y =
    0;


  const teal =
    [35, 142, 124];


  const dark =
    [27, 38, 43];


  const muted =
    [100, 115, 120];


  const lightLine =
    [220, 226, 228];


  const ratingColor =
    getPdfRatingColor(r.rating);


  /* PAGE BACKGROUND */

  doc.setFillColor(
    248,
    250,
    249
  );


  doc.rect(
    0,
    0,
    pageWidth,
    pageHeight,
    "F"
  );


  /* HEADER BAND */

  doc.setFillColor(
    17,
    42,
    40
  );


  doc.rect(
    0,
    0,
    pageWidth,
    120,
    "F"
  );


  doc.setTextColor(
    112,
    226,
    203
  );


  doc.setFont(
    "courier",
    "bold"
  );


  doc.setFontSize(9);


  doc.text(
    "GG LEARNLABS",
    margin,
    38
  );


  doc.setFont(
    "helvetica",
    "normal"
  );


  doc.setFontSize(8);


  doc.text(
    "TRAINING EFFECTIVENESS REPORT",
    margin,
    56
  );


  doc.setFont(
    "times",
    "bold"
  );


  doc.setFontSize(25);


  doc.setTextColor(
    255,
    255,
    255
  );


  const programLines =
    doc.splitTextToSize(
      escapePdf(d.program),
      contentWidth
    );


  doc.text(
    programLines,
    margin,
    93
  );


  y =
    155;


  /* META INFORMATION */

  const meta =
    [

      d.trainer &&
        `Trainer: ${d.trainer}`,

      d.department &&
        `Department: ${d.department}`,

      d.date &&
        `Date: ${formatDate(d.date)}`,

      d.participants &&
        `Participants: ${d.participants}`

    ]
      .filter(Boolean)
      .join("   |   ");


  if (meta) {

    doc.setFont(
      "helvetica",
      "normal"
    );


    doc.setFontSize(9);


    doc.setTextColor(
      ...muted
    );


    const metaLines =
      doc.splitTextToSize(
        escapePdf(meta),
        contentWidth
      );


    doc.text(
      metaLines,
      margin,
      y
    );


    y +=
      metaLines.length * 13 +
      20;

  }


  /* OVERALL SCORE CARD */

  doc.setFillColor(
    255,
    255,
    255
  );


  doc.roundedRect(
    margin,
    y,
    contentWidth,
    130,
    14,
    14,
    "F"
  );


  doc.setDrawColor(
    218,
    226,
    224
  );


  doc.roundedRect(
    margin,
    y,
    contentWidth,
    130,
    14,
    14,
    "S"
  );


  doc.setFont(
    "courier",
    "bold"
  );


  doc.setFontSize(9);


  doc.setTextColor(
    ...teal
  );


  doc.text(
    "OVERALL EFFECTIVENESS",
    margin + 22,
    y + 28
  );


  doc.setFont(
    "helvetica",
    "bold"
  );


  doc.setFontSize(34);


  doc.setTextColor(
    ...dark
  );


  doc.text(
    `${r.overall.toFixed(2)}%`,
    margin + 22,
    y + 78
  );


  doc.setFillColor(
    ...ratingColor
  );


  doc.roundedRect(
    pageWidth - margin - 175,
    y + 30,
    150,
    36,
    18,
    18,
    "F"
  );


  doc.setTextColor(
    255,
    255,
    255
  );


  doc.setFontSize(9);


  doc.text(
    r.rating,
    pageWidth - margin - 100,
    y + 53,
    {
      align: "center"
    }
  );


  doc.setFont(
    "helvetica",
    "normal"
  );


  doc.setFontSize(10);


  doc.setTextColor(
    ...muted
  );


  const ratingDescription =
    ratingCopy(r.rating)[1];


  const descriptionLines =
    doc.splitTextToSize(
      escapePdf(ratingDescription),
      contentWidth - 44
    );


  doc.text(
    descriptionLines,
    margin + 22,
    y + 105
  );


  y += 160;


  /* SCORE BREAKDOWN */

  doc.setFont(
    "helvetica",
    "bold"
  );


  doc.setFontSize(15);


  doc.setTextColor(
    ...dark
  );


  doc.text(
    "Score Breakdown",
    margin,
    y
  );


  y += 24;


  measures.forEach(measure => {

    const score =
      r.scores[measure.id];


    const scoreStatus =
      status(score);


    const barWidth =
      250;


    const fillWidth =
      Math.max(
        0,
        Math.min(
          100,
          score
        )
      ) / 100 *
      barWidth;


    doc.setFillColor(
      255,
      255,
      255
    );


    doc.roundedRect(
      margin,
      y,
      contentWidth,
      42,
      8,
      8,
      "F"
    );


    doc.setDrawColor(
      ...lightLine
    );


    doc.roundedRect(
      margin,
      y,
      contentWidth,
      42,
      8,
      8,
      "S"
    );


    doc.setFont(
      "helvetica",
      "bold"
    );


    doc.setFontSize(10);


    doc.setTextColor(
      ...dark
    );


    doc.text(
      escapePdf(measure.name),
      margin + 14,
      y + 17
    );


    doc.setFont(
      "helvetica",
      "normal"
    );


    doc.setFontSize(8);


    doc.setTextColor(
      ...muted
    );


    doc.text(
      `${measure.weight}% weight`,
      margin + 14,
      y + 31
    );


    doc.setFillColor(
      225,
      231,
      230
    );


    doc.roundedRect(
      margin + 200,
      y + 17,
      barWidth,
      7,
      4,
      4,
      "F"
    );


    if (scoreStatus.name === "STRONG") {

      doc.setFillColor(
        53,
        190,
        164
      );

    }

    else if (scoreStatus.name === "GOOD") {

      doc.setFillColor(
        92,
        144,
        225
      );

    }

    else if (scoreStatus.name === "NEEDS FOCUS") {

      doc.setFillColor(
        230,
        170,
        78
      );

    }

    else {

      doc.setFillColor(
        214,
        100,
        100
      );

    }


    doc.roundedRect(
      margin + 200,
      y + 17,
      fillWidth,
      7,
      4,
      4,
      "F"
    );


    doc.setFont(
      "helvetica",
      "bold"
    );


    doc.setFontSize(12);


    doc.setTextColor(
      ...dark
    );


    doc.text(
      `${score}%`,
      pageWidth - margin - 15,
      y + 25,
      {
        align: "right"
      }
    );


    y += 52;

  });


  y += 12;


  /* STRONGEST AND WEAKEST */

  doc.setFillColor(
    239,
    250,
    247
  );


  doc.roundedRect(
    margin,
    y,
    contentWidth,
    76,
    10,
    10,
    "F"
  );


  doc.setFont(
    "courier",
    "bold"
  );


  doc.setFontSize(8);


  doc.setTextColor(
    ...teal
  );


  doc.text(
    "STRONGEST AREA",
    margin + 16,
    y + 22
  );


  doc.setFont(
    "helvetica",
    "bold"
  );


  doc.setFontSize(14);


  doc.setTextColor(
    ...dark
  );


  doc.text(
    escapePdf(r.strongest.name),
    margin + 16,
    y + 48
  );


  doc.text(
    `${r.scores[r.strongest.id]}%`,
    pageWidth - margin - 16,
    y + 48,
    {
      align: "right"
    }
  );


  y += 90;


  doc.setFillColor(
    255,
    248,
    240
  );


  doc.roundedRect(
    margin,
    y,
    contentWidth,
    76,
    10,
    10,
    "F"
  );


  doc.setFont(
    "courier",
    "bold"
  );


  doc.setFontSize(8);


  doc.setTextColor(
    195,
    126,
    42
  );


  doc.text(
    "AREA REQUIRING MOST ATTENTION",
    margin + 16,
    y + 22
  );


  doc.setFont(
    "helvetica",
    "bold"
  );


  doc.setFontSize(14);


  doc.setTextColor(
    ...dark
  );


  doc.text(
    escapePdf(r.weakest.name),
    margin + 16,
    y + 48
  );


  doc.text(
    `${r.scores[r.weakest.id]}%`,
    pageWidth - margin - 16,
    y + 48,
    {
      align: "right"
    }
  );


  y += 100;


  /* RECOMMENDATION */

  doc.setFont(
    "courier",
    "bold"
  );


  doc.setFontSize(9);


  doc.setTextColor(
    ...teal
  );


  doc.text(
    "SMART RECOMMENDATION",
    margin,
    y
  );


  y += 24;


  doc.setFont(
    "helvetica",
    "bold"
  );


  doc.setFontSize(14);


  doc.setTextColor(
    ...dark
  );


  const recommendationTitleLines =
    doc.splitTextToSize(
      escapePdf(r.recommendationTitle),
      contentWidth
    );


  doc.text(
    recommendationTitleLines,
    margin,
    y
  );


  y +=
    recommendationTitleLines.length * 18 +
    10;


  doc.setFont(
    "helvetica",
    "normal"
  );


  doc.setFontSize(10);


  doc.setTextColor(
    ...muted
  );


  const recommendationLines =
    doc.splitTextToSize(
      escapePdf(r.recommendationText),
      contentWidth
    );


  doc.text(
    recommendationLines,
    margin,
    y
  );


  /* FOOTER */

  doc.setDrawColor(
    ...lightLine
  );


  doc.line(
    margin,
    pageHeight - 42,
    pageWidth - margin,
    pageHeight - 42
  );


  doc.setFontSize(7.5);


  doc.setTextColor(
    130,
    142,
    145
  );


  doc.text(
    "GG LearnLabs · Training Effectiveness Assessment",
    margin,
    pageHeight - 25
  );


  doc.text(
    "Trainer 35% + Feedback 20% + Knowledge 15% + Application 20% + Attendance 10%",
    pageWidth - margin,
    pageHeight - 25,
    {
      align: "right"
    }
  );


  const fileName =
    (d.program || "GG-LearnLabs-Report")
      .replace(
        /[^a-z0-9]+/gi,
        "-"
      )
      .replace(
        /^-+|-+$/g,
        ""
      );


  doc.save(
    `${fileName}.pdf`
  );

}


/* --------------------------------------------------
   TOAST
-------------------------------------------------- */

function toast(text) {

  const notification =
    $("#toast");


  notification.textContent =
    text;


  notification.classList.add(
    "show"
  );


  setTimeout(() => {

    notification.classList.remove(
      "show"
    );

  }, 2600);

}


/* --------------------------------------------------
   INITIALISE
-------------------------------------------------- */

renderMeasures();

updateNavigation();


/* HOME */

$("#startAssessment").addEventListener(
  "click",
  () => {

    showAssessment(1);

  }
);


$("#howItWorks").addEventListener(
  "click",
  () => {

    showAssessment(1);

  }
);


/* BRAND ALWAYS GOES HOME */

$("#brandHome").addEventListener(
  "click",
  event => {

    event.preventDefault();

    showHome();

  }
);


/* HEADER BACK BUTTON */

$("#headerBack").addEventListener(
  "click",
  () => {

    goBack();

  }
);


/* STEP 1 → STEP 2 */

$("#toStep2").addEventListener(
  "click",
  () => {

    if (
      !$("#programName").reportValidity()
    ) {
      return;
    }


    showStep(2);


    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });

  }
);


/* STEP 2 → STEP 1 */

$("#backToStep1").addEventListener(
  "click",
  () => {

    showStep(1);


    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });

  }
);


/* GENERATE RESULTS */

$("#assessmentForm").addEventListener(
  "submit",
  event => {

    event.preventDefault();

    renderResults(
      calculate()
    );

  }
);


/* NEW ASSESSMENT */

$("#newAssessment").addEventListener(
  "click",
  () => {

    showHome();

  }
);


/* EDIT ASSESSMENT */

$("#editAssessment").addEventListener(
  "click",
  () => {

    showAssessment(2);

  }
);


/* METHOD TOGGLE */

$("#methodToggle").addEventListener(
  "click",
  () => {

    const content =
      $("#methodContent");


    const icon =
      $("#methodIcon");


    content.classList.toggle(
      "open"
    );


    icon.textContent =
      content.classList.contains("open")
        ? "−"
        : "+";

  }
);


/* EXPORT PDF */

$("#exportPDF").addEventListener(
  "click",
  () => {

    try {

      exportPDF();

      toast(
        "Your report has been generated."
      );

    }

    catch (error) {

      toast(
        "PDF export could not be completed."
      );

      console.error(error);

    }

  }
);
