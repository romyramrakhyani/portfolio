import { fetchJSON, renderProjects, fetchGitHubData } from './global.js';

// --- PART 1: RENDER PROJECTS ---
try {
    const projects = await fetchJSON('./lib/projects.json');
    const projectsContainer = document.querySelector('.projects');
    
    if (projectsContainer && projects) {
        // Only show the first 3
        const latestProjects = projects.slice(0, 3);
        renderProjects(latestProjects, projectsContainer, 'h2');
    }
} catch (error) {
    console.error('Error loading projects:', error);
}

// --- PART 2: RENDER GITHUB STATS ---
try {
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
} catch (error) {
    console.error('Error loading GitHub stats:', error);
}