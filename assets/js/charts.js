(function () {
  'use strict';

  // ── WSJ Chart Defaults ──
  const WSJ = {
    fontFamily: "'Inter', system-ui, sans-serif",
    fontSize: 11,
    color: '#6B6860',
    gridColor: '#D4CFC4',
    blue: '#2E5FA3',
    gold: '#B08D57',
    red: '#C01933',
    ink: '#1A1A1A',
    cream: '#F8F6F1',
  };

  function applyWsjDefaults() {
    if (typeof Chart === 'undefined') return;
    Chart.defaults.font.family = WSJ.fontFamily;
    Chart.defaults.font.size = WSJ.fontSize;
    Chart.defaults.color = WSJ.color;
    Chart.defaults.plugins.legend.display = false;
    Chart.defaults.plugins.tooltip.backgroundColor = WSJ.cream;
    Chart.defaults.plugins.tooltip.titleColor = WSJ.ink;
    Chart.defaults.plugins.tooltip.bodyColor = WSJ.color;
    Chart.defaults.plugins.tooltip.borderColor = WSJ.gridColor;
    Chart.defaults.plugins.tooltip.borderWidth = 1;
    Chart.defaults.plugins.tooltip.padding = 10;
    Chart.defaults.plugins.tooltip.cornerRadius = 0;
  }

  // ── Performance Line Chart (Stage 4, Home) ──
  function initPerformanceChart() {
    const canvas = document.getElementById('performanceChart');
    if (!canvas) return;

    const labels = ['2014','2015','2016','2017','2018','2019','2020','2021','2022','2023','2024'];
    const portfolio  = [0, 7.2, 15.8, 31.4, 24.1, 48.3, 35.7, 72.1, 55.4, 84.2, 107.6];
    const benchmark  = [0, 5.1, 11.3, 22.7, 16.9, 35.4, 28.2, 58.9, 44.1, 65.3, 82.1];

    new Chart(canvas, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Lorenzini Strategy',
            data: portfolio,
            borderColor: WSJ.blue,
            backgroundColor: 'transparent',
            borderWidth: 2,
            pointRadius: 0,
            pointHoverRadius: 4,
            tension: 0.3,
          },
          {
            label: 'S&P 500 Benchmark',
            data: benchmark,
            borderColor: WSJ.color,
            backgroundColor: 'transparent',
            borderWidth: 1.5,
            borderDash: [4, 3],
            pointRadius: 0,
            pointHoverRadius: 4,
            tension: 0.3,
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        layout: { padding: { right: 80, top: 10 } },
        scales: {
          x: {
            grid: { display: false },
            border: { display: false },
            ticks: { font: { size: 11, family: WSJ.fontFamily }, color: WSJ.color }
          },
          y: {
            grid: { color: WSJ.gridColor, lineWidth: 1, drawBorder: false },
            border: { display: false, dash: [0] },
            ticks: {
              font: { size: 11, family: WSJ.fontFamily },
              color: WSJ.color,
              callback: v => v + '%'
            }
          }
        },
        plugins: {
          tooltip: {
            mode: 'index',
            intersect: false,
            callbacks: {
              label: ctx => ` ${ctx.dataset.label}: +${ctx.parsed.y.toFixed(1)}%`
            }
          },
          annotation: {
            annotations: {
              covid: {
                type: 'line',
                xMin: '2020',
                xMax: '2020',
                borderColor: WSJ.red,
                borderWidth: 1,
                borderDash: [4, 3],
                label: {
                  content: 'COVID-19',
                  display: true,
                  position: 'start',
                  color: WSJ.red,
                  font: { size: 10, family: WSJ.fontFamily },
                  backgroundColor: 'transparent',
                  padding: 2,
                  yAdjust: -8,
                }
              },
              rates: {
                type: 'line',
                xMin: '2022',
                xMax: '2022',
                borderColor: WSJ.color,
                borderWidth: 1,
                borderDash: [4, 3],
                label: {
                  content: 'Rate Hike',
                  display: true,
                  position: 'start',
                  color: WSJ.color,
                  font: { size: 10, family: WSJ.fontFamily },
                  backgroundColor: 'transparent',
                  padding: 2,
                  yAdjust: -8,
                }
              }
            }
          }
        }
      },
      plugins: [{
        id: 'directLabels',
        afterDraw(chart) {
          const ctx = chart.ctx;
          chart.data.datasets.forEach((ds, i) => {
            const meta = chart.getDatasetMeta(i);
            const last = meta.data[meta.data.length - 1];
            if (!last) return;
            ctx.save();
            ctx.font = `500 11px ${WSJ.fontFamily}`;
            ctx.fillStyle = ds.borderColor;
            ctx.textBaseline = 'middle';
            ctx.fillText(
              i === 0 ? 'Strategy' : 'Benchmark',
              last.x + 8,
              last.y
            );
            ctx.restore();
          });
        }
      }]
    });
  }

  // ── Allocation Bar Chart (Stage 2) ──
  function initAllocationChart() {
    const canvas = document.getElementById('allocationChart');
    if (!canvas) return;

    new Chart(canvas, {
      type: 'bar',
      data: {
        labels: ['Stocks', 'Bonds', 'Cash', 'Alternatives'],
        datasets: [{
          data: [50, 30, 15, 5],
          backgroundColor: [WSJ.blue, WSJ.ink, '#B3B3B3', WSJ.red],
          borderRadius: 0,
          borderSkipped: false,
        }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            grid: { color: WSJ.gridColor, lineWidth: 1 },
            border: { display: false },
            ticks: {
              callback: v => v + '%',
              font: { size: 11, family: WSJ.fontFamily },
              color: WSJ.color
            },
            max: 60
          },
          y: {
            grid: { display: false },
            border: { display: false },
            ticks: { font: { size: 13, family: WSJ.fontFamily, weight: '500' }, color: WSJ.ink }
          }
        },
        plugins: {
          tooltip: {
            callbacks: { label: ctx => ` ${ctx.parsed.x}% allocation` }
          }
        }
      },
      plugins: [{
        id: 'barLabels',
        afterDraw(chart) {
          const ctx = chart.ctx;
          chart.data.datasets[0].data.forEach((val, i) => {
            const meta = chart.getDatasetMeta(0);
            const bar = meta.data[i];
            ctx.save();
            ctx.font = `500 12px ${WSJ.fontFamily}`;
            ctx.fillStyle = WSJ.ink;
            ctx.textBaseline = 'middle';
            ctx.fillText(`${val}%`, bar.x + bar.width / 2 + 8, bar.y);
            ctx.restore();
          });
        }
      }]
    });
  }

  // ── Drift Gauge (Stage 5) ──
  function initDriftGauge() {
    const canvas = document.getElementById('driftGauge');
    if (!canvas) return;

    const drift = 3.2;
    const threshold = 5.0;
    const gaugeColor = drift < threshold ? WSJ.blue : WSJ.red;

    new Chart(canvas, {
      type: 'doughnut',
      data: {
        datasets: [
          {
            data: [drift, threshold - drift, 10 - threshold],
            backgroundColor: [gaugeColor, '#F0F4F8', '#FDECEA'],
            borderWidth: 0,
            circumference: 270,
            rotation: -135,
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '75%',
        plugins: {
          tooltip: { enabled: false }
        }
      },
      plugins: [{
        id: 'gaugeCenter',
        afterDraw(chart) {
          const { ctx, chartArea: { left, top, right, bottom } } = chart;
          const cx = (left + right) / 2;
          const cy = (top + bottom) / 2 + 20;
          ctx.save();
          ctx.font = `500 32px 'IBM Plex Mono', monospace`;
          ctx.fillStyle = gaugeColor;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(`${drift}%`, cx, cy - 10);
          ctx.font = `500 11px ${WSJ.fontFamily}`;
          ctx.fillStyle = WSJ.color;
          ctx.letterSpacing = '0.1em';
          ctx.fillText('CURRENT DRIFT', cx, cy + 20);
          ctx.restore();
        }
      }]
    });
  }

  // ── Mini Sparkline (My Page) ──
  function initDebtSparkline() {
    const canvas = document.getElementById('debtSparkline');
    if (!canvas) return;

    new Chart(canvas, {
      type: 'line',
      data: {
        labels: ['Jan', 'Mar', 'May', 'Jul', 'Sep', 'Nov'],
        datasets: [{
          data: [73, 68, 62, 55, 48, 41],
          borderColor: WSJ.blue,
          backgroundColor: 'rgba(46,95,163,0.07)',
          fill: true,
          borderWidth: 2,
          pointRadius: 0,
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: { display: false },
          y: {
            display: true,
            min: 0,
            max: 100,
            grid: { color: WSJ.gridColor },
            border: { display: false },
            ticks: { font: { size: 10 }, color: WSJ.color, callback: v => v }
          }
        },
        plugins: { tooltip: { enabled: false } }
      }
    });
  }

  // ── Initialize on load ──
  document.addEventListener('DOMContentLoaded', function () {
    if (typeof Chart === 'undefined') {
      console.warn('Chart.js not loaded');
      return;
    }
    applyWsjDefaults();
    initPerformanceChart();
    initAllocationChart();
    initDriftGauge();
    initDebtSparkline();
  });

})();
