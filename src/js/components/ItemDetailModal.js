class ItemDetailModal {
    constructor() {
        this._build();
        this._bindEvents();
    }

    _build() {
        this.container = document.createElement('div');
        this.container.className = 'modal component-item-detail-modal';
        this.container.style.display = 'none';

        this.container.innerHTML = `
            <div class="modal-content">
                <div class="modal-header"><div class="modal-title">物品詳情</div></div>
                <div class="modal-body">
                    <div class="item-detail-header">
                        <div class="item-detail-icon"></div>
                        <div class="item-detail-title">
                            <div class="item-detail-name"></div>
                            <div class="item-detail-type"></div>
                        </div>
                    </div>
                    <div class="item-detail-stats"></div>
                    <div class="item-detail-description"></div>
                </div>
                <div class="modal-footer">
                    <div class="item-detail-actions"></div>
                    <button class="btn btn-secondary modal-close-btn">關閉</button>
                </div>
            </div>`;

        document.body.appendChild(this.container);

        this.iconEl = this.container.querySelector('.item-detail-icon');
        this.nameEl = this.container.querySelector('.item-detail-name');
        this.typeEl = this.container.querySelector('.item-detail-type');
        this.statsEl = this.container.querySelector('.item-detail-stats');
        this.descEl = this.container.querySelector('.item-detail-description');
        this.actionsEl = this.container.querySelector('.item-detail-actions');
        this.closeBtn = this.container.querySelector('.modal-close-btn');
    }

    _bindEvents() {
        this.closeBtn.addEventListener('click', () => this.close());
        this.container.addEventListener('click', (e) => {
            if (e.target === this.container) this.close();
        });
    }

    open(item = {}, opts = {}) {
        // basic content
        if (item.image) {
            this.iconEl.innerHTML = `<img src="${item.image}" alt="${item.name}" style="width:100%;height:100%;object-fit:contain;">`;
        } else {
            this.iconEl.textContent = item.icon || '📦';
        }
        this.nameEl.textContent = item.name || opts.title || '物品名稱';
        this.typeEl.textContent = opts.typeText || item.type || '';
        this.descEl.textContent = opts.description || item.desc || item.description || '';

        // stats
        if (opts.statsHtml !== undefined) {
            this.statsEl.innerHTML = opts.statsHtml || '';
        } else {
            this.statsEl.innerHTML = '';
        }

        // actions: accept DOM elements array
        this.actionsEl.innerHTML = '';
        if (Array.isArray(opts.actions)) {
            opts.actions.forEach(a => {
                if (a instanceof HTMLElement) this.actionsEl.appendChild(a);
            });
        }

        // show
        this.container.style.display = 'flex';
        requestAnimationFrame(() => this.container.classList.add('active'));
    }

    close() {
        this.container.classList.remove('active');
        setTimeout(() => {
            this.container.style.display = 'none';
            // clear content to avoid stale handlers
            this.actionsEl.innerHTML = '';
        }, 240);
    }

    isOpen() {
        return this.container.classList.contains('active');
    }
}

// expose singleton
window.ItemDetailModal = new ItemDetailModal();

export default window.ItemDetailModal;
