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