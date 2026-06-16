export function isDevModeEnabled() {
    if (typeof window === 'undefined') return false;

    const search = new URLSearchParams(window.location.search || '');
    if (search.has('dev')) {
        const value = String(search.get('dev') || '1').toLowerCase();
        return value !== '0' && value !== 'false' && value !== 'off';
    }

    const hash = String(window.location.hash || '');
    const queryIndex = hash.indexOf('?');
    if (queryIndex >= 0) {
        const hashParams = new URLSearchParams(hash.slice(queryIndex + 1));
        if (hashParams.has('dev')) {
            const value = String(hashParams.get('dev') || '1').toLowerCase();
            return value !== '0' && value !== 'false' && value !== 'off';
        }
    }

    return false;
}
