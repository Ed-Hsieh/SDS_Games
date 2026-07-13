import StoryDialogueView from '../components/StoryDialogueView.js';
import { mergeConsecutiveNarration } from '../utils/StoryPresentation.js';
import audioManager from '../utils/AudioManager.js';

class StoryDialogueController {
    constructor() {
        this.view = null;
        this.session = null;
        this.typeTimer = null;
        this.autoTimer = null;
        this.autoPlay = localStorage.getItem('sds.storyDialogueAuto') === 'true';
    }

    mount(root = document.getElementById('story-dialogue-root')) {
        if (!root) throw new Error('Missing #story-dialogue-root');
        if (this.view?.root === root) return this.view;
        this.view = new StoryDialogueView(root);
        this.view.setHandlers({
            advance: () => this.advance(),
            close: () => this.cancel(),
            toggleAuto: () => this.toggleAuto(),
            choose: choiceId => this.resolveChoice(choiceId)
        });
        return this.view;
    }

    isOpen() {
        return Boolean(this.session);
    }

    play(presentation = {}, options = {}) {
        this.mount();
        this.finishSession({ status: 'replaced' });
        const lines = mergeConsecutiveNarration((presentation.lines || []).filter(line => line?.text));
        if (!lines.length) return Promise.resolve({ status: 'empty' });

        return new Promise(resolve => {
            const usedActorIds = new Set(lines.map(line => line.actorId).filter(Boolean));
            const participants = (presentation.participants || [])
                .filter(actor => usedActorIds.has(actor?.id || actor?.actorId));
            this.session = {
                type: 'dialogue',
                presentation,
                participants,
                lines,
                index: 0,
                currentText: '',
                typing: false,
                complete: false,
                closable: Boolean(options.closable),
                backgroundImage: options.backgroundImage || '',
                resolve
            };
            this.view.hideChoices();
            this.view.show({ closable: this.session.closable, autoPlay: this.autoPlay });
            audioManager.play('dialogue-open', { throttleKey: 'story-dialogue-open', throttleMs: 180 });
            this.startCurrentLine();
        });
    }

    choose(config = {}) {
        this.mount();
        this.finishSession({ status: 'replaced' });
        return new Promise(resolve => {
            this.session = { type: 'choice', closable: config.closable !== false, resolve };
            this.view.show({ closable: this.session.closable, autoPlay: this.autoPlay });
            this.view.renderChoices(config);
        });
    }

    startCurrentLine() {
        const session = this.session;
        if (!session || session.type !== 'dialogue') return;
        this.clearTimers();
        session.currentText = '';
        session.typing = true;
        session.complete = false;
        this.renderCurrentLine();
        const line = session.lines[session.index];
        const fullText = String(line.text || '');

        const typeNext = () => {
            if (this.session !== session) return;
            if (session.currentText.length >= fullText.length) {
                this.completeCurrentLine();
                return;
            }
            const remaining = fullText.length - session.currentText.length;
            const chunk = remaining > 30 ? 2 : 1;
            session.currentText = fullText.slice(0, session.currentText.length + chunk);
            this.renderCurrentLine();
            audioManager.play('type', { throttleKey: 'story-dialogue-type', throttleMs: 38 });
            const last = session.currentText.at(-1) || '';
            this.typeTimer = setTimeout(typeNext, /[，。！？、；：\n]/.test(last) ? 105 : 26);
        };
        typeNext();
    }

    renderCurrentLine() {
        const session = this.session;
        if (!session || session.type !== 'dialogue') return;
        const line = session.lines[session.index];
        this.view.renderLine({
            line,
            text: session.currentText,
            participants: session.participants,
            index: session.index,
            total: session.lines.length,
            typing: session.typing,
            backgroundImage: session.backgroundImage
        });
    }

    completeCurrentLine() {
        const session = this.session;
        if (!session || session.type !== 'dialogue') return;
        this.clearTimers();
        const line = session.lines[session.index];
        session.currentText = line.text || '';
        session.typing = false;
        session.complete = true;
        this.renderCurrentLine();
        if (this.autoPlay) {
            const delay = Math.min(4200, (line.isNarration ? 1300 : 850) + session.currentText.length * 22);
            this.autoTimer = setTimeout(() => this.advance(), delay);
        }
    }

    advance() {
        const session = this.session;
        if (!session || session.type !== 'dialogue') return;
        if (session.typing) {
            this.completeCurrentLine();
            return;
        }
        if (session.index >= session.lines.length - 1) {
            this.finishSession({ status: 'complete' });
            return;
        }
        session.index += 1;
        audioManager.play('page', { throttleKey: 'story-dialogue-page', throttleMs: 100 });
        this.startCurrentLine();
    }

    toggleAuto() {
        this.autoPlay = !this.autoPlay;
        localStorage.setItem('sds.storyDialogueAuto', String(this.autoPlay));
        this.view?.setAutoPlay(this.autoPlay);
        if (!this.autoPlay && this.autoTimer) {
            clearTimeout(this.autoTimer);
            this.autoTimer = null;
        } else if (this.autoPlay && this.session?.complete) {
            this.autoTimer = setTimeout(() => this.advance(), 700);
        }
    }

    resolveChoice(choiceId) {
        if (this.session?.type !== 'choice') return;
        this.finishSession({ status: 'selected', choiceId });
    }

    cancel() {
        if (!this.session?.closable) return;
        this.finishSession({ status: 'cancelled' });
    }

    finishSession(result = { status: 'complete' }) {
        const session = this.session;
        if (!session) return;
        this.clearTimers();
        this.session = null;
        this.view?.hide();
        session.resolve?.(result);
    }

    resetForSceneChange() {
        this.finishSession({ status: 'scene_changed' });
    }

    clearTimers() {
        if (this.typeTimer) clearTimeout(this.typeTimer);
        if (this.autoTimer) clearTimeout(this.autoTimer);
        this.typeTimer = null;
        this.autoTimer = null;
    }
}

export const storyDialogueController = new StoryDialogueController();
export default storyDialogueController;
