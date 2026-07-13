import { escapeHtml } from '../utils/ItemDisplay.js';

function resolveImage(source = '') {
    const value = String(source || '').trim();
    if (!value || value.startsWith('working:')) return '';
    return /^(?:https?:|blob:|data:|\/)/.test(value) ? value : `/${value}`;
}

export default class StoryDialogueView {
    constructor(root) {
        this.root = root;
        this.handlers = {};
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
                        <p></p><i class="story-dialogue-cursor" aria-hidden="true"></i>
                    </div>
                    <div class="story-dialogue-choices" hidden></div>
                    <footer class="story-dialogue-controls">
                        <button class="story-dialogue-auto" type="button" aria-pressed="false">自動閱讀</button>
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
        this.cursor = this.root.querySelector('.story-dialogue-cursor');
        this.choices = this.root.querySelector('.story-dialogue-choices');
        this.closeButton = this.root.querySelector('.story-dialogue-close');
        this.autoButton = this.root.querySelector('.story-dialogue-auto');
        this.progress = this.root.querySelector('.story-dialogue-progress');
        this.next = this.root.querySelector('.story-dialogue-next');

        this.overlay.addEventListener('click', event => {
            if (event.target.closest('button')) return;
            this.handlers.advance?.();
        });
        this.closeButton.addEventListener('click', () => this.handlers.close?.());
        this.autoButton.addEventListener('click', () => this.handlers.toggleAuto?.());
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

    show({ closable = false, autoPlay = false } = {}) {
        this.root.hidden = false;
        this.closeButton.hidden = !closable;
        this.setAutoPlay(autoPlay);
        this.box.focus();
    }

    hide() {
        this.root.hidden = true;
        this.cast.innerHTML = '';
        this.choices.innerHTML = '';
        this.choices.hidden = true;
        this.copy.textContent = '';
        this.backdrop.style.backgroundImage = '';
        this.overlay.dataset.visualMode = 'scene';
    }

    setAutoPlay(enabled) {
        this.autoButton.classList.toggle('is-active', enabled);
        this.autoButton.setAttribute('aria-pressed', String(Boolean(enabled)));
        this.autoButton.textContent = enabled ? '自動播放中' : '自動閱讀';
    }

    renderLine({ line, text, participants = [], index = 0, total = 1, typing = false, backgroundImage = '' }) {
        const visualMode = line.visualMode || (line.isNarration ? 'narration' : 'speaker');
        const isBlackout = visualMode === 'blackout';
        this.overlay.dataset.visualMode = visualMode;
        const resolvedBackground = resolveImage(line.backgroundImage || backgroundImage);
        this.backdrop.style.backgroundImage = !isBlackout && resolvedBackground ? `url("${resolvedBackground}")` : '';
        this.nameplate.hidden = Boolean(line.isNarration);
        this.name.textContent = line.speaker || '';
        this.role.textContent = line.role || '';
        this.copy.textContent = text || '';
        this.copy.classList.toggle('is-prose', Boolean(line.isNarration));
        this.cursor.hidden = !typing;
        this.next.hidden = typing;
        this.progress.textContent = `${Math.min(index + 1, total)} / ${total}`;
        this.renderCast(participants, line, isBlackout);
    }

    renderCast(participants = [], line = {}, hidden = false) {
        if (hidden) {
            this.cast.innerHTML = '';
            return;
        }
        const activeId = line.actorId || null;
        const usable = participants
            .filter(actor => actor?.id || actor?.actorId)
            .filter(actor => actor.portrait || actor.image || actor.expressionLayer || actor.id === activeId);
        const visible = usable.slice(0, 4);
        this.cast.innerHTML = visible.map((actor, index) => {
            const actorId = actor.id || actor.actorId;
            const isActive = actorId === activeId;
            const side = index % 2 === 0 ? 'left' : 'right';
            const slot = Math.floor(index / 2);
            const image = isActive
                ? (line.expressionLayer || line.portrait || actor.expressionLayer || actor.portrait || actor.image)
                : (actor.portrait || actor.image || actor.expressionLayer);
            if (!image) return '';
            return `
                <figure class="story-dialogue-actor ${isActive ? 'is-active' : 'is-inactive'}" data-side="${side}" data-slot="${slot}">
                    <img src="${escapeHtml(resolveImage(image))}" alt="${escapeHtml(actor.name || line.speaker || '')}">
                </figure>
            `;
        }).join('');
    }

    renderChoices({ title = '選擇話題', choices = [], portrait = '', name = '', role = '', backgroundImage = '' }) {
        this.overlay.dataset.visualMode = 'choice';
        const resolvedBackground = resolveImage(backgroundImage);
        this.backdrop.style.backgroundImage = resolvedBackground ? `url("${resolvedBackground}")` : '';
        this.nameplate.hidden = !name;
        this.name.textContent = name;
        this.role.textContent = role;
        this.copy.textContent = title;
        this.copy.classList.remove('is-prose');
        this.cursor.hidden = true;
        this.next.hidden = true;
        this.progress.textContent = '';
        this.cast.innerHTML = portrait ? `
            <figure class="story-dialogue-actor is-active" data-side="left" data-slot="0">
                <img src="${escapeHtml(resolveImage(portrait))}" alt="${escapeHtml(name)}">
            </figure>
        ` : '';
        this.choices.hidden = false;
        this.choices.innerHTML = choices.map(choice => `
            <button type="button" data-story-choice-id="${escapeHtml(choice.id)}">
                <strong>${escapeHtml(choice.label || choice.title || '交談')}</strong>
                ${choice.summary ? `<span>${escapeHtml(choice.summary)}</span>` : ''}
            </button>
        `).join('');
    }

    hideChoices() {
        this.choices.hidden = true;
        this.choices.innerHTML = '';
    }
}
