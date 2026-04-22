// 1. Update the import at the very top
import { fetchJSON, renderProjects, fetchGitHubData } from './global.js';
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
const githubData = await fetchGitHubData('romyramrakhyani'); 

const profileStats = document.querySelector('#profile-stats');

if (profileStats && githubData) {
    profileStats.innerHTML = `
          <dl>
            <dt>Public Repos:</dt><dd>${githubData.public_repos}</dd>
            <dt>Public Gists:</dt><dd>${githubData.public_gists}</dd>
            <dt>Followers:</dt><dd>${githubData.followers}</dd>
            <dt>Following:</dt><dd>${githubData.following}</dd>
          </dl>
      `;
}