console.log('IT’S ALIVE!');

/**
 * A helper function to select multiple elements and convert them to an array
 * This makes it much easier to use array methods like .map() or .filter()
 */
export function $$(selector, context = document) {
  return Array.from(context.querySelectorAll(selector));
}
// Step 2.1: Get an array of all nav links
let navLinks = $$("nav a");

// Step 2.2: Find the link to the current page
let currentLink = navLinks.find(
    (a) => a.host === location.host && a.pathname === location.pathname
);

// Step 2.3: Add the 'current' class to the current page link (using optional chaining)
currentLink?.classList.add('current');

// 1. Define your pages (Add all your actual pages here)
let pages = [
    { url: '', title: 'Home' },
    { url: 'projects/', title: 'Projects' },
    { url: 'contact/', title: 'Contact' },
    { url: 'resume/', title: 'Resume' },
    { url: 'https://github.com/romyramrakhyani', title: 'GitHub' }, // External link
];

// 2. Detect the environment for correct pathing
// IMPORTANT: Replace "website" with your actual GitHub repository name!
const ARE_WE_HOME = document.documentElement.classList.contains('home');
const BASE_PATH = (location.hostname === 'localhost' || location.hostname === '127.0.0.1') 
    ? '/' 
    : '/portfolio/'; // Change 'portfolio' to your repo name if it's different

// 3. Create the nav and prepend it to the body
let nav = document.createElement('nav');
document.body.prepend(nav);

// 4. Loop through pages and create links
for (let p of pages) {
    let url = p.url;
    let title = p.title;

    // Adjust URL if it's relative
    url = !url.startsWith('http') ? BASE_PATH + url : url;

    // Create the link element
    let a = document.createElement('a');
    a.href = url;
    a.textContent = title;

    // 5. Highlight current page
    // We check if the link matches the current browser location
    a.classList.toggle(
        'current',
        a.host === location.host && a.pathname === location.pathname
    );

    // 6. Open external links in a new tab
    if (a.host !== location.host) {
        a.target = '_blank';
    }

    nav.append(a);
}
// Step 4.2: Add the HTML for the switcher
document.body.insertAdjacentHTML(
  'afterbegin',
  `
  <label class="color-scheme">
    Theme:
    <select id="scheme-selector">
      <option value="light dark">Automatic</option>
      <option value="light">Light</option>
      <option value="dark">Dark</option>
    </select>
  </label>`
);

// Step 4.3 & 4.4: Select the element and make it work
const select = document.querySelector('#scheme-selector');

// Function to set the scheme and save it
function setColorScheme(scheme) {
  document.documentElement.style.setProperty('color-scheme', scheme);
  select.value = scheme; // Keep the dropdown in sync
  localStorage.colorScheme = scheme; // Step 4.5: Save to local storage
}

// Event listener for user changes
select.addEventListener('input', function (event) {
  setColorScheme(event.target.value);
});

// Step 4.5: On page load, check if a preference was saved
if ("colorScheme" in localStorage) {
  setColorScheme(localStorage.colorScheme);
}