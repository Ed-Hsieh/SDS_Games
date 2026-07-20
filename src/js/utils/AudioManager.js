const STORAGE_KEY = 'sdsAudioSettings';
const SETTINGS_VERSION = 3;
const DEFAULT_VOLUME = 50;

const DEFAULT_SETTINGS = {
    settingsVersion: SETTINGS_VERSION,
    enabled: true,
    musicEnabled: true,
    sfxVolume: DEFAULT_VOLUME,
    musicVolume: DEFAULT_VOLUME,
    masterVolume: 1
};

const TRACKS = {
    town: {
        tempo: 78,
        root: 220,
        progression: [[0, 4, 7], [5, 9, 12], [-2, 2, 7], [3, 7, 10]],
        melody: [12, null, 10, 7, null, 5, 7, 10, 12, null, 15, 14, 10, null, 7, 5],
        bass: [-24, -19, -26, -21],
        chordType: 'triangle',
        leadType: 'sine',
        bassType: 'sine',
        chordVolume: 0.012,
        leadVolume: 0.016,
        bassVolume: 0.016,
        filterFrequency: 1350,
        leadEvery: 1
    },
    adventure: {
        tempo: 92,
        root: 164.81,
        progression: [[0, 3, 7], [7, 10, 14], [-2, 2, 5], [5, 8, 12]],
        melody: [12, null, 15, 14, 10, null, 7, 10, 12, null, 10, 7, 5, null, 7, 10],
        bass: [-24, -17, -26, -19],
        chordType: 'triangle',
        leadType: 'sine',
        bassType: 'sine',
        chordVolume: 0.011,
        leadVolume: 0.016,
        bassVolume: 0.017,
        filterFrequency: 1250,
        leadEvery: 1
    },
    dungeon: {
        tempo: 66,
        root: 110,
        progression: [[0, 3, 6], [5, 8, 12], [-1, 3, 6], [6, 10, 13]],
        melody: [null, 12, null, 10, null, 6, null, 5, null, 10, null, 8, null, 3, null, 6],
        bass: [-24, -19, -25, -18],
        chordType: 'sine',
        leadType: 'triangle',
        bassType: 'sine',
        chordVolume: 0.007,
        leadVolume: 0.01,
        bassVolume: 0.014,
        filterFrequency: 760,
        leadEvery: 2
    },
    combat: {
        tempo: 124,
        root: 130.81,
        progression: [[0, 3, 7], [5, 8, 12], [7, 10, 14], [3, 7, 10]],
        melody: [12, 15, 14, 12, 10, 12, 15, 17, 12, 10, 7, 10, 12, 15, 19, 17],
        bass: [-24, -19, -17, -21],
        chordType: 'triangle',
        leadType: 'triangle',
        bassType: 'sine',
        chordVolume: 0.012,
        leadVolume: 0.014,
        bassVolume: 0.019,
        filterFrequency: 1150,
        leadEvery: 1,
        percussion: true
    },
    casino: {
        tempo: 96,
        root: 196,
        progression: [[0, 4, 7], [3, 7, 10], [5, 9, 12], [2, 6, 9]],
        melody: [12, null, 16, 14, 12, null, 10, 7, 9, null, 12, 14, 16, null, 14, 12],
        bass: [-24, -21, -19, -22],
        chordType: 'triangle',
        leadType: 'sine',
        bassType: 'sine',
        chordVolume: 0.012,
        leadVolume: 0.017,
        bassVolume: 0.015,
        filterFrequency: 1450,
        leadEvery: 1,
        swing: true
    },
    forge: {
        tempo: 80,
        root: 146.83,
        progression: [[0, 5, 7], [3, 7, 10], [5, 9, 12], [-2, 2, 7]],
        melody: [7, null, 12, null, 10, null, 7, 5, 7, null, 12, 15, 14, null, 10, null],
        bass: [-24, -21, -19, -26],
        chordType: 'triangle',
        leadType: 'sine',
        bassType: 'sine',
        chordVolume: 0.011,
        leadVolume: 0.014,
        bassVolume: 0.016,
        filterFrequency: 1100,
        leadEvery: 1,
        pulse: true
    },
    study: {
        tempo: 70,
        root: 246.94,
        progression: [[0, 5, 9], [-3, 2, 7], [5, 9, 12], [2, 7, 11]],
        melody: [12, null, null, 9, null, null, 7, null, 12, null, null, 14, null, 11, null, null],
        bass: [-24, -27, -19, -22],
        chordType: 'sine',
        leadType: 'sine',
        bassType: 'sine',
        chordVolume: 0.008,
        leadVolume: 0.012,
        bassVolume: 0.012,
        filterFrequency: 1280,
        leadEvery: 2
    },
    tower: {
        tempo: 92,
        root: 174.61,
        progression: [[0, 3, 7], [4, 7, 11], [7, 10, 14], [2, 5, 9]],
        melody: [12, null, 15, 19, 17, null, 14, 12, 11, null, 14, 17, 15, null, 12, 14],
        bass: [-24, -20, -17, -22],
        chordType: 'triangle',
        leadType: 'sine',
        bassType: 'sine',
        chordVolume: 0.011,
        leadVolume: 0.015,
        bassVolume: 0.017,
        filterFrequency: 1160,
        leadEvery: 1
    },
    market: {
        tempo: 84,
        root: 207.65,
        progression: [[0, 4, 7], [5, 9, 12], [2, 7, 11], [4, 7, 12]],
        melody: [12, null, 9, 7, 9, null, 12, 14, 16, null, 14, 12, 9, null, 7, 9],
        bass: [-24, -19, -22, -20],
        chordType: 'triangle',
        leadType: 'sine',
        bassType: 'sine',
        chordVolume: 0.011,
        leadVolume: 0.015,
        bassVolume: 0.014,
        filterFrequency: 1350,
        leadEvery: 1
    }
};

function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

function normalizeVolume(value, fallback = DEFAULT_VOLUME) {
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) return fallback;
    return Math.round(clamp(parsed, 0, 100));
}

function volumeToGain(value, { baseAtDefault = 3.2, maxGain = 6.5 } = {}) {
    const volume = normalizeVolume(value);
    if (volume <= 0) return 0;
    const normalized = volume / DEFAULT_VOLUME;
    const shaped = normalized < 1 ? Math.pow(normalized, 0.78) : normalized;
    return clamp(shaped * baseAtDefault, 0, maxGain);
}

function semitone(base, offset) {
    return base * Math.pow(2, offset / 12);
}

function loadSettings() {
    if (typeof localStorage === 'undefined') return { ...DEFAULT_SETTINGS };

    try {
        const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
        const isLegacySettings = saved.settingsVersion !== SETTINGS_VERSION;
        return {
            ...DEFAULT_SETTINGS,
            ...saved,
            settingsVersion: SETTINGS_VERSION,
            enabled: saved.enabled !== false,
            musicEnabled: saved.musicEnabled !== false,
            masterVolume: !isLegacySettings && Number.isFinite(Number(saved.masterVolume))
                ? clamp(Number(saved.masterVolume), 0, 1)
                : DEFAULT_SETTINGS.masterVolume,
            sfxVolume: !isLegacySettings && Number.isFinite(Number(saved.sfxVolume))
                ? normalizeVolume(saved.sfxVolume, DEFAULT_SETTINGS.sfxVolume)
                : DEFAULT_SETTINGS.sfxVolume,
            musicVolume: !isLegacySettings && Number.isFinite(Number(saved.musicVolume))
                ? normalizeVolume(saved.musicVolume, DEFAULT_SETTINGS.musicVolume)
                : DEFAULT_SETTINGS.musicVolume
        };
    } catch (error) {
        return { ...DEFAULT_SETTINGS };
    }
}

class AudioManager {
    constructor() {
        this.settings = loadSettings();
        this.ctx = null;
        this.masterGain = null;
        this.sfxGain = null;
        this.musicGain = null;
        this.unlocked = false;
        this.hooksInstalled = false;
        this.sceneName = 'lobby';
        this.currentTrack = null;
        this.pendingTrack = null;
        this.musicNodes = [];
        this.musicInterval = null;
        this.musicStep = 0;
        this.lastPlayedAt = new Map();
        this.textObserver = null;
        this.boundUnlock = () => this.unlock();
        this.settingsWidget = null;
        this.settingsPanel = null;
        this.sfxInput = null;
        this.sfxOutput = null;
        this.musicInput = null;
        this.musicOutput = null;
        this.musicToggle = null;
        this.settingsToggle = null;
    }

    installGlobalHooks() {
        if (this.hooksInstalled || typeof document === 'undefined') return;
        this.hooksInstalled = true;

        document.addEventListener('pointerdown', event => {
            this.unlock();
            this.playForPointer(event);
        }, true);

        document.addEventListener('keydown', event => {
            this.unlock();
            this.playForKey(event);
        }, true);

        document.addEventListener('visibilitychange', () => {
            if (!this.ctx) return;
            if (document.hidden) {
                this.musicGain?.gain.setTargetAtTime(0, this.ctx.currentTime, 0.08);
            } else if (this.settings.musicEnabled && this.settings.enabled) {
                this.applyVolumes();
            }
        });

        this.installTextObserver();
    }

    syncSettingsControl() {
        const sfxVolume = normalizeVolume(this.settings.sfxVolume);
        const musicVolume = normalizeVolume(this.settings.musicVolume);
        if (this.sfxInput) this.sfxInput.value = String(sfxVolume);
        if (this.sfxOutput) this.sfxOutput.textContent = String(sfxVolume);
        if (this.musicInput) this.musicInput.value = String(musicVolume);
        if (this.musicOutput) this.musicOutput.textContent = String(musicVolume);
        if (this.musicToggle) this.musicToggle.checked = Boolean(this.settings.musicEnabled);

        if (this.settingsToggle) {
            const activeVolume = Math.max(sfxVolume, this.settings.musicEnabled ? musicVolume : 0);
            const icon = activeVolume <= 0 ? '&#9833;' : activeVolume < DEFAULT_VOLUME ? '&#9834;' : '&#9835;';
            this.settingsToggle.innerHTML = icon;
            this.settingsToggle.dataset.volume = activeVolume <= 0 ? 'muted' : activeVolume < DEFAULT_VOLUME ? 'low' : 'ready';
        }
    }

    installTextObserver() {
        if (typeof MutationObserver === 'undefined' || typeof document === 'undefined') return;

        const textSelectors = [
            '#detail-dialogue-text',
            '#dialogue-box',
            '.trade-dialogue-feedback',
            '.quest-note-current',
            '.quest-note-next',
            '.town-story-entry'
        ].join(',');

        this.textObserver = new MutationObserver(mutations => {
            for (const mutation of mutations) {
                const target = mutation.target?.nodeType === Node.TEXT_NODE
                    ? mutation.target.parentElement
                    : mutation.target;
                if (!target?.closest?.(textSelectors)) continue;
                this.play('type', { throttleKey: 'text-observer-type', throttleMs: 42 });
                break;
            }
        });

        this.textObserver.observe(document.body, {
            childList: true,
            characterData: true,
            subtree: true
        });
    }

    unlock() {
        if (!this.settings.enabled) return;
        const ctx = this.getContext();
        if (!ctx) return;

        if (ctx.state === 'suspended') {
            ctx.resume().catch(() => {});
        }

        this.unlocked = true;
        this.applyVolumes();

        if (this.pendingTrack || !this.currentTrack) {
            this.startMusic(this.pendingTrack || this.resolveSceneTrack(this.sceneName));
            this.pendingTrack = null;
        }
    }

    getContext() {
        if (this.ctx) return this.ctx;
        if (typeof window === 'undefined') return null;

        const AudioContextCtor = window.AudioContext || window.webkitAudioContext;
        if (!AudioContextCtor) return null;

        this.ctx = new AudioContextCtor();
        this.masterGain = this.ctx.createGain();
        this.sfxGain = this.ctx.createGain();
        this.musicGain = this.ctx.createGain();

        this.sfxGain.connect(this.masterGain);
        this.musicGain.connect(this.masterGain);
        this.masterGain.connect(this.ctx.destination);
        this.applyVolumes();

        return this.ctx;
    }

    saveSettings() {
        if (typeof localStorage === 'undefined') return;
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(this.settings));
        } catch (error) {
            // Audio preferences are optional.
        }
    }

    setEnabled(enabled) {
        this.settings.enabled = Boolean(enabled);
        this.saveSettings();
        this.applyVolumes();
        if (!this.settings.enabled) this.stopMusic();
        else this.playBgm(this.resolveSceneTrack(this.sceneName));
        this.syncSettingsControl();
    }

    setMusicEnabled(enabled) {
        this.settings.musicEnabled = Boolean(enabled);
        this.saveSettings();
        this.applyVolumes();

        if (this.settings.musicEnabled) {
            this.playBgm(this.resolveSceneTrack(this.sceneName));
        } else {
            this.stopMusic();
        }

        this.syncSettingsControl();
    }

    setVolume(volume, { syncControl = true } = {}) {
        const normalized = normalizeVolume(volume, DEFAULT_VOLUME);
        this.settings.sfxVolume = normalized;
        this.settings.musicVolume = normalized;
        this.saveSettings();
        this.applyVolumes();
        if (syncControl) this.syncSettingsControl();
    }

    setSfxVolume(volume, { syncControl = true } = {}) {
        this.settings.sfxVolume = normalizeVolume(volume, this.settings.sfxVolume);
        this.saveSettings();
        this.applyVolumes();
        if (syncControl) this.syncSettingsControl();
    }

    setMusicVolume(volume, { syncControl = true } = {}) {
        this.settings.musicVolume = normalizeVolume(volume, this.settings.musicVolume);
        this.saveSettings();
        this.applyVolumes();
        if (syncControl) this.syncSettingsControl();
    }

    setVolumes({ volume, masterVolume, sfxVolume, musicVolume } = {}) {
        if (Number.isFinite(Number(volume))) {
            const normalized = normalizeVolume(volume, DEFAULT_VOLUME);
            this.settings.sfxVolume = normalized;
            this.settings.musicVolume = normalized;
        }
        if (Number.isFinite(masterVolume)) this.settings.masterVolume = clamp(masterVolume, 0, 1);
        if (Number.isFinite(Number(sfxVolume))) this.settings.sfxVolume = normalizeVolume(sfxVolume, this.settings.sfxVolume);
        if (Number.isFinite(Number(musicVolume))) this.settings.musicVolume = normalizeVolume(musicVolume, this.settings.musicVolume);
        this.saveSettings();
        this.applyVolumes();
        this.syncSettingsControl();
    }

    applyVolumes() {
        if (!this.ctx || !this.masterGain || !this.sfxGain || !this.musicGain) return;
        const now = this.ctx.currentTime;
        const master = this.settings.enabled ? this.settings.masterVolume : 0;
        const sfx = this.settings.enabled
            ? volumeToGain(this.settings.sfxVolume, { baseAtDefault: 3.2, maxGain: 6.5 })
            : 0;
        const music = this.settings.enabled && this.settings.musicEnabled
            ? volumeToGain(this.settings.musicVolume, { baseAtDefault: 4.2, maxGain: 8 })
            : 0;

        this.masterGain.gain.setTargetAtTime(master, now, 0.04);
        this.sfxGain.gain.setTargetAtTime(sfx, now, 0.03);
        this.musicGain.gain.setTargetAtTime(music, now, 0.12);
    }

    setScene(sceneName) {
        this.sceneName = sceneName || 'lobby';
        this.playBgm(this.resolveSceneTrack(this.sceneName));
    }

    resolveSceneTrack(sceneName) {
        if (sceneName?.startsWith?.('dungeon-')) return 'dungeon';
        return {
            lobby: 'town',
            shop: 'market',
            forge: 'forge',
            quest: 'study',
            encyclopedia: 'study',
            adventure: 'adventure',
            tower: 'tower',
            casino: 'casino'
        }[sceneName] || 'town';
    }

    playBgm(trackName) {
        const track = TRACKS[trackName] ? trackName : 'town';
        if (!this.settings.enabled || !this.settings.musicEnabled) return;
        if (!this.unlocked) {
            this.pendingTrack = track;
            return;
        }
        if (track === this.currentTrack) return;
        this.startMusic(track);
    }

    restoreSceneBgm() {
        this.playBgm(this.resolveSceneTrack(this.sceneName));
    }

    playMusicPreview() {
        if (!this.settings.enabled || !this.settings.musicEnabled || !this.unlocked) return;
        const trackName = this.currentTrack || this.resolveSceneTrack(this.sceneName);
        const config = TRACKS[trackName] || TRACKS.town;
        const chord = config.progression?.[0] || [0, 4, 7];
        const root = config.root || 220;

        chord.concat(12).slice(0, 4).forEach((offset, index) => {
            this.note(semitone(root, offset), 0.16, {
                destination: this.musicGain,
                type: config.leadType || 'sine',
                volume: (config.leadVolume || 0.012) * 1.25,
                delay: index * 0.055,
                release: 0.18,
                filterFrequency: config.filterFrequency || 1200
            });
        });
    }

    startMusic(trackName) {
        const ctx = this.getContext();
        if (!ctx || !TRACKS[trackName]) return;

        this.stopMusic();
        this.currentTrack = trackName;
        this.musicStep = 0;

        const config = TRACKS[trackName];
        const beatMs = 60000 / config.tempo;
        const runStep = () => this.playMusicStep(config, trackName);
        runStep();
        this.musicInterval = window.setInterval(runStep, beatMs);
    }

    stopMusic() {
        if (this.musicInterval) {
            window.clearInterval(this.musicInterval);
            this.musicInterval = null;
        }

        if (!this.ctx) {
            this.musicNodes = [];
            this.currentTrack = null;
            return;
        }

        const now = this.ctx.currentTime;
        for (const node of this.musicNodes) {
            try {
                if (node.gain) node.gain.setTargetAtTime(0, now, 0.12);
                if (typeof node.stop === 'function') node.stop(now + 0.28);
                if (typeof node.disconnect === 'function') {
                    window.setTimeout(() => {
                        try { node.disconnect(); } catch (error) {}
                    }, 360);
                }
            } catch (error) {
                // Stopping already-stopped nodes is harmless.
            }
        }
        this.musicNodes = [];
        this.currentTrack = null;
    }

    playMusicStep(config, trackName) {
        if (!this.settings.enabled || !this.settings.musicEnabled) return;
        const step = this.musicStep++;
        const progression = config.progression || [[0, 4, 7]];
        const chordIndex = Math.floor(step / 4) % progression.length;
        const chord = progression[chordIndex];
        const accent = step % 4 === 0;
        const swingDelay = config.swing && step % 2 ? 0.045 : 0;
        const filterFrequency = config.filterFrequency || 1200;

        if (accent) {
            const bassOffsets = config.bass || [-24, -19, -17, -21];
            this.note(semitone(config.root, bassOffsets[chordIndex % bassOffsets.length]), 0.24, {
                destination: this.musicGain,
                type: config.bassType || 'sine',
                volume: config.bassVolume || 0.014,
                attack: 0.012,
                release: trackName === 'combat' ? 0.16 : 0.28,
                filterFrequency: 320
            });
        }

        if (step % 2 === 0) {
            const arpeggioOffset = chord[Math.floor(step / 2) % chord.length] - 12;
            this.note(semitone(config.root, arpeggioOffset), trackName === 'combat' ? 0.1 : 0.14, {
                destination: this.musicGain,
                type: config.chordType || 'triangle',
                volume: config.chordVolume || 0.01,
                delay: swingDelay,
                attack: 0.008,
                release: 0.16,
                filterFrequency,
                pan: ((step % 6) - 3) * 0.045
            });
        }

        const melody = config.melody || [];
        const leadOffset = melody.length ? melody[step % melody.length] : null;
        if (leadOffset !== null && leadOffset !== undefined && step % (config.leadEvery || 1) === 0) {
            this.note(semitone(config.root, leadOffset), trackName === 'combat' ? 0.085 : 0.12, {
                destination: this.musicGain,
                type: config.leadType || 'sine',
                volume: (config.leadVolume || 0.012) * (accent ? 0.85 : 1),
                delay: swingDelay + 0.015,
                attack: 0.006,
                release: trackName === 'combat' ? 0.09 : 0.18,
                filterFrequency,
                pan: ((step % 8) - 4) * 0.035
            });
        }

        if (config.percussion && step % 2 === 0) {
            this.noise(0.028, {
                destination: this.musicGain,
                volume: accent ? 0.008 : 0.004,
                filterType: 'bandpass',
                filterFrequency: accent ? 240 : 520
            });
        } else if (config.pulse && accent) {
            this.noise(0.035, {
                destination: this.musicGain,
                volume: 0.004,
                filterType: 'bandpass',
                filterFrequency: 280
            });
        }
    }

    playForPointer(event) {
        if (!this.settings.enabled) return;
        const target = event.target;
        if (!target?.closest) return;

        const interactive = target.closest('button, [role="button"], a, .item-card, .town-place-card, .town-place-entry, .quick-item, [data-vendor-id]');
        if (!interactive || interactive.disabled || interactive.getAttribute('aria-disabled') === 'true') return;

        const id = interactive.id || '';
        const classes = interactive.className || '';
        const data = interactive.dataset || {};

        if (id.includes('attack') || id === 'action-weapon' || classes.includes('weapon-card')) return;

        if (
            id.includes('clue-book')
            || id.includes('dialogue')
            || classes.includes('quest-record')
            || classes.includes('handbook')
            || data.handbookTab
            || data.adventureHandbookTab
        ) {
            this.play('page', { throttleKey: 'global-page' });
            return;
        }

        if (classes.includes('game-tab') || classes.includes('tab-btn') || classes.includes('filter-btn')) {
            this.play('ui-select', { throttleKey: 'global-select' });
            return;
        }

        if (classes.includes('shop-confirm-btn') || data.supplyAction === 'buy') {
            this.play('coin', { throttleKey: 'global-coin' });
            return;
        }

        this.play('ui-click', { throttleKey: 'global-click', throttleMs: 45 });
    }

    playForKey(event) {
        if (event.repeat || !this.settings.enabled) return;
        if (['Enter', ' ', 'Escape'].includes(event.key)) {
            this.play(event.key === 'Escape' ? 'ui-close' : 'ui-click', {
                throttleKey: 'global-key',
                throttleMs: 60
            });
        }
    }

    play(soundId, options = {}) {
        if (!this.settings.enabled || !this.unlocked) return;
        const ctx = this.getContext();
        if (!ctx || !this.sfxGain) return;
        if (ctx.state === 'suspended') ctx.resume().catch(() => {});

        const throttleKey = options.throttleKey || soundId;
        const throttleMs = Number.isFinite(options.throttleMs) ? options.throttleMs : 28;
        const nowMs = performance.now();
        const last = this.lastPlayedAt.get(throttleKey) || 0;
        if (nowMs - last < throttleMs) return;
        this.lastPlayedAt.set(throttleKey, nowMs);

        const fn = this.soundMap[soundId] || this.soundMap['ui-click'];
        fn.call(this, options);
    }

    get soundMap() {
        return {
            'ui-click': this.sfxClick,
            'ui-select': this.sfxSelect,
            'ui-close': this.sfxClose,
            page: this.sfxPage,
            'book-open': this.sfxBookOpen,
            'book-close': this.sfxBookClose,
            type: this.sfxType,
            'dialogue-open': this.sfxDialogueOpen,
            'toast-info': this.sfxToastInfo,
            'toast-success': this.sfxSuccess,
            'toast-warning': this.sfxWarning,
            'toast-error': this.sfxError,
            coin: this.sfxCoin,
            reward: this.sfxReward,
            loot: this.sfxLoot,
            heal: this.sfxHeal,
            'attack-swing': this.sfxSwing,
            'weapon-break': this.sfxWeaponBreak,
            hit: this.sfxHit,
            crit: this.sfxCrit,
            miss: this.sfxMiss,
            block: this.sfxBlock,
            'player-hit': this.sfxPlayerHit,
            'combat-start': this.sfxCombatStart,
            victory: this.sfxVictory,
            defeat: this.sfxDefeat,
            flee: this.sfxFlee,
            status: this.sfxStatus,
            poison: this.sfxPoison,
            revive: this.sfxRevive,
            'boss-phase': this.sfxBossPhase,
            dice: this.sfxDice,
            slots: this.sfxSlots,
            roulette: this.sfxRoulette,
            jackpot: this.sfxJackpot,
            'dark-table': this.sfxDarkTable,
            hammer: this.sfxHammer,
            'craft-success': this.sfxCraftSuccess,
            'craft-fail': this.sfxCraftFail,
            reroll: this.sfxReroll,
            danger: this.sfxWarning
        };
    }

    note(freq, duration = 0.08, options = {}) {
        const ctx = this.getContext();
        if (!ctx) return;

        const now = ctx.currentTime + (options.delay || 0);
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const pan = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
        const filter = options.filterFrequency ? ctx.createBiquadFilter() : null;
        const destination = options.destination || this.sfxGain;
        const volume = Math.max(0.0001, options.volume ?? 0.08);
        const attack = options.attack ?? 0.004;
        const release = options.release ?? 0.08;

        osc.type = options.type || 'sine';
        osc.frequency.setValueAtTime(Math.max(20, freq), now);
        if (options.endFreq) {
            osc.frequency.exponentialRampToValueAtTime(Math.max(20, options.endFreq), now + duration);
        }

        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.exponentialRampToValueAtTime(volume, now + attack);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + duration + release);

        if (filter) {
            filter.type = options.filterType || 'lowpass';
            filter.frequency.setValueAtTime(options.filterFrequency, now);
            osc.connect(filter);
            filter.connect(gain);
        } else {
            osc.connect(gain);
        }

        if (pan) {
            pan.pan.setValueAtTime(options.pan || 0, now);
            gain.connect(pan);
            pan.connect(destination);
        } else {
            gain.connect(destination);
        }

        osc.start(now);
        osc.stop(now + duration + release + 0.02);
    }

    noise(duration = 0.08, options = {}) {
        const ctx = this.getContext();
        if (!ctx) return;

        const sampleRate = ctx.sampleRate;
        const length = Math.max(1, Math.floor(sampleRate * duration));
        const buffer = ctx.createBuffer(1, length, sampleRate);
        const data = buffer.getChannelData(0);
        let last = 0;
        for (let i = 0; i < length; i += 1) {
            const white = Math.random() * 2 - 1;
            last = (last + 0.02 * white) / 1.02;
            data[i] = options.smooth ? last * 3.5 : white;
        }

        const now = ctx.currentTime + (options.delay || 0);
        const source = ctx.createBufferSource();
        const filter = ctx.createBiquadFilter();
        const gain = ctx.createGain();
        const destination = options.destination || this.sfxGain;

        source.buffer = buffer;
        filter.type = options.filterType || 'highpass';
        filter.frequency.setValueAtTime(options.filterFrequency || 1200, now);
        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.exponentialRampToValueAtTime(Math.max(0.0001, options.volume ?? 0.05), now + 0.006);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + duration + (options.release ?? 0.04));

        source.connect(filter);
        filter.connect(gain);
        gain.connect(destination);
        source.start(now);
        source.stop(now + duration + 0.08);
    }

    sfxClick() {
        this.note(720, 0.035, { type: 'square', volume: 0.028, endFreq: 520, release: 0.025 });
    }

    sfxSelect() {
        this.note(520, 0.045, { type: 'triangle', volume: 0.032, endFreq: 780, release: 0.04 });
    }

    sfxClose() {
        this.note(420, 0.045, { type: 'sine', volume: 0.026, endFreq: 260, release: 0.05 });
    }

    sfxPage() {
        this.noise(0.075, { smooth: true, volume: 0.035, filterType: 'highpass', filterFrequency: 900 });
        this.note(260, 0.055, { type: 'triangle', volume: 0.018, endFreq: 190, release: 0.08, delay: 0.012 });
    }

    sfxBookOpen() {
        this.sfxPage();
        this.note(180, 0.08, { type: 'sine', volume: 0.022, endFreq: 150, release: 0.08, delay: 0.03 });
    }

    sfxBookClose() {
        this.noise(0.09, { smooth: true, volume: 0.042, filterType: 'lowpass', filterFrequency: 1600 });
        this.note(140, 0.08, { type: 'triangle', volume: 0.034, endFreq: 90, release: 0.08 });
    }

    sfxType() {
        const freq = 820 + Math.random() * 420;
        this.note(freq, 0.018, { type: 'square', volume: 0.011, release: 0.018 });
    }

    sfxDialogueOpen() {
        this.sfxBookOpen();
        this.note(610, 0.07, { type: 'sine', volume: 0.02, delay: 0.08, release: 0.12 });
    }

    sfxToastInfo() {
        this.note(620, 0.07, { type: 'sine', volume: 0.026, endFreq: 760, release: 0.08 });
    }

    sfxSuccess() {
        [523.25, 659.25, 783.99].forEach((freq, index) => {
            this.note(freq, 0.08, { type: 'sine', volume: 0.03, delay: index * 0.055, release: 0.08 });
        });
    }

    sfxWarning() {
        this.note(330, 0.09, { type: 'triangle', volume: 0.032, endFreq: 275, release: 0.08 });
        this.note(247, 0.09, { type: 'triangle', volume: 0.024, delay: 0.08, release: 0.08 });
    }

    sfxError() {
        this.note(190, 0.12, { type: 'sawtooth', volume: 0.035, endFreq: 95, release: 0.08 });
        this.noise(0.08, { volume: 0.018, filterType: 'lowpass', filterFrequency: 600 });
    }

    sfxCoin() {
        this.note(1320, 0.06, { type: 'sine', volume: 0.035, endFreq: 1560, release: 0.12 });
        this.note(1980, 0.035, { type: 'sine', volume: 0.018, delay: 0.04, release: 0.08 });
    }

    sfxReward() {
        this.sfxCoin();
        this.note(880, 0.08, { type: 'triangle', volume: 0.028, delay: 0.09, release: 0.14 });
    }

    sfxLoot() {
        this.noise(0.08, { smooth: true, volume: 0.035, filterType: 'bandpass', filterFrequency: 1500 });
        this.sfxCoin();
    }

    sfxHeal() {
        [392, 523.25, 659.25].forEach((freq, index) => {
            this.note(freq, 0.1, { type: 'sine', volume: 0.025, delay: index * 0.045, release: 0.12 });
        });
    }

    sfxSwing() {
        this.noise(0.09, { smooth: true, volume: 0.036, filterType: 'highpass', filterFrequency: 1150 });
        this.note(320, 0.055, { type: 'triangle', volume: 0.018, endFreq: 210, release: 0.035 });
    }

    sfxWeaponBreak() {
        this.note(310, 0.055, { type: 'square', volume: 0.05, endFreq: 92, release: 0.08 });
        this.note(760, 0.04, { type: 'triangle', volume: 0.038, endFreq: 180, delay: 0.025, release: 0.1 });
        this.noise(0.16, { volume: 0.07, filterType: 'bandpass', filterFrequency: 1250, release: 0.1 });
        this.noise(0.07, { volume: 0.045, filterType: 'highpass', filterFrequency: 2600, delay: 0.035, release: 0.08 });
    }

    sfxHit(options = {}) {
        const heavy = options.intensity === 'heavy';
        this.noise(heavy ? 0.08 : 0.055, { volume: heavy ? 0.055 : 0.038, filterType: 'lowpass', filterFrequency: heavy ? 420 : 680 });
        this.note(heavy ? 120 : 170, 0.07, { type: 'triangle', volume: heavy ? 0.04 : 0.028, endFreq: heavy ? 78 : 120, release: 0.06 });
    }

    sfxCrit() {
        this.sfxHit({ intensity: 'heavy' });
        this.note(880, 0.06, { type: 'square', volume: 0.04, endFreq: 1760, release: 0.08, delay: 0.02 });
        this.note(1320, 0.05, { type: 'sine', volume: 0.024, delay: 0.08, release: 0.09 });
    }

    sfxMiss() {
        this.noise(0.09, { smooth: true, volume: 0.026, filterType: 'highpass', filterFrequency: 1800 });
        this.note(560, 0.06, { type: 'sine', volume: 0.014, endFreq: 420, release: 0.06 });
    }

    sfxBlock() {
        this.note(240, 0.06, { type: 'square', volume: 0.028, endFreq: 180, release: 0.04 });
        this.note(720, 0.045, { type: 'triangle', volume: 0.018, delay: 0.015, release: 0.05 });
    }

    sfxPlayerHit(options = {}) {
        this.sfxHit({ intensity: options.intensity || 'light' });
        this.note(95, 0.09, { type: 'sine', volume: 0.026, endFreq: 70, release: 0.08 });
    }

    sfxCombatStart() {
        this.note(140, 0.16, { type: 'sawtooth', volume: 0.036, endFreq: 210, release: 0.08 });
        this.noise(0.16, { smooth: true, volume: 0.028, filterType: 'bandpass', filterFrequency: 480 });
    }

    sfxVictory() {
        [392, 523.25, 659.25, 783.99].forEach((freq, index) => {
            this.note(freq, 0.12, { type: 'triangle', volume: 0.035, delay: index * 0.06, release: 0.15 });
        });
    }

    sfxDefeat() {
        [330, 277.18, 220, 164.81].forEach((freq, index) => {
            this.note(freq, 0.13, { type: 'triangle', volume: 0.032, delay: index * 0.085, release: 0.14 });
        });
    }

    sfxFlee() {
        this.noise(0.14, { smooth: true, volume: 0.03, filterType: 'highpass', filterFrequency: 1200 });
        this.note(300, 0.08, { type: 'sine', volume: 0.018, endFreq: 220, release: 0.08 });
    }

    sfxStatus() {
        this.note(620, 0.08, { type: 'triangle', volume: 0.02, endFreq: 500, release: 0.1 });
    }

    sfxPoison() {
        this.noise(0.12, { smooth: true, volume: 0.022, filterType: 'bandpass', filterFrequency: 760 });
        this.note(180, 0.08, { type: 'sawtooth', volume: 0.016, endFreq: 130, release: 0.08 });
    }

    sfxRevive() {
        [440, 660, 880, 1320].forEach((freq, index) => {
            this.note(freq, 0.1, { type: 'sine', volume: 0.028, delay: index * 0.05, release: 0.2 });
        });
    }

    sfxBossPhase() {
        this.note(110, 0.18, { type: 'sawtooth', volume: 0.042, endFreq: 82, release: 0.12 });
        this.note(440, 0.12, { type: 'square', volume: 0.025, delay: 0.06, endFreq: 330, release: 0.12 });
    }

    sfxDice() {
        for (let i = 0; i < 5; i += 1) {
            this.noise(0.035, { volume: 0.018, filterType: 'bandpass', filterFrequency: 600 + i * 180, delay: i * 0.045 });
            this.note(180 + i * 27, 0.026, { type: 'triangle', volume: 0.018, delay: i * 0.045, release: 0.025 });
        }
    }

    sfxSlots() {
        for (let i = 0; i < 8; i += 1) {
            this.note(520 + (i % 3) * 110, 0.035, { type: 'square', volume: 0.018, delay: i * 0.045, release: 0.03 });
        }
    }

    sfxRoulette() {
        for (let i = 0; i < 10; i += 1) {
            this.note(360 + i * 32, 0.025, { type: 'triangle', volume: 0.016, delay: i * 0.035, release: 0.025 });
        }
    }

    sfxJackpot() {
        this.sfxVictory();
        [1046.5, 1318.5, 1568].forEach((freq, index) => {
            this.note(freq, 0.12, { type: 'sine', volume: 0.03, delay: 0.32 + index * 0.06, release: 0.18 });
        });
    }

    sfxDarkTable() {
        this.note(92.5, 0.22, { type: 'sawtooth', volume: 0.03, endFreq: 73.42, release: 0.18 });
        this.noise(0.2, { smooth: true, volume: 0.02, filterType: 'lowpass', filterFrequency: 420 });
    }

    sfxHammer() {
        this.noise(0.05, { volume: 0.044, filterType: 'lowpass', filterFrequency: 700 });
        this.note(150, 0.055, { type: 'square', volume: 0.04, endFreq: 115, release: 0.04 });
        this.note(780, 0.035, { type: 'triangle', volume: 0.018, delay: 0.015, release: 0.05 });
    }

    sfxCraftSuccess() {
        this.sfxHammer();
        this.note(740, 0.08, { type: 'sine', volume: 0.028, delay: 0.12, endFreq: 980, release: 0.14 });
    }

    sfxCraftFail() {
        this.sfxHammer();
        this.note(190, 0.12, { type: 'sawtooth', volume: 0.026, delay: 0.08, endFreq: 105, release: 0.1 });
    }

    sfxReroll() {
        for (let i = 0; i < 5; i += 1) {
            this.note(480 + i * 90, 0.045, { type: 'triangle', volume: 0.018, delay: i * 0.035, release: 0.045 });
        }
    }
}

const audioManager = new AudioManager();

export default audioManager;
