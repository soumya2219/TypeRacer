'use strict';

document.addEventListener('DOMContentLoaded', () => {
  const texts = {
    easy: [
      "The cat sat on the mat.",
      "A quick brown fox jumps over the lazy dog.",
      "Hello world!"
    ],
    medium: [
      "Typing speed is a useful skill for many jobs.",
      "Practice makes perfect when learning to type fast.",
      "JavaScript powers interactive web applications."
    ],
    hard: [
      "She sells seashells by the seashore, and the shells she sells are surely seashells.",
      "The quick onyx goblin jumps over the lazy dwarf, vexing them both.",
      "Pack my box with five dozen liquor jugs."
    ]
  };

  // Shorthand selectors
  const el = id => document.getElementById(id);
  const difficulty = el('difficulty'), sample = el('sampleText'), input = el('typingInput');
  const startBtn = el('startBtn'), stopBtn = el('stopBtn'), retryBtn = el('retryBtn');
  const resLevel = el('resultLevel'), resTime = el('resultTime'), resWPM = el('resultWPM');

  // State
  let currentText = '';
  let startTime = null;
  let timer = null;
  let isRunning = false; // ✅ new: prevents double-starts

  const cap = s => s[0].toUpperCase() + s.slice(1);

  // Pick a sentence for the current difficulty; avoid immediate repeats
  const pickText = () => {
    const arr = texts[difficulty.value] || texts.easy;
    let next;
    do next = arr[Math.floor(Math.random() * arr.length)];
    while (arr.length > 1 && next === currentText);
    currentText = next;
    sample.textContent = currentText;
    resLevel.textContent = cap(difficulty.value);
  };

  const clearTimer = () => {
    if (timer) {
      clearInterval(timer);
      timer = null;
    }
  };

  const startTimer = () => {
    clearTimer();                     // ✅ ensure only one interval
    startTime = new Date();
    resTime.textContent = '0s';
    timer = setInterval(() => {
      const secs = ((new Date()) - startTime) / 1000;
      resTime.textContent = secs.toFixed(2) + 's';
    }, 100);
  };

  const wpm = () => {
    const sWords = currentText.trim().split(/\s+/);
    const tWords = input.value.trim().split(/\s+/);
    let correct = 0;
    sWords.forEach((w, i) => { if (tWords[i] === w) correct++; });
    const secs = ((new Date()) - startTime) / 1000 || 1;
    return Math.round((correct / secs) * 60);
  };

  const resetUI = () => {
    pickText();                 // preview text
    input.value = '';
    input.disabled = false;     // allow focusing to start
    startBtn.disabled = false;
    stopBtn.disabled = true;
    retryBtn.disabled = true;
    resTime.textContent = '0s';
    resWPM.textContent = '0';
    clearTimer();
    startTime = null;
    isRunning = false;          // ✅ not running
  };

  const startTest = () => {
    if (isRunning) return;      // ✅ hard guard
    isRunning = true;           // ✅ set immediately to block re-entry
    pickText();                 // new sentence each run
    input.disabled = false;
    input.value = '';
    input.focus();
    startBtn.disabled = true;
    stopBtn.disabled = false;
    retryBtn.disabled = true;
    resWPM.textContent = '0';
    startTimer();
  };

  const stopTest = () => {
    if (!isRunning) return;
    input.disabled = true;
    clearTimer();
    resWPM.textContent = wpm();
    startBtn.disabled = false;
    stopBtn.disabled = true;
    retryBtn.disabled = false;
    isRunning = false;          // ✅ mark stopped
    startTime = null;
  };

  /* Events */
  startBtn.addEventListener('click', startTest);
  stopBtn.addEventListener('click', stopTest);
  retryBtn.addEventListener('click', startTest);         // retry = fresh start

  difficulty.addEventListener('change', resetUI);        // new preview + ready to focus-start

  // Start on focus (click into the box). Because isRunning is set before we refocus,
  // the focus event won't start a second timer.
  input.addEventListener('focus', startTest);

  // Stop on Enter
  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') { e.preventDefault(); stopTest(); }
  });

  /* Init */
  resetUI();
});
