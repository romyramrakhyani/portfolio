import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';

let data = [];
let commits = [];

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

// Initial call to start the sequence
loadData();

function processCommits() {
    commits = d3.groups(data, (d) => d.commit).map(([commit, lines]) => {
        let first = lines[0];
        let { author, date, time, timezone, datetime } = first;
        
        let ret = {
            id: commit,
            url: 'https://github.com/romyramrakhyani/portfolio/commit/' + commit,
            author,
            date,
            time,
            timezone,
            datetime,
            hourFrac: datetime.getHours() + datetime.getMinutes() / 60,
            totalLines: lines.length,
        };

        // Hide lines from console output but keep them accessible
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
    container.selectAll('*').remove(); // Clear previous content

    const dl = container.append('dl').attr('class', 'stats');

    // 1. Total LOC
    dl.append('dt').html('Total <abbr title="Lines of code">LOC</abbr>');
    dl.append('dd').text(data.length);

    // 2. Total Commits
    dl.append('dt').text('Total commits');
    dl.append('dd').text(commits.length);

    // 3. Number of files
    const numFiles = d3.group(data, d => d.file).size;
    dl.append('dt').text('Number of files');
    dl.append('dd').text(numFiles);

    // 4. Max depth
    const maxDepth = d3.max(data, d => d.depth);
    dl.append('dt').text('Max depth');
    dl.append('dd').text(maxDepth);

    // 5. Avg File Length
    const fileLengths = d3.rollups(data, v => d3.max(v, v => v.line), d => d.file);
    const avgFileLength = d3.mean(fileLengths, d => d[1]);
    dl.append('dt').text('Avg file length');
    dl.append('dd').text(avgFileLength.toFixed(2));

    // 6. Most active time
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

    // Scales
    const xScale = d3
        .scaleTime()
        .domain(d3.extent(commits, (d) => d.datetime))
        .range([usableArea.left, usableArea.right])
        .nice();

    const yScale = d3.scaleLinear()
        .domain([0, 24])
        .range([usableArea.bottom, usableArea.top]);

    // Gridlines (Add BEFORE dots so they are behind)
    svg.append('g')
        .attr('class', 'gridlines')
        .attr('transform', `translate(${usableArea.left}, 0)`)
        .call(d3.axisLeft(yScale).tickFormat('').tickSize(-usableArea.width));

    // Draw Dots
    const dots = svg.append('g').attr('class', 'dots');

    dots.selectAll('circle')
        .data(commits)
        .join('circle')
        .attr('cx', (d) => xScale(d.datetime))
        .attr('cy', (d) => yScale(d.hourFrac))
        .attr('r', 5)
        .attr('fill', 'steelblue')
        .style('fill-opacity', 0.7);

    // Axes
    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3.axisLeft(yScale)
        .tickFormat((d) => String(d % 24).padStart(2, '0') + ':00');

    svg.append('g')
        .attr('transform', `translate(0, ${usableArea.bottom})`)
        .call(xAxis);

    svg.append('g')
        .attr('transform', `translate(${usableArea.left}, 0)`)
        .call(yAxis);
    
    // 1. Create a scale for the radius
    // This maps the number of lines (0 to max) to a circle radius (2px to 30px)
    const [minLines, maxLines] = d3.extent(commits, (d) => d.totalLines);
    const rScale = d3.scaleSqrt() // Use scaleSqrt because area is perceived better than radius
        .domain([minLines, maxLines])
        .range([2, 30]);

    // 2. Update your dots to use the scale
    dots.selectAll('circle')
        .data(commits)
        .join('circle')
        .attr('cx', (d) => xScale(d.datetime))
        .attr('cy', (d) => yScale(d.hourFrac))
        .attr('r', (d) => rScale(d.totalLines)) // Use the new scale here!
        .attr('fill', 'steelblue')
        .style('fill-opacity', 0.7);
    // Step 3.1 & 3.4: Function to update content
    function renderTooltipContent(commit) {
        const link = document.getElementById('commit-link');
        const date = document.getElementById('commit-date');
        const time = document.getElementById('commit-time');
        const author = document.getElementById('commit-author');
        const lines = document.getElementById('commit-lines');

    if (Object.keys(commit).length === 0) return;

    link.href = commit.url;
    link.textContent = commit.id;
    date.textContent = commit.datetime?.toLocaleString('en', { dateStyle: 'full' });
    time.textContent = commit.time;
    author.textContent = commit.author;
    lines.textContent = commit.totalLines;
    }

    function updateTooltipVisibility(isVisible) {
        const tooltip = document.getElementById('commit-tooltip');
        tooltip.hidden = !isVisible;
    }

    function updateTooltipPosition(event) {
        const tooltip = document.getElementById('commit-tooltip');
        // Add a small offset (10px) so the tooltip isn't directly under the cursor
        tooltip.style.left = `${event.clientX + 10}px`;
        tooltip.style.top = `${event.clientY + 10}px`;
    }

    // INSIDE your renderScatterPlot function, update the dots selection:
    dots.selectAll('circle')
        .data(commits)
        .join('circle')
        .attr('cx', (d) => xScale(d.datetime))
        .attr('cy', (d) => yScale(d.hourFrac))
        .attr('r', 5)
        .attr('fill', 'steelblue')
    .on('mouseenter', (event, commit) => {
        d3.select(event.currentTarget).style('fill-opacity', 1); // Highlight dot
        renderTooltipContent(commit);
        updateTooltipVisibility(true);
        updateTooltipPosition(event);
    })
    .on('mousemove', (event) => {
     updateTooltipPosition(event); // Smoothly follow mouse
    })
    .on('mouseleave', (event) => {
        d3.select(event.currentTarget).style('fill-opacity', 0.7); // Restore opacity
        updateTooltipVisibility(false);
    });
}