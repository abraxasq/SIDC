(function () {
  'use strict';

  const questions = [
    {
      text: "목표 연간 수익률을 얼마나 명확히 정의하고 있나요?",
      options: [
        { letter: 'A', text: "명확히 정의됨: 서면 근거가 있는 구체적인 %", weight: 0 },
        { letter: 'B', text: "대략적으로 파악: \"인플레이션을 이기고 싶다\"", weight: 20 },
        { letter: 'C', text: "막연함: \"최대한 많이\"", weight: 35 },
        { letter: 'D', text: "공식적으로 생각해 본 적 없음", weight: 50 }
      ]
    },
    {
      text: "서면으로 작성된 투자 전략 문서가 있나요?",
      options: [
        { letter: 'A', text: "있음 — 문서화되어 있고 정기적으로 검토됨", weight: 0 },
        { letter: 'B', text: "일부만 — 메모가 있지만 체계적이지 않음", weight: 20 },
        { letter: 'C', text: "머릿속에만 있고 기록되어 있지 않음", weight: 35 },
        { letter: 'D', text: "공식적인 전략이 없음", weight: 45 }
      ]
    },
    {
      text: "포트폴리오 리밸런싱을 어떻게 처리하나요?",
      options: [
        { letter: 'A', text: "규칙 기반: 고정 일정 또는 드리프트 임계값 트리거", weight: 0 },
        { letter: 'B', text: "주기적: 대략 연 1회", weight: 15 },
        { letter: 'C', text: "기억나거나 시장에 불안할 때", weight: 35 },
        { letter: 'D', text: "체계적으로 리밸런싱한 적 없음", weight: 50 }
      ]
    },
    {
      text: "2008년 수준의 시나리오에 대해 전략을 스트레스 테스트한 적 있나요?",
      options: [
        { letter: 'A', text: "있음 — 여러 위기 기간에 걸친 공식 백테스트", weight: 0 },
        { letter: 'B', text: "비공식적으로 — 대략적인 계산만 해봤음", weight: 20 },
        { letter: 'C', text: "없음, 하지만 언젠가 할 계획", weight: 35 },
        { letter: 'D', text: "없음 — 분산투자로 충분하다고 생각", weight: 45 }
      ]
    },
    {
      text: "최대 낙폭 허용치(감당할 수 있는 가장 큰 손실)가 얼마인가요?",
      options: [
        { letter: 'A', text: "정밀하게 정의됨: 킬스위치 계획이 있는 구체적인 % 한도", weight: 0 },
        { letter: 'B', text: "대략적으로 알고 있음: 패닉하기 전 약 -20%까지 감당 가능", weight: 15 },
        { letter: 'C', text: "불확실 — 손실에 대한 실제 반응을 테스트한 적 없음", weight: 30 },
        { letter: 'D', text: "모름 — 최대 허용 손실을 고려한 적 없음", weight: 45 }
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
        <p class="quiz-q-num">${qi + 1} / ${questions.length}번 질문</p>
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
          ${qi > 0 ? `<button class="btn btn-outline btn-sm" onclick="DiagnosticQuiz.prev()">← 이전</button>` : '<span></span>'}
          <button class="btn btn-primary" id="next-btn-${qi}" onclick="DiagnosticQuiz.next()" disabled>
            ${qi < questions.length - 1 ? '다음 →' : '점수 확인하기'}
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
    if (text) text.textContent = `${currentStep} / ${questions.length} 완료`;
  }

  function computeScore() {
    const totalPossible = questions.reduce((sum, q) => {
      return sum + Math.max(...q.options.map(o => o.weight));
    }, 0);
    const totalActual = answers.reduce((sum, w) => sum + (w || 0), 0);
    return Math.round((totalActual / totalPossible) * 100);
  }

  function getScoreLabel(score) {
    if (score <= 25) return { label: '잘 설계된 포트폴리오', color: '#2D6A4F', desc: '투자 접근 방식이 체계적이고 규율 있습니다. 소소한 개선이 남아 있습니다.' };
    if (score <= 50) return { label: '보통 수준의 기술부채', color: '#F5A623', desc: '구조는 있지만, 문서화 또는 테스트의 격차가 숨겨진 위험을 만들고 있습니다.' };
    if (score <= 75) return { label: '높은 기술부채', color: '#C01933', desc: '상당한 미문서화된 가정과 누락된 프레임워크가 조용히 복잡해지고 있습니다.' };
    return { label: '심각한 기술부채', color: '#C01933', desc: '포트폴리오에 기초 아키텍처가 없습니다. 각 시장 사이클은 구조적 실패의 위험을 높입니다.' };
  }

  function showResults() {
    const score = computeScore();
    const info = getScoreLabel(score);

    document.querySelectorAll('.quiz-step').forEach(el => el.classList.remove('active'));
    document.getElementById('quiz-progress')?.classList.add('hidden');

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
        <a href="workspace.html" class="btn btn-primary">SIDC 워크스페이스 시작하기 →</a>
        <a href="diagnostic.html" class="btn btn-outline">진단 재시작</a>
      </div>
    `;

    resultEl.classList.add('active');
  }

  function getBreakdownItems(score) {
    const items = [];

    if (answers[0] >= 30) items.push({ type: 'issue', text: '<strong>CAGR 목표가 정의되지 않았습니다.</strong> 구체적인 수익 목표 없이는 성공 여부를 알 수 없습니다. 1단계에서 이를 해결합니다.' });
    else items.push({ type: 'ok', text: '<strong>수익 목표가 정의되어 있습니다.</strong> 좋은 기준선입니다. 1단계에서 이를 구속력 있는 명세서로 공식화합니다.' });

    if (answers[1] >= 30) items.push({ type: 'issue', text: '<strong>서면 전략이 없습니다.</strong> 미문서화된 전략은 시장 압박 하에서 흔들립니다. 1–2단계에서 설계도를 제공합니다.' });
    else items.push({ type: 'ok', text: '<strong>전략이 문서화되어 있습니다.</strong> 서면 기록은 감정적 무시를 줄입니다. 2단계에서 아키텍처로 격상합니다.' });

    if (answers[2] >= 30) items.push({ type: 'issue', text: '<strong>리밸런싱이 반응적입니다.</strong> 감정 주도 리밸런싱은 알파를 파괴합니다. 3단계에서 규칙을 체계화합니다.' });
    else items.push({ type: 'ok', text: '<strong>리밸런싱이 규칙 기반입니다.</strong> 훌륭한 규율입니다. 5단계에서 드리프트 모니터링을 추가하여 남은 추측을 제거합니다.' });

    if (answers[3] >= 30) items.push({ type: 'issue', text: '<strong>스트레스 테스트가 수행되지 않았습니다.</strong> 전략이 불리한 조건에서 테스트되지 않았습니다. 4단계에서 위기 시뮬레이션을 실행합니다.' });

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
