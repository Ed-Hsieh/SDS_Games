import StoryDialogueView from '../components/StoryDialogueView.js';
import { mergeConsecutiveNarration } from '../utils/StoryPresentation.js';
import audioManager from '../utils/AudioManager.js';

class StoryDialogueController {
    constructor() {
        this.view = null;
        this.session = null;
        this.typeTimer = null;
        this.autoTimer = null;
        this.stageTimer = null;
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
        const sourceTimeline = presentation.timeline || presentation.lines || [];
        const timeline = mergeConsecutiveNarration(
            sourceTimeline.filter(entry => entry?.stageAction || entry?.text)
        );
        const displayTotal = timeline.filter(entry => !entry.stageAction && entry?.text).length;
        if (!displayTotal) return Promise.resolve({ status: 'empty' });

        return new Promise(resolve => {
            let displayIndex = 0;
            const indexedTimeline = timeline.map(entry => (
                entry.stageAction
                    ? entry
                    : { ...entry, displayIndex: displayIndex++ }
            ));
            const usedActorIds = new Set(indexedTimeline.flatMap(entry => (
                entry.actorIds?.length ? entry.actorIds : [entry.actorId]
            )).filter(Boolean));
            const participants = (presentation.participants || [])
                .filter(actor => usedActorIds.has(actor?.id || actor?.actorId));
            const stagedEntrants = new Set(indexedTimeline
                .filter(entry => entry.stageAction === 'enter')
                .flatMap(entry => entry.actorIds || []));
            const visibleActorIds = new Set(participants
                .map(actor => actor?.id || actor?.actorId)
                .filter(actorId => actorId && !stagedEntrants.has(actorId)));
            this.session = {
                type: 'dialogue',
                presentation,
                participants,
                timeline: indexedTimeline,
                displayTotal,
                visibleActorIds,
                enteringActorIds: new Set(),
                exitingActorIds: new Set(),
                choices: Array.isArray(presentation.choices) ? presentation.choices.filter(choice => choice?.id) : [],
                index: 0,
                currentText: '',
                typing: false,
                complete: false,
                stageProcessing: false,
                lastDisplayLine: null,
                closable: Boolean(options.closable),
                backgroundImage: options.backgroundImage || '',
                backgroundPosition: options.backgroundPosition || 'center',
                resolve
            };
            this.view.hideChoices();
            this.view.show({
                closable: this.session.closable,
                autoPlay: this.autoPlay,
                scopeElement: options.scopeElement
            });
            audioManager.play('dialogue-open', { throttleKey: 'story-dialogue-open', throttleMs: 180 });
            this.startCurrentLine();
        });
    }

    choose(config = {}) {
        this.mount();
        this.finishSession({ status: 'replaced' });
        return new Promise(resolve => {
            this.session = { type: 'choice', closable: config.closable !== false, resolve };
            this.view.show({
                closable: this.session.closable,
                autoPlay: this.autoPlay,
                scopeElement: config.scopeElement
            });
            this.view.renderChoices(config);
        });
    }

    startCurrentLine() {
        const session = this.session;
        if (!session || session.type !== 'dialogue') return;
        this.clearTimers();
        const line = session.timeline[session.index];
        if (!line) {
            this.finishDialogueTimeline();
            return;
        }
        if (line.stageAction) {
            this.processStageAction(line);
            return;
        }
        if (line.actorId) session.visibleActorIds.add(line.actorId);
        session.lastDisplayLine = line;
        session.currentText = '';
        session.typing = true;
        session.complete = false;
        this.renderCurrentLine();
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
        const line = session.timeline[session.index];
        if (!line || line.stageAction) return;
        this.view.renderLine({
            line,
            text: session.currentText,
            participants: session.participants,
            index: line.displayIndex,
            total: session.displayTotal,
            typing: session.typing,
            backgroundImage: session.backgroundImage,
            backgroundPosition: session.backgroundPosition,
            castState: this.getCastState(session)
        });
    }

    completeCurrentLine() {
        const session = this.session;
        if (!session || session.type !== 'dialogue') return;
        this.clearTimers();
        const line = session.timeline[session.index];
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
        if (session.stageProcessing) return;
        if (session.typing) {
            this.completeCurrentLine();
            return;
        }
        session.index += 1;
        if (session.index >= session.timeline.length) {
            this.finishDialogueTimeline();
            return;
        }
        audioManager.play('page', { throttleKey: 'story-dialogue-page', throttleMs: 100 });
        this.startCurrentLine();
    }

    getCastState(session = this.session) {
        return {
            visibleActorIds: session?.visibleActorIds || new Set(),
            enteringActorIds: session?.enteringActorIds || new Set(),
            exitingActorIds: session?.exitingActorIds || new Set()
        };
    }

    processStageAction(action) {
        const session = this.session;
        if (!session || session.type !== 'dialogue') return;
        const actorIds = action.actorIds || [];
        if (!actorIds.length) {
            session.index += 1;
            this.startCurrentLine();
            return;
        }

        session.stageProcessing = true;
        if (action.stageAction === 'enter') {
            actorIds.forEach(actorId => {
                session.visibleActorIds.add(actorId);
                session.enteringActorIds.add(actorId);
            });
        } else {
            actorIds.forEach(actorId => {
                if (session.visibleActorIds.has(actorId)) session.exitingActorIds.add(actorId);
            });
        }

        this.view.renderStage({
            participants: session.participants,
            line: session.lastDisplayLine || {},
            castState: this.getCastState(session)
        });

        this.stageTimer = setTimeout(() => {
            if (this.session !== session) return;
            if (action.stageAction === 'exit') {
                actorIds.forEach(actorId => session.visibleActorIds.delete(actorId));
            }
            actorIds.forEach(actorId => {
                session.enteringActorIds.delete(actorId);
                session.exitingActorIds.delete(actorId);
            });
            session.stageProcessing = false;
            session.index += 1;
            this.view.renderStage({
                participants: session.participants,
                line: session.lastDisplayLine || {},
                castState: this.getCastState(session)
            });
            this.startCurrentLine();
        }, 240);
    }

    finishDialogueTimeline() {
        const session = this.session;
        if (!session || session.type !== 'dialogue') return;
        if (session.choices.length) {
            this.openFollowUpChoices();
            return;
        }
        this.finishSession({ status: 'complete' });
    }

    openFollowUpChoices() {
        const session = this.session;
        if (!session || session.type !== 'dialogue' || !session.choices.length) return;
        this.clearTimers();
        const line = session.lastDisplayLine || {};
        const actor = session.participants.find(participant => (
            (participant.id || participant.actorId) === line.actorId
        )) || null;
        session.type = 'choice';
        this.view.renderChoices({
            title: session.presentation.choiceTitle || '你還想詢問什麼？',
            choices: session.choices,
            name: line.speaker || actor?.name || '',
            role: line.role || actor?.role || '',
            standing: line.standing || actor?.standing || '',
            standingFacing: line.standingFacing || actor?.standingFacing || 'center',
            standingScale: line.standingScale ?? actor?.standingScale ?? 1,
            standingOffsetY: line.standingOffsetY ?? actor?.standingOffsetY ?? 0,
            portrait: line.portrait || actor?.portrait || actor?.image || '',
            backgroundImage: line.backgroundImage || session.backgroundImage,
            backgroundPosition: line.backgroundPosition || session.backgroundPosition
        });
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
        if (this.stageTimer) clearTimeout(this.stageTimer);
        this.typeTimer = null;
        this.autoTimer = null;
        this.stageTimer = null;
    }
}

export const storyDialogueController = new StoryDialogueController();
export default storyDialogueController;
