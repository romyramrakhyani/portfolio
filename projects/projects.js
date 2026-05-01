import { fetchJSON, renderProjects } from '../global.js';
import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';

// 1. Load Projects Data
const projects = await fetchJSON('../lib/projects.json');
const projectsContainer = document.querySelector('.projects');

// Initial render of the project list
renderProjects(projects, projectsContainer, 'h2');

// --- REUSABLE PIE CHART FUNCTION (Steps 3.1 & 4.4) ---
function renderPieChart(projectsGiven) {
    // Re-calculate rolled data based on the projects we are CURRENTLY seeing
    let newRolledData = d3.rollups(
        projectsGiven,
        (v) => v.length,
        (d) => d.year
    );

    // Convert to the { value, label } format D3 expects
    let newData = newRolledData.map(([year, count]) => {
        return { value: count, label: year };
    });

    // Clear existing SVG and Legend content before re-drawing
    let svg = d3.select('#projects-pie').select('svg');
    if (svg.empty()) {
        // Create SVG only if it doesn't exist yet
        svg = d3.select('#projects-pie')
                .append('svg')
                .attr('viewBox', '-50 -50 100 100');
    } else {
        svg.selectAll('*').remove();
    }

    let legend = d3.select('.legend');
    legend.selectAll('*').remove();

    // Setup Generators
    let arcGenerator = d3.arc().innerRadius(0).outerRadius(50);
    let sliceGenerator = d3.pie().value((d) => d.value);
    let colors = d3.scaleOrdinal(d3.schemeTableau10);

    let arcData = sliceGenerator(newData);

    // Draw Slices
    arcData.forEach((d, i) => {
        svg.append('path')
           .attr('d', arcGenerator(d))
           .attr('fill', colors(i))
           .attr('class', 'wedge'); // Useful for Step 5 styling
    });

    // Draw Legend
    newData.forEach((d, idx) => {
        legend.append('li')
              .attr('style', `--color:${colors(idx)}`)
              .attr('class', 'legend-item')
              .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`);
    });
}

// --- INITIAL CALL ---
renderPieChart(projects);

// --- SEARCH FUNCTIONALITY (Step 4) ---
let searchInput = document.querySelector('.searchBar');

searchInput.addEventListener('input', (event) => {
    let query = event.target.value.toLowerCase();

    // Step 4.3: Filter projects across all metadata (case-insensitive)
    let filteredProjects = projects.filter((project) => {
        let values = Object.values(project).join('\n').toLowerCase();
        return values.includes(query);
    });

    // Step 4.4: Synchronize both visualizations
    renderProjects(filteredProjects, projectsContainer, 'h2');
    renderPieChart(filteredProjects);
});