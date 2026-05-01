import { fetchJSON, renderProjects } from '../global.js';
import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';

// 1. Load Projects Data
const projects = await fetchJSON('../lib/projects.json');
const projectsContainer = document.querySelector('.projects');
const projectsTitle = document.querySelector('.projects-title');

// Initial render: show the list and the total count
renderProjects(projects, projectsContainer, 'h2');
if (projectsTitle) {
    projectsTitle.textContent = `${projects.length} Projects`;
}

// --- REUSABLE PIE CHART FUNCTION ---
function renderPieChart(projectsGiven) {
    // Step 1: Re-calculate rolled data (Projects per Year)
    let newRolledData = d3.rollups(
        projectsGiven,
        (v) => v.length,
        (d) => d.year
    );

    // Step 2: Convert to { value, label } format
    let newData = newRolledData.map(([year, count]) => {
        return { value: count, label: year };
    });

    // Step 3: Setup Containers
    let container = d3.select('#projects-pie');
    
    // Clear the SVG and the Legend
    container.select('svg').remove(); 
    let svg = container.append('svg')
                       .attr('viewBox', '-50 -50 100 100');

    let legend = d3.select('.legend');
    legend.selectAll('*').remove();

    // Step 4: Setup Generators
    let arcGenerator = d3.arc().innerRadius(0).outerRadius(50);
    let sliceGenerator = d3.pie().value((d) => d.value);
    let colors = d3.scaleOrdinal(d3.schemeTableau10);

    let arcData = sliceGenerator(newData);

    // Step 5: Draw Slices
    arcData.forEach((d, i) => {
        svg.append('path')
           .attr('d', arcGenerator(d))
           .attr('fill', colors(i))
           .attr('class', 'wedge'); 
    });

    // Step 6: Draw Legend
    newData.forEach((d, idx) => {
        legend.append('li')
              .attr('style', `--color:${colors(idx)}`)
              .attr('class', 'legend-item')
              .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`);
    });
}

// Initial call to display the chart on page load
renderPieChart(projects);

// --- SEARCH FUNCTIONALITY ---
let searchInput = document.querySelector('.searchBar');

searchInput.addEventListener('input', (event) => {
    let query = event.target.value.toLowerCase();

    // Filter projects based on query across all metadata
    let filteredProjects = projects.filter((project) => {
        let values = Object.values(project).join('\n').toLowerCase();
        return values.includes(query);
    });

    // Update the title with the new count
    if (projectsTitle) {
        projectsTitle.textContent = `${filteredProjects.length} Projects`;
    }

    // Re-render project list
    renderProjects(filteredProjects, projectsContainer, 'h2');
    
    // Re-render pie chart with the filtered data
    renderPieChart(filteredProjects);
});