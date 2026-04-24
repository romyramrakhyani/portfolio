export async function fetchJSON(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Failed to fetch: ${response.statusText}`);
        return await response.json();
    } catch (error) {
        console.error('Error fetching JSON:', error);
    }
}

export function renderProjects(projects, containerElement, headingLevel = 'h2') {
    containerElement.innerHTML = '';
    
    // Detect if we are in the projects subfolder
    const isProjectsPage = window.location.pathname.includes('/projects/');

    projects.forEach(project => {
        let imagePath = project.image;
        
        // Correct pathing for subfolders
        if (isProjectsPage && !imagePath.startsWith('http')) {
            imagePath = '../' + imagePath;
        }

        const article = document.createElement('article');
        // We wrap the text in 'project-info' to keep it separate from the image
        article.innerHTML = `
            <${headingLevel}>${project.title}</${headingLevel}>
            <img src="${imagePath}" alt="${project.title}">
            <div class="project-info">
                <p>${project.description}</p>
                <p class="project-year">Year: ${project.year}</p>
            </div>
        `;
        containerElement.appendChild(article);
    });
}

export async function fetchGitHubData(username) {
    return fetchJSON(`https://api.github.com/users/${username}`);
}