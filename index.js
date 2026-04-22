import { fetchJSON, renderProjects } from './global.js';

// 1. Fetch the data from the lib folder
const projects = await fetchJSON('./lib/projects.json');

// 2. Slice the array to get only the first 3 projects
const latestProjects = projects.slice(0, 3);

// 3. Select the container on the home page
const projectsContainer = document.querySelector('.projects');

// 4. Render the latest projects
if (projectsContainer && latestProjects) {
    renderProjects(latestProjects, projectsContainer, 'h2');
}