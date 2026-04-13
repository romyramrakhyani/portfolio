console.log('IT’S ALIVE!');

/**
 * A helper function to select multiple elements and convert them to an array
 * This makes it much easier to use array methods like .map() or .filter()
 */
export function $$(selector, context = document) {
  return Array.from(context.querySelectorAll(selector));
}