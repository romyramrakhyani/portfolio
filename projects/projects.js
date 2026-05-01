import { fetchJSON, renderProjects } from '../global.js';
import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';

// 1. Load Projects
const projects = await fetchJSON('../lib/projects.json');
const projectsContainer = document.querySelector('.projects');

// Initial render
renderProjects(projects, projectsContainer, 'h2');

// --- STEP 3 & 5: REUSABLE RENDER FUNCTION ---
// We create this so we can re-draw the pie chart whenever data is filtered
function renderPieChart(projectsGiven) {
    // Re-calculate rolled data based on the projects we are CURRENTLY seeing
    let newRolledData = d3.rollups(
        projectsGiven,
        (v) => v.length,
        (d) => d.year
    );

    let newData = newRolledData.map(([year, count]) => {
        return { value: count, label: year };
    });

    // Clear existing chart and legend before re-drawing
    let svg = d3.select('#projects-pie').select('svg');
    svg.selectAll('*').remove();
    let legend = d3.select('.legend');
    legend.selectAll('*').remove();

    // Define generators
    let arcGenerator = d3.arc().innerRadius(0).outerRadius(50);
    let sliceGenerator = d3.pie().value((d) => d.value);
    let colors = d3.scaleOrdinal(d3.schemeTableau10);

    let arcData = sliceGenerator(newData);

    // Draw Slices
    arcData.forEach((d, i) => {
        svg.append('path')
           .attr('d', arcGenerator(d))
           .attr('fill', colors(i))
           // STEP 5.1 & 5.2: Adding interactivity
           .on('click', () => {
               // This is where you'd add filtering logic by year
               console.log("Clicked year:", d.data.label);
           });
    });

    // Draw Legend
    newData.forEach((d, idx) => {
        legend.append('li')
              .attr('style', `--color:${colors(idx)}`)
              .attr('class', 'legend-item')
              .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`);
    });
}

// Create the initial SVG container once
d3.select('#projects-pie')
  .append('svg')
  .attr('viewBox', '-50 -50 100 100');

// Initial chart render
renderPieChart(projects);

// --- STEP 4: SEARCH FUNCTIONALITY ---
let searchInput = document.querySelector('.searchBar');

searchInput.addEventListener('input', (event) => {
    let query = event.target.value.toLowerCase();

    // Filter projects based on the query across all metadata
    let filteredProjects = projects.filter((project) => {
        let values = Object.values(project).join('\n').toLowerCase();
        return values.includes(query);
    });

    // Re-render both the list and the pie chart to stay in sync
    renderProjects(filteredProjects, projectsContainer, 'h2');
    renderPieChart(filteredProjects);
});