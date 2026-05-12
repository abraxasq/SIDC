(function () {
  'use strict';

  const questions = [
    {
      text: "How clearly have you defined your target annual return?",
      options: [
        { letter: 'A', text: "Clearly defined: specific % with written rationale", weight: 0 },
        { letter: 'B', text: "Roughly in mind: \"I want to beat inflation\"", weight: 20 },
        { letter: 'C', text: "Vague: \"As much as possible\"", weight: 35 },
        { letter: 'D', text: "Never thought about it formally", weight: 50 }
      ]
    },
    {
      text: "Do you have a written investment strategy document?",
      options: [
        { letter: 'A', text: "Yes — documented, reviewed regularly", weight: 0 },
        { letter: 'B', text: "Partially — some notes but not systematic", weight: 20 },
        { letter: 'C', text: "In my head but not written down", weight: 35 },
        { letter: 'D', text: "No formal strategy exists", weight: 45 }
      ]
    },
    {
      text: "How do you handle portfolio rebalancing?",
      options: [
        { letter: 'A', text: "Rule-based: fixed schedule or drift threshold triggers", weight: 0 },
        { letter: 'B', text: "Periodic: roughly once a year", weight: 15 },
        { letter: 'C', text: "When I remember or feel anxious about markets", weight: 35 },
        { letter: 'D', text: "I've never systematically rebalanced", weight: 50 }
      ]
    },
    {
      text: "Have you stress-tested your strategy against a 2008-style scenario?",
      options: [
        { letter: 'A', text: "Yes — formal backtest across multiple crisis periods", weight: 0 },
        { letter: 'B', text: "Informally — I've done rough calculations", weight: 20 },
        { letter: 'C', text: "No, but I plan to eventually", weight: 35 },
        { letter: 'D', text: "No — I assume diversification is enough", weight: 45 }
      ]
    },
    {
      text: "What is your maximum drawdown tolerance (the biggest loss you can accept)?",
      options: [
        { letter: 'A', text: "Precisely defined: specific % limit with a kill-switch plan", weight: 0 },
        { letter: 'B', text: "Roughly known: I can handle about -20% before panicking", weight: 15 },
        { letter: 'C', text: "Uncertain — I've never tested my actual reaction to losses", weight: 30 },
        { letter: 'D', text: "Unknown — I haven't considered maximum acceptable loss", weight: 45 }
      ]
    }
  ];

  let answers = new Array(questions.length).fill(null);
  let currentStep = 0;

  function init() {
    renderQuestions();
    bindEvents();
    showStep(0);
    updateProgress();
  }

  function renderQuestions() {
    const container = document.getElementById('quiz-steps');
    if (!container) return;

    container.innerHTML = questions.map((q, qi) => `
      <div class="quiz-step" data-step="${qi}">
        <p class="quiz-q-num">Question ${qi + 1} of ${questions.length}</p>
        <h2 class="quiz-question">${q.text}</h2>
        <div class="quiz-options">
          ${q.options.map((opt, oi) => `
            <button class="quiz-option" data-q="${qi}" data-i="${oi}" data-weight="${opt.weight}">
              <span class="option-letter">${opt.letter}</span>
              <span>${opt.text}</span>
            </button>
          `).join('')}
        </div>
        <div class="quiz-nav" style="display:flex;gap:1rem;justify-content:space-between;align-items:center;">
          ${qi > 0 ? `<button class="btn btn-outline btn-sm" onclick="DiagnosticQuiz.prev()">← Back</button>` : '<span></span>'}
          <button class="btn btn-primary" id="next-btn-${qi}" onclick="DiagnosticQuiz.next()" disabled>
            ${qi < questions.length - 1 ? 'Next →' : 'See My Score'}
          </button>
        </div>
      </div>
    `).join('');
  }

  function bindEvents() {
    document.addEventListener('click', function (e) {
      const opt = e.target.closest('.quiz-option');
      if (!opt) return;
      const qi = parseInt(opt.dataset.q);
      const oi = parseInt(opt.dataset.i);
      const weight = parseInt(opt.dataset.weight);

      // Deselect all options for this question
      document.querySelectorAll(`.quiz-option[data-q="${qi}"]`).forEach(el => {
        el.classList.remove('selected');
      });

      opt.classList.add('selected');
      answers[qi] = weight;

      const nextBtn = document.getElementById(`next-btn-${qi}`);
      if (nextBtn) nextBtn.disabled = false;
    });
  }

  function showStep(step) {
    document.querySelectorAll('.quiz-step').forEach(el => el.classList.remove('active'));
    const stepEl = document.querySelector(`.quiz-step[data-step="${step}"]`);
    if (stepEl) stepEl.classList.add('active');
    currentStep = step;
    updateProgress();
  }

  function updateProgress() {
    const fill = document.getElementById('progress-fill');
    const text = document.getElementById('progress-text');
    if (fill) fill.style.width = `${((currentStep) / questions.length) * 100}%`;
    if (text) text.textContent = `${currentStep} of ${questions.length} complete`;
  }

  function computeScore() {
    const totalPossible = questions.reduce((sum, q) => {
      return sum + Math.max(...q.options.map(o => o.weight));
    }, 0);
    const totalActual = answers.reduce((sum, w) => sum + (w || 0), 0);
    return Math.round((totalActual / totalPossible) * 100);
  }

  function getScoreLabel(score) {
    if (score <= 25) return { label: 'Well-Architected', color: '#2D6A4F', desc: 'Your investment approach is systematic and disciplined. Minor refinements remain.' };
    if (score <= 50) return { label: 'Moderate Debt', color: '#F5A623', desc: 'You have structure, but gaps in documentation or testing are creating hidden risk.' };
    if (score <= 75) return { label: 'High Technical Debt', color: '#C01933', desc: 'Significant undocumented assumptions and missing frameworks are compounding silently.' };
    return { label: 'Critical Debt', color: '#C01933', desc: 'Your portfolio lacks foundational architecture. Each market cycle increases the risk of a structural failure.' };
  }

  function showResults() {
    const score = computeScore();
    const info = getScoreLabel(score);

    // Hide all quiz steps
    document.querySelectorAll('.quiz-step').forEach(el => el.classList.remove('active'));
    document.getElementById('quiz-progress')?.classList.add('hidden');

    // Show result
    const resultEl = document.getElementById('score-result');
    if (!resultEl) return;

    const circumference = 2 * Math.PI * 80;
    const offset = circumference - (score / 100) * circumference;

    resultEl.innerHTML = `
      <div class="score-ring-lg">
        <svg viewBox="0 0 200 200" width="200" height="200">
          <circle cx="100" cy="100" r="80" fill="none" stroke="#D4CFC4" stroke-width="8"/>
          <circle cx="100" cy="100" r="80" fill="none"
            stroke="${info.color}" stroke-width="8"
            stroke-dasharray="${circumference}"
            stroke-dashoffset="${offset}"
            stroke-linecap="round"/>
        </svg>
        <div class="score-center">
          <span class="score-big" style="color:${info.color}">${score}</span>
          <span class="score-label">/ 100</span>
        </div>
      </div>

      <h2 class="score-title">${info.label}</h2>
      <p class="score-desc">${info.desc}</p>

      <div class="score-breakdown">
        ${getBreakdownItems(score)}
      </div>

      <div style="display:flex;gap:1rem;justify-content:center;flex-wrap:wrap;">
        <a href="workspace.html" class="btn btn-primary">Start Your SIDC Workspace →</a>
        <a href="diagnostic.html" class="btn btn-outline">Retake Assessment</a>
      </div>
    `;

    resultEl.classList.add('active');
  }

  function getBreakdownItems(score) {
    const items = [];

    if (answers[0] >= 30) items.push({ type: 'issue', text: '<strong>No CAGR target defined.</strong> Without a specific return target, you can\'t know if you\'re succeeding. Stage 1 fixes this.' });
    else items.push({ type: 'ok', text: '<strong>Return target is defined.</strong> Good baseline. Stage 1 will formalize it into a binding Spec Sheet.' });

    if (answers[1] >= 30) items.push({ type: 'issue', text: '<strong>No written strategy.</strong> Undocumented strategies drift under market pressure. Stage 1–2 will give you a Blueprint.' });
    else items.push({ type: 'ok', text: '<strong>Strategy is documented.</strong> A written record reduces emotional override. Stage 2 will elevate it to an Architecture.' });

    if (answers[2] >= 30) items.push({ type: 'issue', text: '<strong>Rebalancing is reactive.</strong> Emotion-driven rebalancing destroys alpha. Stage 3 will systematize your rules.' });
    else items.push({ type: 'ok', text: '<strong>Rebalancing is rule-based.</strong> Good discipline. Stage 5 will add drift monitoring to remove any remaining guesswork.' });

    if (answers[3] >= 30) items.push({ type: 'issue', text: '<strong>No stress testing performed.</strong> Your strategy is untested in adverse conditions. Stage 4 will run crisis simulations.' });

    return items.slice(0, 3).map(item => `
      <div class="breakdown-item ${item.type}">
        <span style="font-size:1rem">${item.type === 'issue' ? '⚠' : '✓'}</span>
        <p class="breakdown-text">${item.text}</p>
      </div>
    `).join('');
  }

  window.DiagnosticQuiz = {
    next() {
      if (answers[currentStep] === null) return;
      if (currentStep < questions.length - 1) {
        showStep(currentStep + 1);
      } else {
        showResults();
      }
    },
    prev() {
      if (currentStep > 0) showStep(currentStep - 1);
    }
  };

  document.addEventListener('DOMContentLoaded', init);
})();
