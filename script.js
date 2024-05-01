"use strict";

// SELECTING VARIABLES
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
  ansCons.insertAdjacentHTML("afterbegin", html);
};
//

// RENDERING ERROR
const renderError = function (str, error) {
  errorContainer.classList.remove("hidden");
  errorBox.innerHTML = "";
  errorBox.insertAdjacentHTML(
    "afterbegin",
    `<span class="error"><ion-icon name="warning-outline"></ion-icon> <span> UPS... ${str} ${
      error?.message ? error?.message : ""
    }</span></span>

<button class="btn-try-again">Tentar novamente</button>`
  );
};
const timer = function () {
  let sec = 21;
  interval = setInterval(() => {
    sec--;
    load.style.width = `${(sec * 100) / 20}%`;
    if (sec < 1) {
      clearInterval(interval);
      renderError("O tempo expirou, tente novamente");
    }
  }, 1000);
  return interval;
};

const renderSpinner = function () {
  document.querySelector(".spinner").classList.add("hidden");
};

const vibrador = function () {
  if ("vibrate" in navigator) {
    // Faz o dispositivo vibrar por 1000 milissegundos (1 segundo)
    navigator.vibrate(1000);
  }
};
const loadingQuestion = async function () {
  try {
    document.querySelector(".spinner").classList.remove("hidden");
    clearInterval(interval);
    const openai = await fetch("https://opentdb.com/api.php?amount=100");
    const data = await openai.json();
    if (data) renderSpinner();
    document.querySelector(".lock").classList.add("hidden");

    if (!data) throw new Error("Erro de ligação, por pavor tente novamente");
    if (data.results.length === 0) {
      throw new Error("Sem nenhum resultado, tente novamente");
    }
    timer();
    return data.results[0];
  } catch (error) {
    renderError("algo correu mal", error);
    vibrador();
    return null;
  }
};

// helper function
const Obj = function (text, status) {
  this.text = text;
  this.status = status;
};
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

const randomArray = function (array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
};

const categoryRender = function (question) {
  questionHeader.innerHTML = "";
  let html = `<h2 class="heading-h2 category">${question.category}</h2>`;
  questionHeader.insertAdjacentHTML("afterbegin", html);
};
const quesRender = function (question) {
  questionsEls.innerHTML = "";
  questionsEls.insertAdjacentHTML(
    "afterbegin",
    `<p class="question">${question.question} </p>`
  );
};
const consumingResponse = function (question) {
  const helper = arrayHelper(question);
  const answers = randomArray(helper);
  categoryRender(question);
  quesRender(question);
  renderAnswer(answers);
};
const init = function () {
  loadingQuestion().then((question) => {
    if (question) {
      consumingResponse(question);
    }
  });
};
init();

const scores = function () {
  currentScore += 10;
  currentScore > highscore
    ? (highscore = currentScore)
    : (highscore = highscore);
  document.querySelector(".actual-score").textContent = currentScore;
};

const answerClick = function (e) {
  const target = e.target.closest(".answer");
  if (!target) return;
  document.querySelector(".lock").classList.remove("hidden");
  if (target.classList.contains("correct-answer")) {
    // window.location.reload();
    scores();
    target.classList.add("correct");
    document.querySelector(".correct-answer-box").classList.add("show");
    setTimeout(() => {
      document.querySelector(".correct-answer-box").classList.remove("show");
      init();
    }, 3000);
  } else {
    currentScore = 0;
    document.querySelector(".actual-score").textContent = currentScore;
    document.querySelector(".incorrect-answer-box").classList.add("show");
    document.querySelector(".high-score").textContent = highscore;
    setTimeout(() => {
      document.querySelector(".incorrect-answer-box").classList.remove("show");
      init();
    }, 3000);
  }
};
const btnClick = function (e) {
  const btn = e.target.closest(".btn-next");
  if (!btn) return;
  document.querySelector(".lock").classList.remove("hidden");
  setTimeout(() => {
    init();
  }, 3000);
};
answerContainer.addEventListener("click", answerClick.bind(this));
answerContainer.addEventListener("click", btnClick.bind(this));

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
errorBox.addEventListener("click", errorEvent.bind(this));
