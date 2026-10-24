// Pages scroll inside `.right-content` (see index.css), so sticky table headers attach to it,
// below the 64px sticky page header.
export const stickyHeader = {
    offsetHeader: 64,
    getContainer: () => (document.querySelector('.right-content') as HTMLElement) || window,
}
