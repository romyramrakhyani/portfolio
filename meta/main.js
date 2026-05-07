import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';

let data = [];
let commits = [];
// Declare scales globally so they are accessible to the brushed function
let xScale, yScale; 

async function loadData() {
  data = await d3.csv('loc.csv', (row) => ({
    ...row,
    line: Number(row.line),
    depth: Number(row.depth),
    length: Number(row.length),
    date: new Date(row.date + 'T00:00' + row.timezone),
    datetime: new Date(row.datetime),
  }));

  processCommits();
  displayStats();
  renderScatterPlot();
}

loadData();

function processCommits() {
  commits = d3.groups(data, (d) => d.commit).map(([commit, lines]) => {
    let first = lines[0];
    let { author, date, time, timezone, datetime } = first;
    let ret = {
      id: commit,
      url: 'https://github.com/romyramrakhyani/portfolio/commit/' + commit,
      author, date, time, timezone, datetime,
      hourFrac: datetime.getHours() + datetime.getMinutes() / 60,
      totalLines: lines.length,
    };

    Object.defineProperty(ret, 'lines', {
      value: lines,
      configurable: true,
      writable: true,
      enumerable: false,
    });

    return ret;
  });
}

function displayStats() {
  const container = d3.select('#stats');
  container.selectAll('*').remove();

  const dl = container.append('dl').attr('class', 'stats');

  dl.append('dt').html('Total <abbr title="Lines of code">LOC</abbr>');
  dl.append('dd').text(data.length);

  dl.append('dt').text('Total commits');
  dl.append('dd').text(commits.length);

  const numFiles = d3.group(data, (d) => d.file).size;
  dl.append('dt').text('Number of files');
  dl.append('dd').text(numFiles);

  const maxDepth = d3.max(data, (d) => d.depth);
  dl.append('dt').text('Max depth');
  dl.append('dd').text(maxDepth);

  const fileLengths = d3.rollups(data, (v) => d3.max(v, (v) => v.line), (d) => d.file);
  const avgFileLength = d3.mean(fileLengths, (d) => d[1]);
  dl.append('dt').text('Avg file length');
  dl.append('dd').text(avgFileLength.toFixed(2));

  const workByPeriod = d3.rollups(
    data,
    (v) => v.length,
    (d) => new Date(d.datetime).toLocaleString('en', { dayPeriod: 'short' })
  );
  const maxPeriod = d3.greatest(workByPeriod, (d) => d[1])?.[0];
  dl.append('dt').text('Most active time');
  dl.append('dd').text(maxPeriod);
}

function renderScatterPlot() {
  const width = 1000;
  const height = 600;

  d3.select('#chart').selectAll('*').remove();

  const svg = d3
    .select('#chart')
    .append('svg')
    .attr('viewBox', `0 0 ${width} ${height}`)
    .style('overflow', 'visible');

  const margin = { top: 10, right: 10, bottom: 30, left: 50 };

  const usableArea = {
    top: margin.top,
    right: width - margin.right,
    bottom: height - margin.bottom,
    left: margin.left,
    width: width - margin.left - margin.right,
    height: height - margin.top - margin.bottom,
  };

  // Initialize Global Scales
  xScale = d3.scaleTime()
    .domain(d3.extent(commits, (d) => d.datetime))
    .range([usableArea.left, usableArea.right])
    .nice();

  yScale = d3.scaleLinear()
    .domain([0, 24])
    .range([usableArea.bottom, usableArea.top]);

  const [minLines, maxLines] = d3.extent(commits, (d) => d.totalLines);
  const rScale = d3.scaleSqrt()
    .domain([minLines, maxLines])
    .range([2, 30]);

  // Draw gridlines
  svg.append('g')
    .attr('class', 'gridlines')
    .attr('transform', `translate(${usableArea.left}, 0)`)
    .call(d3.axisLeft(yScale).tickFormat('').tickSize(-usableArea.width));

  // Step 5.1 & 5.2: Initialize Brush
  const brush = d3.brush().on('start brush end', brushed);
  svg.call(brush);

  // Step 5.2: Raise dots so tooltips stay hoverable above the brush overlay
  svg.selectAll('.dots, .overlay ~ *').raise();

  const sortedCommits = d3.sort(commits, (d) => -d.totalLines);
  const dots = svg.append('g').attr('class', 'dots');

  dots.selectAll('circle')
    .data(sortedCommits)
    .join('circle')
    .attr('cx', (d) => xScale(d.datetime))
    .attr('cy', (d) => yScale(d.hourFrac))
    .attr('r', (d) => rScale(d.totalLines))
    .attr('fill', 'steelblue')
    .style('fill-opacity', 0.7)
    .on('mouseenter', function (event, commit) {
      d3.select(this).style('fill-opacity', 1);
      updateTooltipContent(commit);
      updateTooltipVisibility(true);
      updateTooltipPosition(event);
    })
    .on('mousemove', (event) => {
      updateTooltipPosition(event);
    })
    .on('mouseleave', function () {
      d3.select(this).style('fill-opacity', 0.7);
      updateTooltipVisibility(false);
    });

  const xAxis = d3.axisBottom(xScale);
  const yAxis = d3.axisLeft(yScale)
    .tickFormat((d) => String(d % 24).padStart(2, '0') + ':00');

  svg.append('g')
    .attr('transform', `translate(0, ${usableArea.bottom})`)
    .call(xAxis);

  svg.append('g')
    .attr('transform', `translate(${usableArea.left}, 0)`)
    .call(yAxis);
}

// Step 5.4: Brushing Logic
function brushed(event) {
  const selection = event.selection;
  
  // Toggle 'selected' class on circles
  d3.selectAll('circle').classed('selected', (d) => isCommitSelected(selection, d));
  
  // Update UI components
  renderSelectionCount(selection);
  renderLanguageBreakdown(selection);
}

function isCommitSelected(selection, commit) {
  if (!selection) return false;

  const [[x0, y0], [x1, y1]] = selection;
  const x = xScale(commit.datetime);
  const y = yScale(commit.hourFrac);

  return x >= x0 && x <= x1 && y >= y0 && y <= y1;
}

// Step 5.5: Selection Count UI
function renderSelectionCount(selection) {
  const selectedCommits = selection
    ? commits.filter((d) => isCommitSelected(selection, d))
    : [];

  const countElement = document.getElementById('selection-count');
  countElement.textContent = `${selectedCommits.length || 'No'} commits selected`;

  return selectedCommits;
}

// Step 5.6: Language Breakdown UI
function renderLanguageBreakdown(selection) {
  const selectedCommits = selection
    ? commits.filter((d) => isCommitSelected(selection, d))
    : [];
  const container = document.getElementById('language-breakdown');

  if (selectedCommits.length === 0) {
    container.innerHTML = '';
    return;
  }

  const lines = selectedCommits.flatMap((d) => d.lines);
  const breakdown = d3.rollup(lines, (v) => v.length, (d) => d.type);

  container.innerHTML = '';
  for (const [language, count] of breakdown) {
    const proportion = count / lines.length;
    const formatted = d3.format('.1~%')(proportion);

    container.innerHTML += `
            <div class="stat-item">
                <dt>${language}</dt>
                <dd>${count} lines (${formatted})</dd>
            </div>
        `;
  }
}

// Tooltip Helpers
function updateTooltipContent(commit) {
  const link = document.getElementById('commit-link');
  const date = document.getElementById('commit-date');
  const time = document.getElementById('commit-time');
  const author = document.getElementById('commit-author');
  const lines = document.getElementById('commit-lines');

  if (!commit || Object.keys(commit).length === 0) return;

  link.href = commit.url;
  link.textContent = commit.id;
  date.textContent = commit.datetime?.toLocaleString('en', { dateStyle: 'full' });
  time.textContent = commit.time;
  author.textContent = commit.author;
  lines.textContent = commit.totalLines;
}

function updateTooltipVisibility(isVisible) {
  const tooltip = document.getElementById('commit-tooltip');
  if (tooltip) tooltip.hidden = !isVisible;
}

function updateTooltipPosition(event) {
  const tooltip = document.getElementById('commit-tooltip');
  if (tooltip) {
    tooltip.style.left = `${event.clientX + 10}px`;
    tooltip.style.top = `${event.clientY + 10}px`;
  }
}