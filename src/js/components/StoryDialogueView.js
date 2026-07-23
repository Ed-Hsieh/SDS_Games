import { escapeHtml } from '../utils/ItemDisplay.js';

function resolveImage(source = '') {
    const value = String(source || '').trim();
    if (!value || value.startsWith('working:')) return '';
    return /^(?:https?:|blob:|data:|\/)/.test(value) ? value : `/${value}`;
}

function resolveLayerImage(layer) {
    if (!layer) return '';
    if (typeof layer === 'string') return layer;
    return layer.image || layer.path || '';
}

function shouldMirrorStanding(side, facing = 'center') {
    return (side === 'left' && facing === 'left')
        || (side === 'right' && facing === 'right');
}

export default class StoryDialogueView {
    constructor(root) {
        this.root = root;
        this.handlers = {};
        this.scopeElement = null;
        this.scopeResizeObserver = null;
        this.renderedLineKey = null;
        this.copyScrollTimer = null;
        this.copyTargetScroll = 0;
        this.copyTyping = false;
        this.actorPresentationState = new Map();
        this.updateScopeBounds = this.updateScopeBounds.bind(this);
        this.handleCopyWheel = this.handleCopyWheel.bind(this);
        this.handleCopyScroll = this.handleCopyScroll.bind(this);
        this.renderShell();
    }

    renderShell() {
        this.root.innerHTML = `
            <section class="story-dialogue-overlay" data-visual-mode="scene" aria-live="polite">
                <div class="story-dialogue-backdrop" aria-hidden="true"></div>
                <div class="story-dialogue-shade" aria-hidden="true"></div>
                <button class="story-dialogue-close" type="button" aria-label="關閉對話" title="關閉">×</button>
                <div class="story-dialogue-cast" aria-hidden="true"></div>
                <article class="story-dialogue-box" role="dialog" aria-modal="true" tabindex="-1">
                    <header class="story-dialogue-nameplate" hidden>
                        <strong></strong>
                        <span></span>
                    </header>
                    <div class="story-dialogue-copy">
                        <p><span class="story-dialogue-text"></span><i class="story-dialogue-cursor" aria-hidden="true"></i></p>
                    </div>
                    <div class="story-dialogue-choices" hidden></div>
                    <footer class="story-dialogue-controls">
                        <button class="story-dialogue-auto" type="button" aria-pressed="false">自動閱讀</button>
                        <button class="story-dialogue-read-more" type="button" hidden>
                            <span>下方還有內容</span><i aria-hidden="true">↓</i>
                        </button>
                        <span class="story-dialogue-progress"></span>
                        <span class="story-dialogue-next" aria-hidden="true">▼</span>
                    </footer>
                </article>
            </section>
        `;
        this.overlay = this.root.querySelector('.story-dialogue-overlay');
        this.backdrop = this.root.querySelector('.story-dialogue-backdrop');
        this.cast = this.root.querySelector('.story-dialogue-cast');
        this.box = this.root.querySelector('.story-dialogue-box');
        this.nameplate = this.root.querySelector('.story-dialogue-nameplate');
        this.name = this.nameplate.querySelector('strong');
        this.role = this.nameplate.querySelector('span');
        this.copy = this.root.querySelector('.story-dialogue-copy p');
        this.copyText = this.copy.querySelector('.story-dialogue-text');
        this.cursor = this.root.querySelector('.story-dialogue-cursor');
        this.choices = this.root.querySelector('.story-dialogue-choices');
        this.closeButton = this.root.querySelector('.story-dialogue-close');
        this.autoButton = this.root.querySelector('.story-dialogue-auto');
        this.readMoreButton = this.root.querySelector('.story-dialogue-read-more');
        this.progress = this.root.querySelector('.story-dialogue-progress');
        this.next = this.root.querySelector('.story-dialogue-next');

        this.copy.addEventListener('wheel', this.handleCopyWheel, { passive: false });
        this.copy.addEventListener('scroll', this.handleCopyScroll, { passive: true });

        this.overlay.addEventListener('click', event => {
            if (event.target.closest('button')) return;
            this.handlers.advance?.();
        });
        this.closeButton.addEventListener('click', () => this.handlers.close?.());
        this.autoButton.addEventListener('click', () => this.handlers.toggleAuto?.());
        this.readMoreButton.addEventListener('click', () => this.scrollCopyByLine());
        this.choices.addEventListener('click', event => {
            const option = event.target.closest('[data-story-choice-id]');
            if (option) this.handlers.choose?.(option.dataset.storyChoiceId);
        });
        this.root.addEventListener('keydown', event => {
            if (event.key === 'Escape') {
                event.preventDefault();
                this.handlers.close?.();
                return;
            }
            if (event.key === 'Enter' || event.key === ' ') {
                if (event.target.closest('button')) return;
                event.preventDefault();
                this.handlers.advance?.();
            }
        });
    }

    setHandlers(handlers = {}) {
        this.handlers = handlers;
    }

    show({ closable = false, autoPlay = false, scopeElement = null } = {}) {
        this.actorPresentationState.clear();
        this.setScope(scopeElement);
        this.root.hidden = false;
        this.closeButton.hidden = !closable;
        this.setAutoPlay(autoPlay);
        this.box.focus();
    }

    hide() {
        this.root.hidden = true;
        this.clearScope();
        clearTimeout(this.copyScrollTimer);
        this.copyScrollTimer = null;
        this.copyTargetScroll = 0;
        this.copyTyping = false;
        this.renderedLineKey = null;
        this.actorPresentationState.clear();
        this.cast.innerHTML = '';
        this.choices.innerHTML = '';
        this.choices.hidden = true;
        this.copyText.textContent = '';
        this.backdrop.style.backgroundImage = '';
        this.backdrop.style.backgroundPosition = '';
        this.overlay.dataset.visualMode = 'scene';
        this.box.classList.remove('has-more-copy');
        this.readMoreButton.hidden = true;
    }

    getCopyLineHeight() {
        return Number.parseFloat(getComputedStyle(this.copy).lineHeight) || 37;
    }

    snapCopyToLine({ smooth = true } = {}) {
        const lineHeight = this.getCopyLineHeight();
        const maxScroll = Math.max(0, this.copy.scrollHeight - this.copy.clientHeight);
        const target = Math.min(maxScroll, Math.round(this.copy.scrollTop / lineHeight) * lineHeight);
        this.copyTargetScroll = target;
        if (Math.abs(this.copy.scrollTop - target) < 0.5) return;
        this.copy.scrollTo({ top: target, behavior: smooth ? 'smooth' : 'auto' });
    }

    scrollCopyByLine() {
        const lineHeight = this.getCopyLineHeight();
        const maxScroll = Math.max(0, this.copy.scrollHeight - this.copy.clientHeight);
        const target = Math.min(maxScroll, this.copy.scrollTop + lineHeight);
        this.copyTargetScroll = target;
        this.copy.scrollTo({ top: target, behavior: 'smooth' });
    }

    updateCopyOverflowState() {
        const maxScroll = Math.max(0, this.copy.scrollHeight - this.copy.clientHeight);
        const hasMore = maxScroll > 1 && this.copy.scrollTop < maxScroll - 2;
        this.box.classList.toggle('has-more-copy', hasMore);
        this.readMoreButton.hidden = !hasMore;
        this.next.hidden = this.copyTyping || hasMore;
    }

    handleCopyWheel(event) {
        if (this.copy.scrollHeight <= this.copy.clientHeight || !event.deltaY) return;
        event.preventDefault();

        const lineHeight = this.getCopyLineHeight();
        const maxScroll = Math.max(0, this.copy.scrollHeight - this.copy.clientHeight);
        const wheelLines = event.deltaMode === WheelEvent.DOM_DELTA_LINE
            ? Math.max(1, Math.round(Math.abs(event.deltaY)))
            : Math.min(4, Math.max(1, Math.ceil(Math.abs(event.deltaY) / 70)));
        const base = Math.abs(this.copy.scrollTop - this.copyTargetScroll) <= lineHeight * 1.5
            ? this.copyTargetScroll
            : Math.round(this.copy.scrollTop / lineHeight) * lineHeight;
        const target = Math.min(maxScroll, Math.max(0, base + Math.sign(event.deltaY) * wheelLines * lineHeight));
        this.copyTargetScroll = target;
        this.copy.scrollTo({ top: target, behavior: 'smooth' });
    }

    handleCopyScroll() {
        this.updateCopyOverflowState();
        clearTimeout(this.copyScrollTimer);
        this.copyScrollTimer = window.setTimeout(() => {
            this.copyScrollTimer = null;
            this.snapCopyToLine();
            this.updateCopyOverflowState();
        }, 90);
    }

    setScope(scopeElement = null) {
        this.clearScope();
        if (!(scopeElement instanceof HTMLElement) || !scopeElement.isConnected) return;

        this.scopeElement = scopeElement;
        this.root.dataset.scope = 'element';
        this.updateScopeBounds();
        window.addEventListener('resize', this.updateScopeBounds);
        if ('ResizeObserver' in window) {
            this.scopeResizeObserver = new ResizeObserver(this.updateScopeBounds);
            this.scopeResizeObserver.observe(scopeElement);
        }
    }

    updateScopeBounds() {
        if (!this.scopeElement?.isConnected) return;
        const rect = this.scopeElement.getBoundingClientRect();
        this.root.style.inset = 'auto';
        this.root.style.left = `${Math.round(rect.left)}px`;
        this.root.style.top = `${Math.round(rect.top)}px`;
        this.root.style.width = `${Math.round(rect.width)}px`;
        this.root.style.height = `${Math.round(rect.height)}px`;
    }

    clearScope() {
        window.removeEventListener('resize', this.updateScopeBounds);
        this.scopeResizeObserver?.disconnect();
        this.scopeResizeObserver = null;
        this.scopeElement = null;
        delete this.root.dataset.scope;
        this.root.style.removeProperty('left');
        this.root.style.removeProperty('top');
        this.root.style.removeProperty('width');
        this.root.style.removeProperty('height');
        this.root.style.removeProperty('inset');
    }

    setAutoPlay(enabled) {
        this.autoButton.classList.toggle('is-active', enabled);
        this.autoButton.setAttribute('aria-pressed', String(Boolean(enabled)));
        this.autoButton.textContent = enabled ? '自動播放中' : '自動閱讀';
    }

    renderLine({ line, text, participants = [], index = 0, total = 1, typing = false, backgroundImage = '', backgroundPosition = 'center' }) {
        const lineKey = `${index}:${line.order ?? ''}:${line.actorId ?? ''}:${line.text ?? ''}`;
        if (lineKey !== this.renderedLineKey) {
            this.renderedLineKey = lineKey;
            clearTimeout(this.copyScrollTimer);
            this.copyScrollTimer = null;
            this.copy.scrollTop = 0;
            this.copyTargetScroll = 0;
        }
        const visualMode = line.visualMode || (line.isNarration ? 'narration' : 'speaker');
        const isBlackout = visualMode === 'blackout';
        const hidesCast = isBlackout || visualMode === 'eyes-closing';
        this.overlay.dataset.visualMode = visualMode;
        const resolvedBackground = resolveImage(line.backgroundImage || backgroundImage);
        this.backdrop.style.backgroundImage = !isBlackout && resolvedBackground ? `url("${resolvedBackground}")` : '';
        this.backdrop.style.backgroundPosition = line.backgroundPosition || backgroundPosition || 'center';
        this.nameplate.hidden = Boolean(line.isNarration);
        this.name.textContent = line.speaker || '';
        this.role.textContent = line.role || '';
        this.copyText.textContent = text || '';
        this.copy.classList.toggle('is-prose', Boolean(line.isNarration));
        this.copyTyping = typing;
        this.cursor.hidden = !typing;
        this.progress.textContent = `${Math.min(index + 1, total)} / ${total}`;
        this.updateCopyOverflowState();
        this.renderCast(participants, line, hidesCast);
    }

    renderCast(participants = [], line = {}, hidden = false) {
        if (hidden) {
            this.cast.innerHTML = '';
            return;
        }
        const activeId = line.actorId || null;
        const activeLineImage = line.standing
            || line.portrait
            || line.image
            || resolveLayerImage(line.expressionLayer);
        const usable = participants
            .filter(actor => actor?.id || actor?.actorId)
            .filter(actor => actor.standing
                || actor.portrait
                || actor.image
                || resolveLayerImage(actor.expressionLayer)
                || (actor.id === activeId && activeLineImage));
        const visible = usable.slice(0, 4);
        this.cast.innerHTML = visible.map((actor, index) => {
            const actorId = actor.id || actor.actorId;
            const isActive = !activeId || actorId === activeId;
            const side = index % 2 === 0 ? 'left' : 'right';
            const slot = Math.floor(index / 2);
            const lineExpression = resolveLayerImage(line.expressionLayer);
            const actorExpression = resolveLayerImage(actor.expressionLayer);
            const remembered = this.actorPresentationState.get(actorId);
            let image;
            let resolvedScale;
            let resolvedOffsetY;
            let facing;

            if (isActive) {
                const expressionScale = line.expressionLayer?.scale || actor.expressionLayer?.scale || 1;
                const expressionOffsetY = line.expressionLayer?.offsetY || actor.expressionLayer?.offsetY || 0;
                const standingScale = Number(line.standingScale ?? actor.standingScale) || 1;
                const standingOffsetY = Number(line.standingOffsetY ?? actor.standingOffsetY) || 0;
                resolvedScale = standingScale * (Number(expressionScale) || 1);
                resolvedOffsetY = standingOffsetY + (Number(expressionOffsetY) || 0);
                facing = line.standingFacing || actor.standingFacing || 'center';
                image = lineExpression || line.standing || actorExpression || actor.standing || line.portrait || actor.portrait || actor.image;
                if (image) {
                    this.actorPresentationState.set(actorId, {
                        image,
                        resolvedScale,
                        resolvedOffsetY,
                        facing
                    });
                }
            } else if (remembered) {
                ({ image, resolvedScale, resolvedOffsetY, facing } = remembered);
            } else {
                const expressionScale = actor.expressionLayer?.scale || 1;
                const expressionOffsetY = actor.expressionLayer?.offsetY || 0;
                const standingScale = Number(actor.standingScale) || 1;
                const standingOffsetY = Number(actor.standingOffsetY) || 0;
                resolvedScale = standingScale * (Number(expressionScale) || 1);
                resolvedOffsetY = standingOffsetY + (Number(expressionOffsetY) || 0);
                facing = actor.standingFacing || 'center';
                image = actorExpression || actor.standing || actor.portrait || actor.image;
            }

            const facingClass = shouldMirrorStanding(side, facing) ? ' is-mirrored' : '';
            if (!image) return '';
            return `
                <figure class="story-dialogue-actor ${isActive ? 'is-active' : 'is-inactive'}${facingClass}" data-side="${side}" data-slot="${slot}" style="--story-actor-scale: ${resolvedScale}; --story-actor-offset-y: ${resolvedOffsetY}%">
                    <img src="${escapeHtml(resolveImage(image))}" alt="${escapeHtml(actor.name || line.speaker || '')}">
                </figure>
            `;
        }).join('');
    }

    renderChoices({ title = '選擇話題', choices = [], standing = '', standingFacing = 'center', standingScale = 1, standingOffsetY = 0, portrait = '', name = '', role = '', backgroundImage = '', backgroundPosition = 'center' }) {
        this.overlay.dataset.visualMode = 'choice';
        const resolvedBackground = resolveImage(backgroundImage);
        this.backdrop.style.backgroundImage = resolvedBackground ? `url("${resolvedBackground}")` : '';
        this.backdrop.style.backgroundPosition = backgroundPosition || 'center';
        this.nameplate.hidden = !name;
        this.name.textContent = name;
        this.role.textContent = role;
        this.copyText.textContent = title;
        this.copy.classList.remove('is-prose');
        this.copyTyping = false;
        this.cursor.hidden = true;
        this.next.hidden = true;
        this.readMoreButton.hidden = true;
        this.box.classList.remove('has-more-copy');
        this.progress.textContent = '';
        const characterImage = standing || portrait;
        const facingClass = shouldMirrorStanding('left', standingFacing) ? ' is-mirrored' : '';
        this.cast.innerHTML = characterImage ? `
            <figure class="story-dialogue-actor is-active${facingClass}" data-side="left" data-slot="0" style="--story-actor-scale: ${Number(standingScale) || 1}; --story-actor-offset-y: ${Number(standingOffsetY) || 0}%">
                <img src="${escapeHtml(resolveImage(characterImage))}" alt="${escapeHtml(name)}">
            </figure>
        ` : '';
        this.choices.hidden = false;
        this.choices.dataset.choiceCount = String(choices.length);
        this.choices.innerHTML = choices.map(choice => {
            const isLeave = choice.kind === 'leave' || choice.id === 'leave';
            const choiceKind = choice.kind || (isLeave ? 'leave' : 'conversation');
            const kindLabel = choice.kindLabel || (isLeave ? '離開' : '交談');
            return `
            <button type="button" class="story-dialogue-choice${choice.isPrimary ? ' is-primary' : ''}${choice.summary ? ' has-summary' : ''}" data-story-choice-id="${escapeHtml(choice.id)}" data-choice-kind="${escapeHtml(choiceKind)}">
                <small class="story-dialogue-choice-kind">${escapeHtml(kindLabel)}</small>
                <strong>${escapeHtml(choice.title || choice.label || '交談')}</strong>
                ${choice.summary ? `<span>${escapeHtml(choice.summary)}</span>` : ''}
            </button>
        `;
        }).join('');
    }

    hideChoices() {
        this.choices.hidden = true;
        delete this.choices.dataset.choiceCount;
        this.choices.innerHTML = '';
    }
}
