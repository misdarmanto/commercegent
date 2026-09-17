export function getImageUrl(path: string): string {
    if (!path) return '';
    // If path is already a full URL (from new API), return as-is
    if (path.startsWith('http')) return path;
    // Otherwise treat it as a relative path from the API
    return path;
}
