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
}

document.addEventListener('DOMContentLoaded', loadData);

function processCommits() {
    commits = d3.groups(data, (d) => d.commit).map(([commit, lines]) => {
        let first = lines[0];
        let { author, date, time, timezone, datetime } = first;
        
        let ret = {
            id: commit,
            url: 'https://github.com/YOUR_REPO_HERE/commit/' + commit,
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
    // Process commits first
    processCommits();

    // Create the dl element
    const dl = d3.select('#stats').append('dl').attr('class', 'stats');

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

    // 4. Maximum Depth
    const maxDepth = d3.max(data, d => d.depth);
    dl.append('dt').text('Max depth');
    dl.append('dd').text(maxDepth);

    // 5. Average File Length
    const fileLengths = d3.rollups(data, v => d3.max(v, v => v.line), d => d.file);
    const avgFileLength = d3.mean(fileLengths, d => d[1]);
    dl.append('dt').text('Avg file length');
    dl.append('dd').text(avgFileLength.toFixed(2));

    // 6. Most active time of day
    const workByPeriod = d3.rollups(
        data,
        (v) => v.length,
        (d) => new Date(d.datetime).toLocaleString('en', { dayPeriod: 'short' })
    );
    const maxPeriod = d3.greatest(workByPeriod, (d) => d[1])?.[0];
    dl.append('dt').text('Most active time');
    dl.append('dd').text(maxPeriod);
}