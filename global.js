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
    
    // Check if we are currently inside the projects folder
    const isProjectsPage = window.location.pathname.includes('/projects/');

    projects.forEach(project => {
        let imagePath = project.image;
        
        // If we're on the projects page, we need to go up one level to find the images folder
        if (isProjectsPage && !imagePath.startsWith('http')) {
            imagePath = '../' + imagePath;
        }

        const article = document.createElement('article');
        article.innerHTML = `
            <${headingLevel}>${project.title}</${headingLevel}>
            <img src="${imagePath}" alt="${project.title}">
            <div class="project-info">
                <p>${project.description}</p>
                <p class="project-year"><em>Year: ${project.year}</em></p>
            </div>
        `;
        containerElement.appendChild(article);
    });
}

export async function fetchGitHubData(username) {
    return fetchJSON(`https://api.github.com/users/${username}`);
}

export async function fetchGitHubData(username) {
    return fetchJSON(`https://api.github.com/users/${username}`);
}