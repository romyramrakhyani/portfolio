import { fetchJSON, renderProjects } from '../global.js';
import * as d3 from 'https://cdn.jsdelivr.net/npm/d3@7.9.0/+esm';

// 1. Load Projects
const projects = await fetchJSON('../lib/projects.json');
const projectsContainer = document.querySelector('.projects');
renderProjects(projects, projectsContainer, 'h2');

// 2. Step 2.1: Updated Data with Labels
let data = [
  { value: 1, label: 'apples' },
  { value: 2, label: 'oranges' },
  { value: 3, label: 'mangos' },
  { value: 4, label: 'pears' },
  { value: 5, label: 'limes' },
  { value: 5, label: 'cherries' },
];

// 3. Setup Generators
// Tell the slice generator to use the 'value' property of our objects
let sliceGenerator = d3.pie().value((d) => d.value);
let arcGenerator = d3.arc().innerRadius(0).outerRadius(50);
let colors = d3.scaleOrdinal(d3.schemeTableau10);

let arcData = sliceGenerator(data);

// 4. Render Pie Chart
let svg = d3.select('#projects-pie')
            .append('svg')
            .attr('viewBox', '-50 -50 100 100');

arcData.forEach((d, i) => {
    svg.append('path')
       .attr('d', arcGenerator(d))
       .attr('fill', colors(i));
});

// 5. Step 2.2: Create the Legend
let legend = d3.select('.legend');
data.forEach((d, idx) => {
    legend.append('li')
          .attr('style', `--color:${colors(idx)}`)
          .attr('class', 'legend-item') // Added a class for easier styling
          .html(`<span class="swatch"></span> ${d.label} <em>(${d.value})</em>`);
});