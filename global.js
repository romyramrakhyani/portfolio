// --- AUTOMATIC NAVIGATION ---
let pages = [
    { url: '', title: 'Home' },
    { url: 'projects/', title: 'Projects' },
    { url: 'contact/', title: 'Contact' },
    { url: 'resume/', title: 'Resume' },
    { url: 'https://github.com/romyramrakhyani', title: 'GitHub' },
];

// 1. Create the <nav> and <ul> elements
let nav = document.createElement('nav');
document.body.prepend(nav);
let ul = document.createElement('ul');
nav.append(ul);

// 2. Loop through pages and create links
for (let p of pages) {
    let url = p.url;
    let title = p.title;

    // Adjust URL for subpages (unless it's an external link)
    const ARE_WE_HOME = document.documentElement.classList.contains('home');
    if (!ARE_WE_HOME && !url.startsWith('http')) {
        url = '../' + url;
    }

    let a = document.createElement('a');
    a.href = url;
    a.textContent = title;

    // Highlight the current page
    if (a.host === location.host && a.pathname === location.pathname) {
        a.classList.add('current');
    }

    // Open external links in a new tab
    if (a.host !== location.host) {
        a.target = '_blank';
    }

    let li = document.createElement('li');
    li.append(a);
    ul.append(li);
}

// --- AUTOMATIC THEME SWITCHER ---
document.body.insertAdjacentHTML(
    'afterbegin',
    `
    <label class="color-scheme">
        Theme:
        <select>
            <option value="light dark">Automatic</option>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
        </select>
    </label>`
);

const select = document.querySelector('.color-scheme select');

// Save and load theme preference
if (localStorage.colorScheme) {
    document.documentElement.style.setProperty('color-scheme', localStorage.colorScheme);
    select.value = localStorage.colorScheme;
}

select.addEventListener('input', function (event) {
    document.documentElement.style.setProperty('color-scheme', event.target.value);
    localStorage.colorScheme = event.target.value;
});

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