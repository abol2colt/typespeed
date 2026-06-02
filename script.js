'use strict';

const timerElement = document.querySelector('.timer');
const testInput = document.querySelector('#test-input');
const originText = document.querySelector('#origin-text').textContent.trim();
const resetButton = document.querySelector('#reset');
const testWrapper = document.querySelector('.test-wrapper');
const resultTableBody = document.querySelector('#result-table tbody');

const TIMER_INTERVAL_MS = 10;
const CENTISECONDS_PER_SECOND = 100;
const SECONDS_PER_MINUTE = 60;
const AVERAGE_WORD_LENGTH = 5;

const game = {
  round: 0,
  elapsedCentiseconds: 0,
  intervalId: null,
  isRunning: false,
  isFinished: false,
};

function formatTime(totalCentiseconds) {
  const minutes = Math.floor(totalCentiseconds / (CENTISECONDS_PER_SECOND * SECONDS_PER_MINUTE));
  const seconds = Math.floor((totalCentiseconds / CENTISECONDS_PER_SECOND) % SECONDS_PER_MINUTE);
  const centiseconds = totalCentiseconds % CENTISECONDS_PER_SECOND;

  return [minutes, seconds, centiseconds]
    .map((value) => String(value).padStart(2, '0'))
    .join(':');
}

function renderTimer() {
  timerElement.textContent = formatTime(game.elapsedCentiseconds);
}

function startTimer() {
  if (game.isRunning || game.isFinished) return;

  game.isRunning = true;
  game.intervalId = window.setInterval(() => {
    game.elapsedCentiseconds += 1;
    renderTimer();
  }, TIMER_INTERVAL_MS);
}

function stopTimer() {
  window.clearInterval(game.intervalId);
  game.intervalId = null;
  game.isRunning = false;
}

function countErrors(text) {
  return [...text].reduce((errors, character, index) => {
    return character === originText[index] ? errors : errors + 1;
  }, 0);
}

function calculateResults() {
  const typedText = testInput.value;
  const typedCharacters = typedText.length;
  const elapsedSeconds = game.elapsedCentiseconds / CENTISECONDS_PER_SECOND;
  const words = typedCharacters / AVERAGE_WORD_LENGTH;
  const errors = countErrors(typedText);
  const correctCharacters = Math.max(typedCharacters - errors, 0);
  const accuracy = typedCharacters === 0 ? 0 : (correctCharacters / typedCharacters) * 100;
  const wordsPerSecond = elapsedSeconds === 0 ? 0 : words / elapsedSeconds;
  const wordsPerMinute = wordsPerSecond * SECONDS_PER_MINUTE;

  return {
    round: game.round,
    errors,
    accuracy: accuracy.toFixed(2),
    wpm: wordsPerMinute.toFixed(2),
    wps: wordsPerSecond.toFixed(2),
  };
}

function appendResultRow() {
  const result = calculateResults();
  const row = document.createElement('tr');

  row.innerHTML = `
    <td>${result.round}</td>
    <td>${result.errors}</td>
    <td>${result.accuracy}%</td>
    <td>${result.wpm}</td>
    <td>${result.wps}</td>
  `;

  resultTableBody.append(row);
}

function finishTest() {
  if (game.isFinished) return;

  game.round += 1;
  game.isFinished = true;
  stopTimer();
  testInput.disabled = true;
  testWrapper.dataset.state = 'success';
  appendResultRow();
}

function updateTypingState() {
  const typedText = testInput.value;

  if (!typedText) {
    testWrapper.dataset.state = 'idle';
    return;
  }

  if (typedText === originText) {
    finishTest();
    return;
  }

  const isCorrectSoFar = originText.startsWith(typedText);
  testWrapper.dataset.state = isCorrectSoFar ? 'active' : 'error';
}

function handleInput() {
  if (testInput.value.length > 0) startTimer();
  updateTypingState();
}

function resetTest() {
  stopTimer();
  game.elapsedCentiseconds = 0;
  game.isFinished = false;
  testInput.disabled = false;
  testInput.value = '';
  testWrapper.dataset.state = 'idle';
  renderTimer();
  testInput.focus();
}

testInput.addEventListener('input', handleInput);
resetButton.addEventListener('click', resetTest);
renderTimer();
