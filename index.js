import { fetchJSON, renderProjects, fetchGitHubData } from './global.js';

// 1. Render the 3 latest projects
const projects = await fetchJSON('./lib/projects.json');
const projectsContainer = document.querySelector('.projects');

if (projectsContainer && projects) {
    const latestProjects = projects.slice(0, 3);
    renderProjects(latestProjects, projectsContainer, 'h2');
}

// 2. Render GitHub Stats
const githubData = await fetchGitHubData('romyramrakhyani');
const profileStats = document.querySelector('#profile-stats');

if (profileStats && githubData) {
    profileStats.innerHTML = `
        <dl class="stats-grid">
            <dt>Public Repos</dt><dd>${githubData.public_repos}</dd>
            <dt>Public Gists</dt><dd>${githubData.public_gists}</dd>
            <dt>Followers</dt><dd>${githubData.followers}</dd>
            <dt>Following</dt><dd>${githubData.following}</dd>
        </dl>
    `;
}