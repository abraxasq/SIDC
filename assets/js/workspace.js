(function () {
  'use strict';

  // ── FAQ Accordion ──
  function initFaq() {
    document.querySelectorAll('.faq-question').forEach(btn => {
      btn.addEventListener('click', function () {
        const item = this.closest('.faq-item');
        const isOpen = item.classList.contains('open');

        // Close all
        document.querySelectorAll('.faq-item').forEach(el => el.classList.remove('open'));

        // Toggle clicked
        if (!isOpen) item.classList.add('open');
      });
    });
  }

  // ── Module Card Toggle (Stage 3) ──
  function initModuleCards() {
    document.querySelectorAll('.module-card').forEach(card => {
      card.addEventListener('click', function () {
        this.classList.toggle('active');
      });
    });
  }

  // ── Kill Switch Confirmation ──
  function initKillSwitch() {
    const toggle = document.getElementById('kill-toggle');
    if (!toggle) return;

    toggle.addEventListener('change', function () {
      if (this.checked) {
        const confirm = window.confirm(
          'Activate Kill Switch?\n\nThis will trigger a move to cash when the defined drawdown threshold is breached. This action will be logged in your Operations Journal.'
        );
        if (!confirm) {
          this.checked = false;
          return;
        }
        const statusEl = document.getElementById('kill-status');
        if (statusEl) {
          statusEl.textContent = 'ARMED';
          statusEl.style.color = '#C01933';
        }
      } else {
        const statusEl = document.getElementById('kill-status');
        if (statusEl) {
          statusEl.textContent = 'INACTIVE';
          statusEl.style.color = '#6B6860';
        }
      }
    });
  }

  // ── Spec Sheet Preview (Stage 1) ──
  function initSpecSheet() {
    const cagrInput = document.getElementById('cagr-input');
    const mddInput = document.getElementById('mdd-input');
    const cagrDisplay = document.getElementById('spec-cagr');
    const mddDisplay = document.getElementById('spec-mdd');

    if (cagrInput && cagrDisplay) {
      cagrInput.addEventListener('input', function () {
        cagrDisplay.textContent = this.value + '%';
      });
    }

    if (mddInput && mddDisplay) {
      mddInput.addEventListener('input', function () {
        mddDisplay.textContent = '-' + this.value + '%';
      });
    }
  }

  // ── Allocation Sliders (Stage 2) ──
  function initAllocationSliders() {
    const sliders = document.querySelectorAll('.alloc-slider');
    if (!sliders.length) return;

    sliders.forEach(slider => {
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

  // ── Mobile Nav Toggle ──
  function initMobileNav() {
    const hamburger = document.getElementById('nav-toggle');
    const nav = document.querySelector('.site-nav');
    if (!hamburger || !nav) return;

    hamburger.addEventListener('click', function () {
      nav.style.display = nav.style.display === 'flex' ? 'none' : 'flex';
    });
  }

  // ── Active Nav Link Highlight ──
  function highlightActiveNav() {
    const path = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.site-nav a').forEach(link => {
      const href = link.getAttribute('href');
      if (href === path || (path === '' && href === 'index.html')) {
        link.classList.add('active');
      }
    });
  }

  // ── Smooth Scroll CTA ──
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(a => {
      a.addEventListener('click', function (e) {
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initFaq();
    initModuleCards();
    initKillSwitch();
    initSpecSheet();
    initAllocationSliders();
    initMobileNav();
    highlightActiveNav();
    initSmoothScroll();
  });

})();
