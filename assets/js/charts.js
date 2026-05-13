/* ============================================================
   Lorenzini — D3.js charts (WSJ-styled, Dona Wong principles)
   ============================================================ */
(function () {
  'use strict';

  if (typeof d3 === 'undefined') {
    console.warn('[Lorenzini] D3 not loaded');
    return;
  }

  const COL = {
    ink:   '#1A1A1A',
    cap:   '#6B6860',
    rule:  '#D4CFC4',
    cream: '#F8F6F1',
    blue:  '#2E5FA3',
    gold:  '#B08D57',
    red:   '#C01933',
    green: '#2D6A4F',
    warn:  '#F5A623',
    paper: '#EFEDE6',
  };
  const FONT_UI = "'Inter', 'Noto Sans KR', system-ui, sans-serif";
  const FONT_DATA = "'IBM Plex Mono', monospace";

  function drawPerformanceChart() {
    const host = document.getElementById('performanceChart');
    if (!host) return;
    host.innerHTML = '';

    const data = [
      { year: 2014, portfolio: 0.0,   benchmark: 0.0 },
      { year: 2015, portfolio: 7.2,   benchmark: 5.1 },
      { year: 2016, portfolio: 15.8,  benchmark: 11.3 },
      { year: 2017, portfolio: 31.4,  benchmark: 22.7 },
      { year: 2018, portfolio: 24.1,  benchmark: 16.9 },
      { year: 2019, portfolio: 48.3,  benchmark: 35.4 },
      { year: 2020, portfolio: 35.7,  benchmark: 28.2 },
      { year: 2021, portfolio: 72.1,  benchmark: 58.9 },
      { year: 2022, portfolio: 55.4,  benchmark: 44.1 },
      { year: 2023, portfolio: 84.2,  benchmark: 65.3 },
      { year: 2024, portfolio: 107.6, benchmark: 82.1 }
    ];

    const margin = { top: 24, right: 90, bottom: 32, left: 48 };
    const fullWidth = host.clientWidth || 720;
    const fullHeight = 340;
    const w = fullWidth - margin.left - margin.right;
    const h = fullHeight - margin.top - margin.bottom;

    const svg = d3.select(host).append('svg')
      .attr('viewBox', `0 0 ${fullWidth} ${fullHeight}`)
      .attr('width', '100%')
      .attr('height', fullHeight)
      .style('display', 'block')
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    const x = d3.scaleLinear().domain([2014, 2024]).range([0, w]);
    const y = d3.scaleLinear().domain([0, 120]).range([h, 0]);

    svg.append('g')
      .attr('class', 'grid')
      .call(d3.axisLeft(y).ticks(6).tickSize(-w).tickFormat(''))
      .call(g => g.select('.domain').remove())
      .selectAll('line').attr('stroke', COL.rule).attr('stroke-width', 1);

    svg.append('g')
      .attr('transform', `translate(0,${h})`)
      .call(d3.axisBottom(x).ticks(11).tickFormat(d3.format('d')).tickSize(0))
      .call(g => g.select('.domain').remove())
      .selectAll('text')
        .attr('font-family', FONT_UI)
        .attr('font-size', 11)
        .attr('fill', COL.cap)
        .attr('dy', '1em');

    svg.append('g')
      .call(d3.axisLeft(y).ticks(6).tickFormat(d => d + '%').tickSize(0))
      .call(g => g.select('.domain').remove())
      .selectAll('text')
        .attr('font-family', FONT_UI)
        .attr('font-size', 11)
        .attr('fill', COL.cap);

    const annotations = [
      { year: 2020, label: 'COVID-19', color: COL.red },
      { year: 2022, label: 'Rate Hike', color: COL.cap }
    ];
    annotations.forEach(a => {
      svg.append('line')
        .attr('x1', x(a.year)).attr('x2', x(a.year))
        .attr('y1', 0).attr('y2', h)
        .attr('stroke', a.color).attr('stroke-dasharray', '4 3').attr('stroke-width', 1);
      svg.append('text')
        .attr('x', x(a.year) + 4).attr('y', 12)
        .text(a.label)
        .attr('fill', a.color).attr('font-size', 10).attr('font-family', FONT_UI).attr('font-weight', 500);
    });

    const lineGen = (k) => d3.line().x(d => x(d.year)).y(d => y(d[k])).curve(d3.curveMonotoneX);

    svg.append('path').datum(data)
      .attr('fill', 'none').attr('stroke', COL.cap).attr('stroke-width', 1.5).attr('stroke-dasharray', '4 2')
      .attr('d', lineGen('benchmark'));

    svg.append('path').datum(data)
      .attr('fill', 'none').attr('stroke', COL.blue).attr('stroke-width', 2)
      .attr('d', lineGen('portfolio'));

    const last = data[data.length - 1];
    svg.append('text').attr('x', x(last.year) + 6).attr('y', y(last.portfolio))
      .attr('fill', COL.blue).attr('font-size', 11).attr('font-family', FONT_UI).attr('font-weight', 600)
      .attr('dominant-baseline', 'middle').text('Strategy');
    svg.append('text').attr('x', x(last.year) + 6).attr('y', y(last.benchmark))
      .attr('fill', COL.cap).attr('font-size', 11).attr('font-family', FONT_UI)
      .attr('dominant-baseline', 'middle').text('Benchmark');

    const tt = d3.select(host).append('div')
      .style('position', 'absolute').style('background', COL.cream)
      .style('border', '1px solid ' + COL.rule).style('padding', '8px 10px')
      .style('font-family', FONT_UI).style('font-size', '12px')
      .style('pointer-events', 'none').style('opacity', 0).style('z-index', 10);

    const bisect = d3.bisector(d => d.year).left;
    const hoverLine = svg.append('line')
      .attr('stroke', COL.ink).attr('stroke-width', 1).style('opacity', 0)
      .attr('y1', 0).attr('y2', h);

    svg.append('rect').attr('width', w).attr('height', h).attr('fill', 'transparent')
      .on('mousemove', function (event) {
        const mx = d3.pointer(event, this)[0];
        const xv = x.invert(mx);
        const i = bisect(data, xv, 1);
        const d0 = data[i - 1], d1 = data[i] || d0;
        const d = (xv - d0.year > d1.year - xv) ? d1 : d0;
        hoverLine.attr('x1', x(d.year)).attr('x2', x(d.year)).style('opacity', 1);
        tt.html(`<div style="color:${COL.cap};font-size:10px;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:4px;">${d.year}</div><div style="color:${COL.blue};font-family:${FONT_DATA};">Strategy: +${d.portfolio.toFixed(1)}%</div><div style="color:${COL.cap};font-family:${FONT_DATA};">Benchmark: +${d.benchmark.toFixed(1)}%</div>`)
          .style('left', (event.pageX + 12) + 'px').style('top', (event.pageY - 20) + 'px').style('opacity', 1);
      })
      .on('mouseleave', () => { hoverLine.style('opacity', 0); tt.style('opacity', 0); });

    host.style.position = 'relative';
  }

  function drawAllocationChart() {
    const host = document.getElementById('allocationChart');
    if (!host) return;
    host.innerHTML = '';

    const data = [
      { name: 'Stocks',       value: 50, color: COL.blue },
      { name: 'Bonds',        value: 30, color: COL.ink },
      { name: 'Cash',         value: 15, color: '#B3B3B3' },
      { name: 'Alternatives', value: 5,  color: COL.red }
    ];

    const margin = { top: 8, right: 60, bottom: 24, left: 100 };
    const fullWidth = host.clientWidth || 600;
    const fullHeight = 220;
    const w = fullWidth - margin.left - margin.right;
    const h = fullHeight - margin.top - margin.bottom;

    const svg = d3.select(host).append('svg')
      .attr('viewBox', `0 0 ${fullWidth} ${fullHeight}`)
      .attr('width', '100%').attr('height', fullHeight).style('display', 'block')
      .append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    const y = d3.scaleBand().domain(data.map(d => d.name)).range([0, h]).padding(0.35);
    const x = d3.scaleLinear().domain([0, 60]).range([0, w]);

    svg.append('g').attr('transform', `translate(0,${h})`)
      .call(d3.axisBottom(x).ticks(6).tickFormat(d => d + '%').tickSize(0))
      .call(g => g.select('.domain').remove())
      .selectAll('text').attr('font-family', FONT_UI).attr('font-size', 11).attr('fill', COL.cap);

    svg.append('g').call(d3.axisLeft(y).tickSize(0))
      .call(g => g.select('.domain').remove())
      .selectAll('text').attr('font-family', FONT_UI).attr('font-size', 13).attr('font-weight', 500).attr('fill', COL.ink);

    svg.selectAll('rect.bar').data(data).join('rect').attr('class', 'bar')
      .attr('x', 0).attr('y', d => y(d.name)).attr('width', d => x(d.value))
      .attr('height', y.bandwidth()).attr('fill', d => d.color);

    svg.selectAll('text.val').data(data).join('text').attr('class', 'val')
      .attr('x', d => x(d.value) + 8).attr('y', d => y(d.name) + y.bandwidth() / 2)
      .attr('dominant-baseline', 'middle').attr('font-family', FONT_UI)
      .attr('font-size', 12).attr('font-weight', 500).attr('fill', COL.ink)
      .text(d => d.value + '%');
  }

  function drawDriftGauge() {
    const host = document.getElementById('driftGauge');
    if (!host) return;
    host.innerHTML = '';

    const drift = 3.2, threshold = 5.0, max = 10.0;
    const fullWidth = host.clientWidth || 260;
    const fullHeight = 220;
    const cx = fullWidth / 2, cy = fullHeight * 0.65;
    const radius = Math.min(fullWidth, fullHeight * 1.6) * 0.36;

    const svg = d3.select(host).append('svg')
      .attr('viewBox', `0 0 ${fullWidth} ${fullHeight}`)
      .attr('width', '100%').attr('height', fullHeight).style('display', 'block');

    const startAngle = -Math.PI * 0.75, endAngle = Math.PI * 0.75;
    const totalArc = endAngle - startAngle;
    const arcGen = d3.arc().innerRadius(radius - 14).outerRadius(radius);

    svg.append('path').attr('d', arcGen({ startAngle, endAngle }))
      .attr('transform', `translate(${cx},${cy})`).attr('fill', COL.paper);
    svg.append('path').attr('d', arcGen({ startAngle: startAngle + (threshold / max) * totalArc, endAngle }))
      .attr('transform', `translate(${cx},${cy})`).attr('fill', '#FDECEA');
    svg.append('path').attr('d', arcGen({ startAngle, endAngle: startAngle + (drift / max) * totalArc }))
      .attr('transform', `translate(${cx},${cy})`).attr('fill', drift < threshold ? COL.blue : COL.red);

    const thresholdAngle = startAngle + (threshold / max) * totalArc;
    const tx1 = cx + Math.cos(thresholdAngle - Math.PI / 2) * (radius - 18);
    const ty1 = cy + Math.sin(thresholdAngle - Math.PI / 2) * (radius - 18);
    const tx2 = cx + Math.cos(thresholdAngle - Math.PI / 2) * (radius + 4);
    const ty2 = cy + Math.sin(thresholdAngle - Math.PI / 2) * (radius + 4);
    svg.append('line').attr('x1', tx1).attr('y1', ty1).attr('x2', tx2).attr('y2', ty2)
      .attr('stroke', COL.ink).attr('stroke-width', 2);
    svg.append('text').attr('x', tx2 + 2).attr('y', ty2 - 2).text(`Limit ${threshold}%`)
      .attr('font-size', 10).attr('font-family', FONT_UI).attr('fill', COL.cap);

    svg.append('text').attr('x', cx).attr('y', cy - 4).attr('text-anchor', 'middle')
      .attr('font-family', FONT_DATA).attr('font-size', 32).attr('font-weight', 500)
      .attr('fill', drift < threshold ? COL.blue : COL.red).text(drift.toFixed(1) + '%');
    svg.append('text').attr('x', cx).attr('y', cy + 18).attr('text-anchor', 'middle')
      .attr('font-family', FONT_UI).attr('font-size', 10).attr('font-weight', 600)
      .attr('fill', COL.cap).attr('letter-spacing', '0.1em').text('CURRENT DRIFT');
    svg.append('text').attr('x', cx - radius * 0.92).attr('y', cy + 14).attr('text-anchor', 'middle')
      .attr('font-family', FONT_UI).attr('font-size', 10).attr('fill', COL.cap).text('0%');
    svg.append('text').attr('x', cx + radius * 0.92).attr('y', cy + 14).attr('text-anchor', 'middle')
      .attr('font-family', FONT_UI).attr('font-size', 10).attr('fill', COL.cap).text(max + '%');
  }

  function drawDebtSparkline() {
    const host = document.getElementById('debtSparkline');
    if (!host) return;
    host.innerHTML = '';

    const data = [
      { month: 'Jan', score: 73 }, { month: 'Mar', score: 68 }, { month: 'May', score: 62 },
      { month: 'Jul', score: 55 }, { month: 'Sep', score: 48 }, { month: 'Nov', score: 41 }
    ];

    const margin = { top: 16, right: 40, bottom: 24, left: 32 };
    const fullWidth = host.clientWidth || 600;
    const fullHeight = 180;
    const w = fullWidth - margin.left - margin.right;
    const h = fullHeight - margin.top - margin.bottom;

    const svg = d3.select(host).append('svg')
      .attr('viewBox', `0 0 ${fullWidth} ${fullHeight}`)
      .attr('width', '100%').attr('height', fullHeight).style('display', 'block')
      .append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    const x = d3.scalePoint().domain(data.map(d => d.month)).range([0, w]).padding(0.2);
    const y = d3.scaleLinear().domain([0, 100]).range([h, 0]);

    svg.append('g').call(d3.axisLeft(y).ticks(4).tickSize(-w).tickFormat(''))
      .call(g => g.select('.domain').remove())
      .selectAll('line').attr('stroke', COL.rule);
    svg.append('g').attr('transform', `translate(0,${h})`)
      .call(d3.axisBottom(x).tickSize(0))
      .call(g => g.select('.domain').remove())
      .selectAll('text').attr('font-family', FONT_UI).attr('font-size', 10).attr('fill', COL.cap).attr('dy', '1em');
    svg.append('g').call(d3.axisLeft(y).ticks(4).tickSize(0))
      .call(g => g.select('.domain').remove())
      .selectAll('text').attr('font-family', FONT_UI).attr('font-size', 10).attr('fill', COL.cap);

    svg.append('path').datum(data)
      .attr('fill', COL.blue).attr('fill-opacity', 0.08)
      .attr('d', d3.area().x(d => x(d.month)).y0(h).y1(d => y(d.score)).curve(d3.curveMonotoneX));
    svg.append('path').datum(data)
      .attr('fill', 'none').attr('stroke', COL.blue).attr('stroke-width', 2)
      .attr('d', d3.line().x(d => x(d.month)).y(d => y(d.score)).curve(d3.curveMonotoneX));

    svg.selectAll('circle.dot').data(data).join('circle').attr('class', 'dot')
      .attr('cx', d => x(d.month)).attr('cy', d => y(d.score)).attr('r', 3).attr('fill', COL.blue);
    svg.selectAll('text.lbl').data(data).join('text').attr('class', 'lbl')
      .attr('x', d => x(d.month)).attr('y', d => y(d.score) - 9)
      .attr('text-anchor', 'middle').attr('font-family', FONT_DATA)
      .attr('font-size', 10).attr('font-weight', 500).attr('fill', COL.blue).text(d => d.score);
  }

  function init() {
    drawPerformanceChart();
    drawAllocationChart();
    drawDriftGauge();
    drawDebtSparkline();
  }

  let resizeTimer;
  window.addEventListener('resize', () => { clearTimeout(resizeTimer); resizeTimer = setTimeout(init, 200); });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
