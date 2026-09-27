export function formatIST(dateString) {
    if (!dateString) return '—';

    let value = String(dateString).trim();

    // Backend timestamps without a timezone are UTC.
    if (!/[zZ]|[+-]\d{2}:\d{2}$/.test(value)) {
        value += 'Z';
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return '—';

    return new Intl.DateTimeFormat('en-IN', {
        timeZone: 'Asia/Kolkata',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
    }).format(date);
}

export function formatTimeIST(dateString) {
    if (!dateString) return '—';

    let value = String(dateString).trim();

    if (!/[zZ]|[+-]\d{2}:\d{2}$/.test(value)) {
        value += 'Z';
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return '—';

    return new Intl.DateTimeFormat('en-IN', {
        timeZone: 'Asia/Kolkata',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
    }).format(date);
}