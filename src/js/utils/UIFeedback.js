import { escapeHtml } from './ItemDisplay.js';

const TOAST_ICONS = {
    success: '✅',
    info: 'ℹ️',
    warning: '⚠️',
    error: '❌',
    danger: '⚠️'
};

export function showGlobalToast(title, message, type = 'info', options = {}) {
    return null;
}

export function confirmAction({
    title = '確認操作',
    message = '',
    details = [],
    confirmText = '確認',
    cancelText = '取消',
    type = 'warning'
} = {}) {
    return new Promise(resolve => {
        const overlay = document.createElement('div');
        const safeType = type === 'danger' ? 'danger' : type;
        const detailItems = Array.isArray(details)
            ? details.filter(Boolean).map(item => `<li>${escapeHtml(item)}</li>`).join('')
            : '';
        let resolved = false;

        overlay.className = `app-confirm-overlay confirm-${safeType}`;
        overlay.innerHTML = `
            <div class="app-confirm-dialog" role="dialog" aria-modal="true" aria-labelledby="app-confirm-title">
                <div class="app-confirm-icon">${TOAST_ICONS[type] || TOAST_ICONS.warning}</div>
                <div class="app-confirm-content">
                    <h3 id="app-confirm-title">${escapeHtml(title)}</h3>
                    <p>${escapeHtml(message)}</p>
                    ${detailItems ? `<ul class="app-confirm-details">${detailItems}</ul>` : ''}
                </div>
                <div class="app-confirm-actions">
                    <button class="btn btn-secondary app-confirm-cancel" type="button">${escapeHtml(cancelText)}</button>
                    <button class="btn ${safeType === 'danger' ? 'btn-danger' : 'btn-warning'} app-confirm-ok" type="button">${escapeHtml(confirmText)}</button>
                </div>
            </div>
        `;

        const finish = result => {
            if (resolved) return;
            resolved = true;
            document.removeEventListener('keydown', onKeyDown);
            overlay.classList.remove('active');
            setTimeout(() => overlay.remove(), 180);
            resolve(result);
        };

        const onKeyDown = event => {
            if (event.key === 'Escape') finish(false);
        };

        overlay.addEventListener('click', event => {
            if (event.target === overlay) finish(false);
        });
        overlay.querySelector('.app-confirm-cancel')?.addEventListener('click', () => finish(false));
        overlay.querySelector('.app-confirm-ok')?.addEventListener('click', () => finish(true));
        document.addEventListener('keydown', onKeyDown);

        document.body.appendChild(overlay);
        requestAnimationFrame(() => {
            overlay.classList.add('active');
            overlay.querySelector('.app-confirm-cancel')?.focus();
        });
    });
}
