(function () {
  'use strict';

  function initFaq() {
    document.querySelectorAll('.faq-question').forEach(btn => {
      btn.addEventListener('click', function () {
        const item = this.closest('.faq-item');
        const isOpen = item.classList.contains('open');
        document.querySelectorAll('.faq-item').forEach(el => el.classList.remove('open'));
        if (!isOpen) item.classList.add('open');
      });
    });
  }

  function initModuleCards() {
    document.querySelectorAll('.module-card').forEach(card => {
      card.addEventListener('click', function () {
        this.classList.toggle('active');
      });
    });
  }

  function initKillSwitch() {
    const toggle = document.getElementById('kill-toggle');
    if (!toggle) return;
    toggle.addEventListener('change', function () {
      if (this.checked) {
        const confirmed = window.confirm('킬 스위치를 활성화하시겠습니까?\n\n정의된 낙폭 임계값이 침범될 때 현금으로 이동합니다. 이 작업은 운영 일지에 기록됩니다.');
        if (!confirmed) { this.checked = false; return; }
        const s = document.getElementById('kill-status');
        if (s) { s.textContent = '활성화'; s.style.color = '#C01933'; }
      } else {
        const s = document.getElementById('kill-status');
        if (s) { s.textContent = '비활성'; s.style.color = '#6B6860'; }
      }
    });
  }

  function initSpecSheet() {
    const cagrInput = document.getElementById('cagr-input');
    const mddInput = document.getElementById('mdd-input');
    const cagrDisplay = document.getElementById('spec-cagr');
    const mddDisplay = document.getElementById('spec-mdd');
    if (cagrInput && cagrDisplay) {
      cagrInput.addEventListener('input', function () { cagrDisplay.textContent = this.value + '%'; });
    }
    if (mddInput && mddDisplay) {
      mddInput.addEventListener('input', function () { mddDisplay.textContent = '-' + this.value + '%'; });
    }
  }

  function initAllocationSliders() {
    document.querySelectorAll('.alloc-slider').forEach(slider => {
      slider.addEventListener('input', function () {
        const key = this.dataset.asset;
        const val = parseInt(this.value);
        const display = document.querySelector(`.alloc-val[data-asset="${key}"]`);
        const bar = document.querySelector(`.alloc-bar-fill[data-asset="${key}"]`);
        if (display) display.textContent = val + '%';
        if (bar) bar.style.width = val + '%';
      });
    });
  }

  function highlightActiveNav() {
    const path = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.site-nav a').forEach(link => {
      const href = link.getAttribute('href');
      if (href && (href.endsWith(path) || (path === '' && href.endsWith('index.html')))) {
        link.classList.add('active');
      }
    });
  }

  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(a => {
      a.addEventListener('click', function (e) {
        const target = document.querySelector(this.getAttribute('href'));
        if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initFaq();
    initModuleCards();
    initKillSwitch();
    initSpecSheet();
    initAllocationSliders();
    highlightActiveNav();
    initSmoothScroll();
  });

})();
