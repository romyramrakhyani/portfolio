import { fetchJSON, renderProjects } from '../global.js';
import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';

// 1. Load Projects
const projects = await fetchJSON('../lib/projects.json');
const projectsContainer = document.querySelector('.projects');
renderProjects(projects, projectsContainer, 'h2');

// 2. Prepare Data for Pie Chart
// For Step 1.5, we'll use a variety of numbers
let data = [1, 2, 3, 4, 5, 5];

// 3. Setup D3 Generators
let arcGenerator = d3.arc().innerRadius(0).outerRadius(50);
let sliceGenerator = d3.pie();
let colors = d3.scaleOrdinal(d3.schemeTableau10);

// 4. Generate Arc Data
let arcData = sliceGenerator(data);

// 5. Select the SVG (we'll create it first)
let svg = d3.select('#projects-pie')
            .append('svg')
            .attr('viewBox', '-50 -50 100 100');

// 6. Append Paths (The Slices)
arcData.forEach((d, i) => {
    svg.append('path')
       .attr('d', arcGenerator(d))
       .attr('fill', colors(i));
});