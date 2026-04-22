import { fetchJSON, renderProjects } from '../global.js';

// 1. Fetch the data
const projects = await fetchJSON('../lib/projects.json');

// 2. Select the container
const projectsContainer = document.querySelector('.projects');

// 3. Render them!
if (projects && projectsContainer) {
    renderProjects(projects, projectsContainer, 'h2');
    
    // Step 1.6: Update the project count automatically
    const projectsTitle = document.querySelector('.projects-title');
    if (projectsTitle) {
        projectsTitle.textContent = `${projects.length} Projects`;
    }
}
// 1. Select the heading element
const projectsTitle = document.querySelector('.projects-title');

// 2. Check if the element and the projects array exist
if (projectsTitle && projects) {
    // 3. Update the text to show the number of projects dynamically
    projectsTitle.textContent = `${projects.length} Projects`;
}