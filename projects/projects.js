import { fetchJSON, renderProjects } from '../global.js';
import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';

const projects = await fetchJSON('../lib/projects.json');
const projectsContainer = document.querySelector('.projects');
const projectsTitle = document.querySelector('.projects-title');

// State variables
let selectedIndex = -1;
let query = '';

function renderPieChart(projectsGiven) {
    let newRolledData = d3.rollups(
        projectsGiven,
        (v) => v.length,
        (d) => d.year
    );

    let newData = newRolledData.map(([year, count]) => {
        return { value: count, label: year };
    });

    let container = d3.select('#projects-pie');
    container.select('svg').remove(); 
    let svg = container.append('svg').attr('viewBox', '-50 -50 100 100');

    let legend = d3.select('.legend');
    legend.selectAll('*').remove();

    let arcGenerator = d3.arc().innerRadius(0).outerRadius(50);
    let sliceGenerator = d3.pie().value((d) => d.value);
    let colors = d3.scaleOrdinal(d3.schemeTableau10);
    let arcData = sliceGenerator(newData);

    // Draw Slices
    arcData.forEach((d, i) => {
        svg.append('path')
           .attr('d', arcGenerator(d))
           .attr('fill', colors(i))
           // Handle Selection Class
           .attr('class', i === selectedIndex ? 'selected' : '')
           .on('click', () => {
                selectedIndex = selectedIndex === i ? -1 : i;
                
                // EXTRA CREDIT FIX: Apply both filters (Search + Year)
                updateFilteredDisplay();
           });
    });

    // Draw Legend
    newData.forEach((d, idx) => {
        legend.append('li')
              .attr('style', `--color:${colors(idx)}`)
              .attr('class', idx === selectedIndex ? 'legend-item selected' : 'legend-item')
              .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`);
    });
}

// THE MASTER FILTER FUNCTION (Fixes Step 5.4 Bug)
function updateFilteredDisplay() {
    // 1. Filter by Search Query
    let filteredProjects = projects.filter((project) => {
        let values = Object.values(project).join('\n').toLowerCase();
        return values.includes(query.toLowerCase());
    });

    // 2. Filter by Selected Year (if any)
    if (selectedIndex !== -1) {
        // Re-calculate the years available in the currently searched set
        let newRolledData = d3.rollups(filteredProjects, v => v.length, d => d.year);
        let newData = newRolledData.map(([year, count]) => ({ value: count, label: year }));
        let selectedYear = newData[selectedIndex].label;

        filteredProjects = filteredProjects.filter(p => p.year === selectedYear);
    }

    // 3. Render everything
    renderProjects(filteredProjects, projectsContainer, 'h2');
    if (projectsTitle) projectsTitle.textContent = `${filteredProjects.length} Projects`;
    
    // Update the pie chart (keeping wedges highlighted)
    renderPieChart(filteredProjects);
}

// Initial Call
updateFilteredDisplay();

// Search Listener
let searchInput = document.querySelector('.searchBar');
searchInput.addEventListener('input', (event) => {
    query = event.target.value;
    updateFilteredDisplay();
});