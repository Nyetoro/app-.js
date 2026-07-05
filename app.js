// ══════════════════════════════════════════════════════════
// JS QUIZ CHALLENGE — 100% JavaScript
// No HTML markup, no CSS file. Every element, every style,
// every interaction is created and controlled from here.
// ══════════════════════════════════════════════════════════

(() => {
  "use strict";

  // ── QUIZ DATA ──
  const QUESTIONS = [
    {
      q: "Which company created JavaScript?",
      options: ["Microsoft", "Netscape", "Google", "Apple"],
      answer: 1
    },
    {
      q: "What does DOM stand for?",
      options: ["Document Object Model", "Data Object Model", "Document Order Model", "Digital Object Model"],
      answer: 0
    },
    {
      q: "Which method converts a JS object into a JSON string?",
      options: ["JSON.parse()", "JSON.stringify()", "JSON.toText()", "Object.toJSON()"],
      answer: 1
    },
    {
      q: "What will `typeof null` return in JavaScript?",
      options: ["'null'", "'undefined'", "'object'", "'boolean'"],
      answer: 2
    },
    {
      q: "Which keyword declares a variable that can't be reassigned?",
      options: ["let", "var", "const", "static"],
      answer: 2
    },
    {
      q: "Which array method creates a new array with only elements that pass a test?",
      options: ["map()", "filter()", "reduce()", "forEach()"],
      answer: 1
    },
    {
      q: "What is the correct way to write an arrow function that returns a + b?",
      options: ["(a, b) => a + b", "(a, b) -> a + b", "function => a + b", "(a, b) : a + b"],
      answer: 0
    }
  ];

  const TIME_PER_QUESTION = 15; // seconds

  // ── STATE ──
  const state = {
    screen: "start",     // start | quiz | result
    currentIndex: 0,
    score: 0,
    selectedOption: null,
    timeLeft: TIME_PER_QUESTION,
    answered: false,
    history: []           // { question, selected, correct }
  };

  let timerId = null;

  // ══════════════════════════════════════════
  // INJECT STYLES — built entirely in JS, no .css file
  // ══════════════════════════════════════════
  function injectStyles() {
    const style = document.createElement("style");
    style.textContent = `
      * { margin:0; padding:0; box-sizing:border-box; }

      body {
        font-family: 'Segoe UI', system-ui, sans-serif;
        background: linear-gradient(135deg, #1e1b4b, #4c1d95);
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 20px;
      }

      #app {
        width: 100%;
        max-width: 560px;
        background: #ffffff;
        border-radius: 20px;
        box-shadow: 0 30px 60px rgba(0,0,0,0.35);
        padding: 40px;
        color: #1f2937;
      }

      .eyebrow {
        font-size: 0.75rem;
        letter-spacing: 0.12em;
        text-transform: uppercase;
        color: #7c3aed;
        font-weight: 700;
        margin-bottom: 8px;
      }

      h1 {
        font-size: 1.8rem;
        margin-bottom: 12px;
        color: #1e1b4b;
      }

      p.sub {
        color: #6b7280;
        margin-bottom: 28px;
        line-height: 1.5;
      }

      .btn {
        display: inline-block;
        padding: 14px 28px;
        border-radius: 10px;
        border: none;
        font-size: 1rem;
        font-weight: 700;
        cursor: pointer;
        transition: transform 0.12s, background 0.15s;
      }

      .btn:active { transform: scale(0.96); }

      .btn-primary {
        background: #7c3aed;
        color: #fff;
      }
      .btn-primary:hover { background: #6d28d9; }

      .btn-secondary {
        background: #f3f4f6;
        color: #374151;
        border: 1px solid #e5e7eb;
      }
      .btn-secondary:hover { background: #e5e7eb; }

      .progress-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 18px;
        font-size: 0.85rem;
        color: #6b7280;
        font-weight: 600;
      }

      .progress-track {
        width: 100%;
        height: 8px;
        background: #f3f4f6;
        border-radius: 6px;
        overflow: hidden;
        margin-bottom: 24px;
      }

      .progress-fill {
        height: 100%;
        background: linear-gradient(90deg, #7c3aed, #a855f7);
        border-radius: 6px;
        transition: width 0.3s ease;
      }

      .timer-badge {
        font-family: 'Courier New', monospace;
        font-weight: 700;
        padding: 4px 12px;
        border-radius: 20px;
        background: #f3f4f6;
        color: #374151;
      }
      .timer-badge.low {
        background: #fee2e2;
        color: #dc2626;
      }

      .question-text {
        font-size: 1.3rem;
        font-weight: 600;
        margin-bottom: 24px;
        color: #1e1b4b;
      }

      .options {
        display: flex;
        flex-direction: column;
        gap: 12px;
        margin-bottom: 28px;
      }

      .option-btn {
        text-align: left;
        padding: 14px 18px;
        border-radius: 12px;
        border: 2px solid #e5e7eb;
        background: #fff;
        font-size: 0.98rem;
        cursor: pointer;
        transition: border-color 0.15s, background 0.15s;
        color: #1f2937;
      }
      .option-btn:hover:not(:disabled) {
        border-color: #a855f7;
        background: #faf5ff;
      }
      .option-btn:disabled { cursor: default; }

      .option-btn.correct {
        border-color: #22c55e;
        background: #f0fdf4;
        color: #15803d;
        font-weight: 600;
      }
      .option-btn.incorrect {
        border-color: #ef4444;
        background: #fef2f2;
        color: #b91c1c;
        font-weight: 600;
      }

      .footer-row {
        display: flex;
        justify-content: flex-end;
      }

      .result-score {
        font-size: 3rem;
        font-weight: 800;
        color: #7c3aed;
        margin-bottom: 6px;
        font-family: 'Courier New', monospace;
      }

      .result-label {
        color: #6b7280;
        margin-bottom: 28px;
      }

      .history-list {
        display: flex;
        flex-direction: column;
        gap: 10px;
        margin-bottom: 28px;
        max-height: 260px;
        overflow-y: auto;
      }

      .history-item {
        display: flex;
        gap: 10px;
        align-items: flex-start;
        padding: 12px 14px;
        border-radius: 10px;
        background: #f9fafb;
        font-size: 0.85rem;
      }

      .history-icon {
        flex-shrink: 0;
        width: 22px; height: 22px;
        border-radius: 50%;
        display: flex; align-items: center; justify-content: center;
        font-size: 0.75rem;
        font-weight: 700;
        color: #fff;
      }
      .history-icon.correct { background: #22c55e; }
      .history-icon.incorrect { background: #ef4444; }

      @media (max-width: 480px) {
        #app { padding: 28px 22px; }
        h1 { font-size: 1.5rem; }
        .result-score { font-size: 2.4rem; }
      }
    `;
    document.head.appendChild(style);
  }

  // ══════════════════════════════════════════
  // DOM HELPERS — small utility so we're not repeating
  // document.createElement + setAttribute everywhere
  // ══════════════════════════════════════════
  function el(tag, props = {}, children = []) {
    const node = document.createElement(tag);
    Object.entries(props).forEach(([key, value]) => {
      if (key === "class") node.className = value;
      else if (key === "text") node.textContent = value;
      else if (key.startsWith("on") && typeof value === "function") {
        node.addEventListener(key.substring(2).toLowerCase(), value);
      } else {
        node.setAttribute(key, value);
      }
    });
    children.forEach(child => node.appendChild(child));
    return node;
  }

  function getRoot() {
    let root = document.getElementById("app");
    if (!root) {
      root = el("div", { id: "app" });
      document.body.appendChild(root);
    }
    return root;
  }

  function clearRoot() {
    const root = getRoot();
    root.innerHTML = "";
    return root;
  }

  // ══════════════════════════════════════════
  // SCREEN: START
  // ══════════════════════════════════════════
  function renderStart() {
    const root = clearRoot();

    root.appendChild(el("div", { class: "eyebrow", text: "JavaScript Fundamentals" }));
    root.appendChild(el("h1", { text: "Quiz Challenge" }));
    root.appendChild(el("p", {
      class: "sub",
      text: `${QUESTIONS.length} questions, ${TIME_PER_QUESTION} seconds each. No frameworks, no libraries — just plain JavaScript building everything you see.`
    }));
    root.appendChild(el("button", {
      class: "btn btn-primary",
      text: "Start Quiz",
      onClick: startQuiz
    }));
  }

  function startQuiz() {
    state.screen = "quiz";
    state.currentIndex = 0;
    state.score = 0;
    state.history = [];
    renderQuestion();
  }

  // ══════════════════════════════════════════
  // SCREEN: QUESTION
  // ══════════════════════════════════════════
  function renderQuestion() {
    const root = clearRoot();
    const q = QUESTIONS[state.currentIndex];
    state.selectedOption = null;
    state.answered = false;
    state.timeLeft = TIME_PER_QUESTION;

    // progress row
    const progressRow = el("div", { class: "progress-row" }, [
      el("span", { text: `Question ${state.currentIndex + 1} of ${QUESTIONS.length}` }),
      el("span", { id: "timerBadge", class: "timer-badge", text: `${state.timeLeft}s` })
    ]);
    root.appendChild(progressRow);

    // progress bar
    const pct = Math.round(((state.currentIndex) / QUESTIONS.length) * 100);
    root.appendChild(el("div", { class: "progress-track" }, [
      el("div", { class: "progress-fill", style: "" , id: "progressFill" })
    ]));
    document.getElementById("progressFill").style.width = pct + "%";

    // question text
    root.appendChild(el("div", { class: "question-text", text: q.q }));

    // options
    const optionsWrap = el("div", { class: "options", id: "optionsWrap" });
    q.options.forEach((optionText, i) => {
      const btn = el("button", {
        class: "option-btn",
        text: optionText,
        onClick: () => selectOption(i)
      });
      optionsWrap.appendChild(btn);
    });
    root.appendChild(optionsWrap);

    // footer / next button (disabled until answered)
    const footer = el("div", { class: "footer-row" }, [
      el("button", {
        class: "btn btn-primary",
        id: "nextBtn",
        text: state.currentIndex === QUESTIONS.length - 1 ? "See Results" : "Next Question",
        onClick: goToNext
      })
    ]);
    document_disableNextButton();
    root.appendChild(footer);
    // disable next button until an answer is chosen
    setTimeout(() => {
      const nextBtn = document.getElementById("nextBtn");
      if (nextBtn) nextBtn.setAttribute("disabled", "true");
    }, 0);

    startTimer();
  }

  function document_disableNextButton() {
    // placeholder no-op kept for clarity of intent above; real disabling happens after append
  }

  function startTimer() {
    clearInterval(timerId);
    timerId = setInterval(() => {
      state.timeLeft--;
      const badge = document.getElementById("timerBadge");
      if (badge) {
        badge.textContent = `${state.timeLeft}s`;
        badge.classList.toggle("low", state.timeLeft <= 5);
      }
      if (state.timeLeft <= 0) {
        clearInterval(timerId);
        if (!state.answered) {
          lockInAnswer(null); // time's up, no answer selected
        }
      }
    }, 1000);
  }

  function selectOption(index) {
    if (state.answered) return;
    lockInAnswer(index);
  }

  function lockInAnswer(index) {
    clearInterval(timerId);
    state.answered = true;
    state.selectedOption = index;

    const q = QUESTIONS[state.currentIndex];
    const isCorrect = index === q.answer;
    if (isCorrect) state.score++;

    state.history.push({
      question: q.q,
      selected: index === null ? "No answer" : q.options[index],
      correct: isCorrect
    });

    // visually mark all options
    const buttons = document.querySelectorAll("#optionsWrap .option-btn");
    buttons.forEach((btn, i) => {
      btn.setAttribute("disabled", "true");
      if (i === q.answer) btn.classList.add("correct");
      else if (i === index) btn.classList.add("incorrect");
    });

    const nextBtn = document.getElementById("nextBtn");
    if (nextBtn) nextBtn.removeAttribute("disabled");
  }

  function goToNext() {
    if (!state.answered) return;
    if (state.currentIndex < QUESTIONS.length - 1) {
      state.currentIndex++;
      renderQuestion();
    } else {
      state.screen = "result";
      renderResult();
    }
  }

  // ══════════════════════════════════════════
  // SCREEN: RESULT
  // ══════════════════════════════════════════
  function renderResult() {
    const root = clearRoot();

    root.appendChild(el("div", { class: "eyebrow", text: "Quiz Complete" }));
    root.appendChild(el("div", { class: "result-score", text: `${state.score} / ${QUESTIONS.length}` }));

    const pct = Math.round((state.score / QUESTIONS.length) * 100);
    let message = "Keep practicing — you'll get there!";
    if (pct >= 85) message = "Excellent! You really know your JavaScript.";
    else if (pct >= 60) message = "Good work — a few gaps to brush up on.";

    root.appendChild(el("div", { class: "result-label", text: message }));

    const historyList = el("div", { class: "history-list" });
    state.history.forEach(item => {
      historyList.appendChild(el("div", { class: "history-item" }, [
        el("div", {
          class: `history-icon ${item.correct ? "correct" : "incorrect"}`,
          text: item.correct ? "✓" : "✕"
        }),
        el("div", {}, [
          el("div", { text: item.question, style: "font-weight:600; margin-bottom:2px;" }),
          el("div", { text: `Your answer: ${item.selected}`, style: "color:#6b7280;" })
        ])
      ]));
    });
    root.appendChild(historyList);

    root.appendChild(el("button", {
      class: "btn btn-primary",
      text: "Try Again",
      onClick: startQuiz
    }));
  }

  // ══════════════════════════════════════════
  // INIT
  // ══════════════════════════════════════════
  function init() {
    injectStyles();
    getRoot();
    renderStart();
  }

  document.addEventListener("DOMContentLoaded", init);
})();