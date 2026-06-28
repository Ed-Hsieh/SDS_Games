import { escapeHtml } from './ItemDisplay.js';
import audioManager from './AudioManager.js';

const TOAST_ICONS = {
    success: '✅',
    info: 'ℹ️',
    warning: '⚠️',
    error: '❌',
    danger: '⚠️',
    quest: '📜'
};

let toastContainer = null;
let toastId = 0;

function ensureToastContainer() {
    if (toastContainer?.isConnected) return toastContainer;

    toastContainer = document.createElement('div');
    toastContainer.className = 'app-toast-stack';
    toastContainer.setAttribute('aria-live', 'polite');
    toastContainer.setAttribute('aria-atomic', 'false');
    document.body.appendChild(toastContainer);
    return toastContainer;
}

function getToastType(type) {
    return ['success', 'info', 'warning', 'error', 'danger', 'quest'].includes(type) ? type : 'info';
}

export function showGlobalToast(title, message, type = 'info', options = {}) {
    if (typeof document === 'undefined') return null;

    const safeType = getToastType(type);
    audioManager.play(
        safeType === 'success' ? 'toast-success'
            : safeType === 'warning' || safeType === 'danger' ? 'toast-warning'
                : safeType === 'error' ? 'toast-error'
                    : safeType === 'quest' ? 'page'
                        : 'toast-info',
        { throttleKey: `toast-${safeType}`, throttleMs: 160 }
    );
    const container = ensureToastContainer();
    const id = `app-toast-${toastId += 1}`;
    const duration = Number(options.duration) > 0 ? Number(options.duration) : 4200;
    const toast = document.createElement('article');
    let dismissed = false;

    toast.id = id;
    toast.className = `app-toast app-toast-${safeType}`;
    toast.setAttribute('role', safeType === 'error' || safeType === 'danger' ? 'alert' : 'status');
    toast.innerHTML = `
        <div class="app-toast-icon">${TOAST_ICONS[safeType] || TOAST_ICONS.info}</div>
        <div class="app-toast-copy">
            <strong>${escapeHtml(title || '提示')}</strong>
            ${message ? `<span>${escapeHtml(message)}</span>` : ''}
        </div>
        <button class="app-toast-close" type="button" aria-label="關閉提示">×</button>
    `;

    const dismiss = () => {
        if (dismissed) return;
        dismissed = true;
        toast.classList.add('is-leaving');
        window.setTimeout(() => toast.remove(), 180);
    };

    toast.querySelector('.app-toast-close')?.addEventListener('click', dismiss);
    toast.addEventListener('click', event => {
        if (event.target === toast) dismiss();
    });

    container.prepend(toast);
    requestAnimationFrame(() => toast.classList.add('is-visible'));

    while (container.children.length > 5) {
        container.lastElementChild?.remove();
    }

    window.setTimeout(dismiss, duration);
    return toast;
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
        audioManager.play(type === 'danger' ? 'toast-warning' : 'ui-select', {
            throttleKey: 'confirm-open',
            throttleMs: 160
        });
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
            audioManager.play(result ? 'ui-select' : 'ui-close', {
                throttleKey: 'confirm-finish',
                throttleMs: 120
            });
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
