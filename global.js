// --- AUTOMATIC NAVIGATION ---
let pages = [
    { url: '', title: 'Home' },
    { url: 'projects/', title: 'Projects' },
    { url: 'contact/', title: 'Contact' },
    { url: 'resume/', title: 'Resume' },
    { url: 'https://github.com/romyramrakhyani', title: 'GitHub' },
    { url: 'meta/', title: 'Meta' },
];

let nav = document.createElement('nav');
document.body.prepend(nav);
let ul = document.createElement('ul');
nav.append(ul);

for (let p of pages) {
    let url = p.url;
    let title = p.title;

    const ARE_WE_HOME = document.documentElement.classList.contains('home');
    if (!ARE_WE_HOME && !url.startsWith('http')) {
        url = '../' + url;
    }

    let a = document.createElement('a');
    a.href = url;
    a.textContent = title;

    if (a.host === location.host && a.pathname === location.pathname) {
        a.classList.add('current');
    }

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
        <select id="theme-switch">
            <option value="light dark">Automatic</option>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
        </select>
    </label>`
);

const select = document.querySelector('#theme-switch');

function setColorScheme(colorScheme) {
    document.documentElement.style.setProperty('color-scheme', colorScheme);
    select.value = colorScheme;
}

if ("colorScheme" in localStorage) {
    setColorScheme(localStorage.colorScheme);
}

select.addEventListener('input', function (event) {
    setColorScheme(event.target.value);
    localStorage.colorScheme = event.target.value;
});

// --- CORE FUNCTIONS ---

export async function fetchJSON(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Failed to fetch: ${response.statusText}`);
        return await response.json();
    } catch (error) {
        console.error('Error fetching JSON:', error);
    }
}

/**
 * UPDATED FOR LAB 5: Renders projects with specific "Year" styling
 */
export function renderProjects(projects, containerElement, headingLevel = 'h2') {
    containerElement.innerHTML = '';
    
    const isProjectsPage = window.location.pathname.includes('/projects/');

    projects.forEach(project => {
        let imagePath = project.image;
        
        if (isProjectsPage && !imagePath.startsWith('http')) {
            imagePath = '../' + imagePath;
        }

        const article = document.createElement('article');
        
        // Lab 5 Change: Added 'c.' and ensured text is wrapped to avoid overlap
        // The CSS will handle the Baskerville font and oldstyle-nums
        article.innerHTML = `
            <${headingLevel}>${project.title}</${headingLevel}>
            <img src="${imagePath}" alt="${project.title}">
            <div class="project-details">
                <p>${project.description}</p>
                <p class="project-year">c. ${project.year}</p>
            </div>
        `;
        containerElement.appendChild(article);
    });
}

export async function fetchGitHubData(username) {
    return fetchJSON(`https://api.github.com/users/${username}`);
}