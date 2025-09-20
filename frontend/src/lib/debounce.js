export function debounce(func, delay) {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId); // Clear any existing timer
    timeoutId = setTimeout(() => func(...args), delay); // Set new timer
  };
}