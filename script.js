"use strict";

// SELECTING VARIABLES
///////////////////////////////////////////////////////////////////////////
const currentQuestionNumber = document.querySelector(".current-question");
const questionEl = document.querySelector(".question");
const questionsEls = document.querySelector(".questions");
const actualScore = document.querySelector(".actual-score");
const lastScore = document.querySelector(".last-score");
const category = document.querySelector(".category");
const span = document.querySelector(".answer-header");
const load = document.querySelector(".load");
const ansCons = document.querySelector(".container-ans");
const questionHeader = document.querySelector(".questions-header");
const answerContainer = document.querySelector(".answer-box");
const errorContainer = document.querySelector(".wrong-answer");
const errorBox = document.querySelector(".incorrect-box");
let currentScore = 0;
let highscore = 0;
let interval;

// RENDERING THE ANSWERS
const renderAnswer = function (answers) {
  const ans = answers;
  let html;
  ansCons.innerHTML = "";

  // GENERATIGN THE HTML CONTENT
  ans.forEach((_, i) => {
    html = `
    <div class="answers">
      <div class="answer ${
        ans[0].status === "correct" ? ans[0].status : ""
      }-answer"><span class="letter">A</span> <span class="ans answer-01">${
      ans[0].text ? ans[0].text : ""
    } </span>
      </div>
      <div class="answer ${
        ans[1].status === "correct" ? ans[1].status : ""
      }-answer"><span class="letter">B</span> <span class="ans answer-02">${
      ans[1].text ? ans[1].text : ""
    } </span>
      </div>
      <div class="answer ${
        ans[2]?.status === "correct" ? ans[2]?.status : ""
      }-answer"><span class="letter">C</span> <span
       class="ans answer-03">${ans[2]?.text ? ans[2]?.text : ""} </span>
       </div>
       <div class="answer ${
         ans[3]?.status === "correct" ? ans[3]?.status : ""
       }-answer"><span class="letter">D</span> <span class="ans answer-03">${
      ans[3]?.text ? ans[3]?.text : ""
    }</span>
       </div>
      <button class="btn-next">Next</button>
    </div>
      `;
  });
  // INSERTING THE HTML ON THE DOM
  ansCons.insertAdjacentHTML("afterbegin", html);
};
//

// RENDERING ERROR
const renderError = function (str, error) {
  // DISPLAYING THE ERROR ELEMENT ON THE DOM
  errorContainer.classList.remove("hidden");

  // RENDERING THE ERROR CONTENT ON THE DOM
  errorBox.innerHTML = "";
  errorBox.insertAdjacentHTML(
    "afterbegin",
    `<span class="error"><ion-icon name="warning-outline"></ion-icon> <span> UPS... ${str} ${
      error?.message ? error?.message : ""
    }</span></span>
    <button class="btn-try-again">Tentar novamente</button>`
  );
};

// TIMER FUNCTIONS WITH 20 SECS
const timer = function () {
  let sec = 21;

  // INTERVARL TO DECRESE THE TIMER
  interval = setInterval(() => {
    sec--;

    // STYLING THE TIMER DIV
    load.style.width = `${(sec * 100) / 20}%`;
    if (sec < 1) {
      clearInterval(interval);
      renderError("O tempo expirou, tente novamente");
    }
  }, 1000);
  return interval;
};

// FUNCTION TO RENDER THE SPINER AND ADDING THE HIDDEN CLASS
// hidespinner
const hideSpinner = function () {
  document.querySelector(".spinner").classList.add("hidden");
};
//showspinner
const showSpinner = function () {
  document.querySelector(".spinner").classList.remove("hidden");
};
// FUNCTION TO VIBRATE DE DEVICE, MAINLY ON THE MOBILES
const vibrador = function () {
  if ("vibrate" in navigator) {
    // Faz o dispositivo vibrar por 100 milissegundos (0.1 segundo)
    navigator.vibrate(1000);
  } else {
    return;
  }
};

// FECTHING AND LOADING THE QUESTION FROM A THIRD PART API ('https://opentdb.com/api.php?amount=100')
const loadingQuestion = async function () {
  try {
    clearInterval(interval);
    showSpinner();
    const openai = await fetch("https://opentdb.com/api.php?amount=100");
    const data = await openai.json();
    if (data) hideSpinner();
    document.querySelector(".lock").classList.add("hidden");
    if (!data) throw new Error("Erro de ligação, por pavor tente novamente");
    if (data.results.length === 0) {
      throw new Error("Sem nenhum resultado, tente novamente");
    }
    timer();
    return data.results[0];
  } catch (error) {
    renderError("algo correu mal", error);
    // vibrador();
    return null;
  }
};

// CONSTRUCTOR FUNCTIONS FOR CREATING THE ANSWER OBJECT
const Obj = function (text, status) {
  this.text = text;
  this.status = status;
};
// FUNCTION FOR CREATING THE ANSWER OBJECT LOOPING ON THE ERRAY
const arrayHelper = function (question) {
  const x = [question.correct_answer, ...question.incorrect_answers];
  const answers = [];
  x.forEach((el, i) => {
    let obj;
    if (i === 0) obj = new Obj(el, "correct");
    if (i > 0) obj = new Obj(el, "incorrect");
    answers.push(obj);
  });
  return answers;
};

// FUNCTION FORM RANDOMRING THE ARRAY TO DISPLAY THE CORRECT ANSWER ON THE DIFERENT PLACE ON THE DOM
const randomArray = function (array) {
  // RANDOM ARRAY
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

// DISPLAYINH THE QUESTION CATEGORY ON THE DOM
const categoryRender = function (question) {
  questionHeader.innerHTML = "";
  let html = `<h2 class="heading-h2 category">${question.category}</h2>`;
  questionHeader.insertAdjacentHTML("afterbegin", html);
};

// DISPLAYING THE QUESTION ON THE DOM
const quesRender = function (question) {
  questionsEls.innerHTML = "";
  questionsEls.insertAdjacentHTML(
    "afterbegin",
    `<p class="question">${question.question} </p>`
  );
};

// FUNCTION TO CONSUME THE PROMISE COMING FROM THE FECTHING FUNCTION
const consumingResponse = function (question) {
  const helper = arrayHelper(question);
  const answers = randomArray(helper);
  categoryRender(question);
  quesRender(question);
  renderAnswer(answers);
};
// INITIALAZING THE FECTH FUNCTION WITH THEN METHOD
const init = function () {
  loadingQuestion().then((question) => {
    if (question) {
      consumingResponse(question);
    }
  });
};
init();

// HANDLING WITH THE SCORES
const scores = function () {
  currentScore += 10;
  currentScore > highscore
    ? (highscore = currentScore)
    : (highscore = highscore);
  document.querySelector(".actual-score").textContent = currentScore;
};

const handleCorrectAnswer = function (target) {
  scores();
  target.classList.add("correct");
  document.querySelector(".correct-answer-box").classList.add("show");
  setTimeout(() => {
    document.querySelector(".correct-answer-box").classList.remove("show");
    init();
  }, 3000);
};

// HANDLING THE INCORRECT
const handleIncorrectAnswer = function () {
  currentScore = 0;
  document.querySelector(".actual-score").textContent = currentScore;
  document.querySelector(".incorrect-answer-box").classList.add("show");
  document.querySelector(".high-score").textContent = highscore;
  setTimeout(() => {
    document.querySelector(".incorrect-answer-box").classList.remove("show");
    init();
  }, 3000);
};

// CLICK EVENT FUNCTION FOR ANSWER
const answerClick = function (e) {
  const target = e.target.closest(".answer");
  if (!target) return;

  // LOCKING THE APP WHILE LOADING
  document.querySelector(".lock").classList.remove("hidden");
  if (target.classList.contains("correct-answer")) {
    // CALLING THE HANDLE CORRECT FUNCTION
    handleCorrectAnswer(target);
  } else {
    // CALLING THE HANDLE INCORRECT FUNCTION
    handleIncorrectAnswer(target);
  }
};

// BTN NEXT EVENT FUNCTION
const btnClick = function (e) {
  const btn = e.target.closest(".btn-next");
  if (!btn) return;
  document.querySelector(".lock").classList.remove("hidden");
  setTimeout(() => {
    init();
  }, 3000);
};

// TRY AGAIN BTN EVENT FUNCTION
const errorEvent = function (e) {
  const target = e.target.closest(".btn-try-again");
  console.log(target);
  if (!target) return;
  init();
  document.querySelector(".high-score").textContent = highscore;
  errorContainer.classList.add("hidden");
  currentScore = 0;
  document.querySelector(".actual-score").textContent = currentScore;
};

// ALL EVENT LISTENERS FUNCTIONS
const allEventListeners = function () {
  answerContainer.addEventListener("click", answerClick.bind(this));
  answerContainer.addEventListener("click", btnClick.bind(this));
  errorBox.addEventListener("click", errorEvent.bind(this));
};
allEventListeners();
