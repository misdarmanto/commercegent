export function getImageUrl(path: string): string {
    if (!path) return '';
    // If path is already a full URL, return as-is
    if (path.startsWith('http')) return path;
    // If path is absolute path from API, prepend API base URL
    if (path.startsWith('/')) return `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}${path}`;
    return path;
}
