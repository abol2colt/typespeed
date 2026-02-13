const theTimer = document.querySelector(".timer");
const testArea = document.querySelector("#test-area");
const originText = document.querySelector("#origin-text p").innerHTML;
const resetButton = document.querySelector("#reset");
const testWrapper = document.querySelector(".test-wrapper");
const resultTable = document.querySelector("#result-table");

const CS_PER_MINUTE = 6000;
const TIMER_INTERVAL = 10;
var timer = [0, 0, 0, 0];
var timerRunning = false;
var interval;
var errorsCount = 0;
let lastTextLength = 0;
var gameRound = 0;

function start() {
  let textEnteredLength = testArea.value.length;
  if (textEnteredLength == 0 && !timerRunning) {
    timerRunning = true;
    interval = setInterval(runTimer, TIMER_INTERVAL);
  }
}

function finish() {
  gameRound++;
  clearInterval(interval);
  testWrapper.style.borderColor = "green";
  updateResultTable();
}

function calcResults() {
  let textEntered = testArea.value;
  const secPerWord = (timer[3] / 100 / (textEntered.length / 5)).toFixed(2);
  const WPS = (textEntered.length / 5 / (timer[3] / TIMER_INTERVAL)).toFixed(2);
  const correctChars = textEntered.length - errorsCount;
  const accuracy = ((correctChars / textEntered.length) * 100).toFixed(2);
  const wpm = (CS_PER_MINUTE * correctChars) / timer[3] / 5;
  if (timer[3] === 0 || textEntered.length === 0)
    return {
      wpm: 0,
      secPerWord: 0,
      WPS: 0,
      accuracy: 0,
      errors: errorsCount,
      gameRound,
    };
  else
    return {
      wpm,
      secPerWord,
      WPS,
      accuracy,
      errors: errorsCount,
      gameRound,
    };
}

function updateResultTable() {
  const result = calcResults();
  var row = `<tr>
                <td>${result.gameRound}</td>
                <td>${result.errors}</td>
                <td>${result.wpm}</td>
                <td>${result.accuracy}%</td>
                <td>${result.WPS}</td>
              </tr>`;
  resultTable.innerHTML += row;
}

function reset() {
  clearInterval(interval);
  interval = null;
  timer = [0, 0, 0, 0];
  timerRunning = false;
  testArea.value = "";
  lastTextLength = 0;
  theTimer.innerHTML = "00:00:00";
  testWrapper.style.borderColor = "grey";
  errorsCount = 0;
}

function spellCheck() {
  let textEntered = testArea.value;
  const isFinished = textEntered === originText;

  if (isFinished) {
    finish();
    return;
  }

  const isCorrectSoFar =
    textEntered === originText.substring(0, textEntered.length);
  if (isCorrectSoFar) testWrapper.style.borderColor = "yellow";
  else {
    testWrapper.style.borderColor = "red";

    const isError =
      textEntered.length > lastTextLength &&
      textEntered[textEntered.length - 1] != " ";
    if (isError) errorsCount++;
  }

  lastTextLength = textEntered.length;
}

function runTimer() {
  const leadingZero = (t) => (t <= 9 ? "0" + t : t);

  let currentTime =
    leadingZero(timer[0]) +
    ":" +
    leadingZero(timer[1]) +
    ":" +
    leadingZero(timer[2]);

  theTimer.innerHTML = currentTime;

  timer[3]++;

  timer[0] = Math.floor(timer[3] / 100 / 60);
  timer[1] = Math.floor(timer[3] / 100) - timer[0] * 60;
  timer[2] = Math.floor(timer[3] - timer[1] * 100 - timer[0] * 6000);
}

testArea.addEventListener("keypress", start);
testArea.addEventListener("keyup", spellCheck);
resetButton.addEventListener("click", reset);

const number = (one, two) => one + two;
