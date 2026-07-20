import GameManager from '../managers/GameManager.js';
import storyDialogueController from '../managers/StoryDialogueController.js';
import { GuildTutorialFlag, GuildTutorialItems } from '../data/GuildTutorial.js';
import { Armor, Weapon } from '../models/DataModel.js';

const STEPS = Object.freeze([
    { flag: GuildTutorialFlag.MOVED, title: '先熟悉腳步', text: '使用 WASD 在公會大廳移動。', target: null },
    { flag: GuildTutorialFlag.SPOKEN, title: '和櫃台人員交談', text: '靠近櫃台後按 F，並從對話選項詢問失聯委託。', target: 'clerk' },
    { flag: GuildTutorialFlag.COMMISSION_ACCEPTED, title: '接下失聯調查', text: '靠近委託板按 F，閱讀內容後親自接取。', target: 'board', tool: 'commission' },
    { flag: GuildTutorialFlag.CLUE_READ, title: '查看任務線索', text: '使用右側的「線索」按鈕，確認目的地與目前已知情報。', target: null, tool: 'clue' },
    { flag: GuildTutorialFlag.MAIN_EQUIPPED, title: '裝備主武器', text: '靠近訓練裝備架，將訓練劍裝入主手。', target: 'rack', tool: 'equipment' },
    { flag: GuildTutorialFlag.OFFHAND_EQUIPPED, title: '理解副手攻擊', text: '將短刃裝入副手；戰鬥中主手命中後，副手才會短暫開放。', target: 'rack', tool: 'equipment' },
    { flag: GuildTutorialFlag.ARMOR_CONFLICT_SEEN, title: '確認裝備衝突', text: '裝上護甲。護甲與副手共用欄位，因此會自動換下短刃。', target: 'rack', tool: 'equipment' }
]);

const TUTORIAL_ITEM_IDS = new Set(Object.values(GuildTutorialItems).map(item => item.id));

function createTutorialItem(config) {
    const common = [config.id, config.name, config.rarity, config.icon, config.description, 0];
    const item = config.type === 'armor'
        ? new Armor(...common, 0, config.defense || 0, 0, 1.5, config.maxDurability, config.durability)
        : new Weapon(...common, config.attack || 0, 0, 0, 1.5, config.stats?.weaponSpeed || 1, config.stats?.attackSpeed || 1, config.maxDurability, config.durability);
    Object.assign(item, config, { instanceId: item.instanceId });
    return item;
}

export default class GuildTutorialScene {
    constructor(container, app) {
        this.container = container;
        this.app = app;
        this.position = { x: 12, y: 74 };
        this.keys = new Set();
        this.nearby = null;
        this.frame = 0;
        this.lastFrame = 0;
        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.handleKeyUp = this.handleKeyUp.bind(this);
        this.tick = this.tick.bind(this);
    }

    init() {
        this.cacheDom();
        this.bindEvents();
        this.ensureTutorialItems();
        this.render();
        this.room?.focus();
        this.frame = requestAnimationFrame(this.tick);
    }

    cacheDom() {
        this.room = this.container.querySelector('#guild-room');
        this.player = this.container.querySelector('#guild-player');
        this.hint = this.container.querySelector('#guild-interaction-hint');
        this.stepTitle = this.container.querySelector('#guild-step-title');
        this.stepText = this.container.querySelector('#guild-step-text');
        this.stepCount = this.container.querySelector('#guild-step-count');
        this.keyRow = this.container.querySelector('#guild-key-row');
        this.tools = this.container.querySelector('#guild-tools');
        this.modal = this.container.querySelector('#guild-modal');
        this.modalTitle = this.container.querySelector('#guild-modal-title');
        this.modalKicker = this.container.querySelector('#guild-modal-kicker');
        this.modalBody = this.container.querySelector('#guild-modal-body');
    }

    bindEvents() {
        document.addEventListener('keydown', this.handleKeyDown);
        document.addEventListener('keyup', this.handleKeyUp);
        this.container.querySelectorAll('[data-guild-point]').forEach(button => {
            button.addEventListener('click', () => {
                if (this.nearby === button.dataset.guildPoint) this.interact(button.dataset.guildPoint);
            });
        });
        this.container.querySelector('#guild-modal-close')?.addEventListener('click', () => this.closeModal());
        this.modal?.addEventListener('click', event => { if (event.target === this.modal) this.closeModal(); });
        this.container.querySelector('#guild-open-commission')?.addEventListener('click', () => this.openCommission());
        this.container.querySelector('#guild-open-clue')?.addEventListener('click', () => this.openClue());
        this.container.querySelector('#guild-open-equipment')?.addEventListener('click', () => this.openEquipment());
    }

    getStepIndex() {
        return STEPS.findIndex(step => !GameManager.getFlag(step.flag));
    }

    getStep() {
        const index = this.getStepIndex();
        return index < 0 ? null : STEPS[index];
    }

    setFlag(flag) {
        GameManager.setFlag(flag, true, { reason: `guild-tutorial:${flag}` });
        this.render();
    }

    handleKeyDown(event) {
        const key = event.key.toLowerCase();
        if (['w', 'a', 's', 'd'].includes(key)) {
            this.keys.add(key);
            event.preventDefault();
        }
        if (key === 'f') {
            if (event.repeat || !this.modal?.hidden) return;
            if (this.nearby) {
                event.preventDefault();
                this.interact(this.nearby);
            }
        }
    }

    handleKeyUp(event) {
        this.keys.delete(event.key.toLowerCase());
    }

    tick(now) {
        const delta = Math.min(0.04, Math.max(0, (now - (this.lastFrame || now)) / 1000));
        this.lastFrame = now;
        if (this.keys.size && this.modal?.hidden && !storyDialogueController.isOpen()) {
            const speed = 25;
            if (this.keys.has('a')) this.position.x -= speed * delta;
            if (this.keys.has('d')) this.position.x += speed * delta;
            if (this.keys.has('w')) this.position.y -= speed * delta;
            if (this.keys.has('s')) this.position.y += speed * delta;
            this.position.x = Math.max(7, Math.min(92, this.position.x));
            this.position.y = Math.max(15, Math.min(86, this.position.y));
            if (!GameManager.getFlag(GuildTutorialFlag.MOVED)) this.setFlag(GuildTutorialFlag.MOVED);
            this.renderPosition();
        }
        this.updateNearby();
        this.frame = requestAnimationFrame(this.tick);
    }

    renderPosition() {
        if (!this.player) return;
        this.player.style.left = `${this.position.x}%`;
        this.player.style.top = `${this.position.y}%`;
    }

    updateNearby() {
        let nearest = null;
        let distance = Infinity;
        this.container.querySelectorAll('[data-guild-point]').forEach(point => {
            const rect = point.getBoundingClientRect();
            const roomRect = this.room.getBoundingClientRect();
            const x = ((rect.left + rect.width / 2 - roomRect.left) / roomRect.width) * 100;
            const y = ((rect.top + rect.height / 2 - roomRect.top) / roomRect.height) * 100;
            const nextDistance = Math.hypot(x - this.position.x, y - this.position.y);
            point.classList.toggle('is-near', nextDistance < 10);
            if (nextDistance < distance) { distance = nextDistance; nearest = point.dataset.guildPoint; }
        });
        this.nearby = distance < 10 ? nearest : null;
        if (!this.hint) return;
        this.hint.hidden = !this.nearby;
        if (this.nearby) {
            const point = this.container.querySelector(`[data-guild-point="${this.nearby}"]`);
            this.hint.querySelector('strong').textContent = point?.querySelector('span')?.textContent || '';
            this.hint.querySelector('span').textContent = point?.querySelector('small')?.textContent || '';
        }
    }

    async interact(pointId) {
        const step = this.getStep();
        if (pointId === 'clerk') {
            const selection = await storyDialogueController.choose({
                title: '櫃台人員把登記冊轉向你。你要先問什麼？',
                name: '公會櫃台人員',
                role: '南境委託登記',
                backgroundImage: 'src/assets/images/art/scenes/town/locations/civic-room-working.webp',
                choices: [
                    { id: 'commission', label: '詢問失聯委託', summary: '確認目的地、失聯範圍與回報要求。' },
                    { id: 'equipment', label: '詢問整備規則', summary: '了解主手、副手與護甲如何配置。' }
                ],
                closable: true
            });
            if (selection.status !== 'selected') return;
            if (selection.choiceId === 'commission') this.setFlag(GuildTutorialFlag.SPOKEN);
            else this.openModal('整備規則', '<div class="guild-clue-card"><p>主手負責建立攻擊節奏。裝上第二把武器後，主手命中才會短暫開放副手攻擊；護甲和副手武器共用同一欄位，必須在防護與第二把武器之間選擇。</p></div>');
            return;
        }
        if (pointId === 'board') return this.openCommission();
        if (pointId === 'rack') return this.openEquipment();
        if (pointId === 'exit') {
            if (step) {
                this.openModal('尚未完成出發準備', `<div class="guild-clue-card"><p>${step.text}</p></div>`);
                return;
            }
            this.finishTutorial();
        }
    }

    openCommission() {
        if (!GameManager.getFlag(GuildTutorialFlag.SPOKEN)) {
            this.openModal('先確認委託內容', '<div class="guild-clue-card"><p>櫃台人員還沒有替你核對失聯範圍。先和她交談，再從委託板接下工作。</p></div>');
            return;
        }
        const accepted = GameManager.getFlag(GuildTutorialFlag.COMMISSION_ACCEPTED);
        this.openModal('南境失聯調查', `
            <div class="guild-commission">
                <p>南境一座偏遠小鎮已一個月沒有送回稅簿，兩名信使也沒有回來。確認商路、找出斷訊原因，並將答覆帶回公會。</p>
                <p><strong>目前線索：</strong>最後一封正常回報來自南門道路；沒有已知討伐目標。</p>
                ${accepted ? '<button type="button" disabled>已接取</button>' : '<button id="guild-accept-commission" type="button">接取委託</button>'}
            </div>`);
        this.modalBody.querySelector('#guild-accept-commission')?.addEventListener('click', () => {
            this.setFlag(GuildTutorialFlag.COMMISSION_ACCEPTED);
            this.closeModal();
        });
    }

    openClue() {
        if (!GameManager.getFlag(GuildTutorialFlag.COMMISSION_ACCEPTED)) {
            this.openModal('尚未接取委託', '<div class="guild-clue-card"><p>接下委託後，公會才會把失聯紀錄交給你。</p></div>');
            return;
        }
        this.openModal('失聯調查：已知線索', '<div class="guild-clue-card"><p>目的地：南境失聯小鎮。</p><p>已知：稅簿中斷一個月、兩名信使未歸。公會不知道當地是否仍有人存活，也沒有證據證明是怪物襲擊。</p><p>下一步：沿南路前往最後回報位置，確認道路與失聯原因。</p></div>');
        this.setFlag(GuildTutorialFlag.CLUE_READ);
    }

    ensureTutorialItems() {
        const owned = new Set([
            ...(GameManager.getInventory() || []).map(stack => stack.item?.id),
            ...Object.values(GameManager.getCharacter()?.equipment || {}).map(item => item?.id)
        ]);
        Object.values(GuildTutorialItems).forEach(item => {
            if (!owned.has(item.id)) GameManager.addToInventory(createTutorialItem(item), 1, { notify: false });
        });
    }

    findTutorialStack(itemId) {
        return (GameManager.getInventory() || []).find(stack => stack.item?.id === itemId) || null;
    }

    equipTutorialItem(itemId, slot) {
        if (!GameManager.getFlag(GuildTutorialFlag.CLUE_READ)) return false;
        if (itemId === GuildTutorialItems.offhand.id && !GameManager.getFlag(GuildTutorialFlag.MAIN_EQUIPPED)) return false;
        if (itemId === GuildTutorialItems.armor.id && !GameManager.getFlag(GuildTutorialFlag.OFFHAND_EQUIPPED)) return false;
        const stack = this.findTutorialStack(itemId);
        if (!stack || !GameManager.equipItemToSlot(stack.instanceId, slot)) return false;
        if (itemId === GuildTutorialItems.main.id) this.setFlag(GuildTutorialFlag.MAIN_EQUIPPED);
        if (itemId === GuildTutorialItems.offhand.id) this.setFlag(GuildTutorialFlag.OFFHAND_EQUIPPED);
        if (itemId === GuildTutorialItems.armor.id) this.setFlag(GuildTutorialFlag.ARMOR_CONFLICT_SEEN);
        this.openEquipment();
        return true;
    }

    openEquipment() {
        if (!GameManager.getFlag(GuildTutorialFlag.CLUE_READ)) {
            this.openModal('先讀取委託線索', '<div class="guild-clue-card"><p>先確認目的地與回報條件，再進行出發整備。</p></div>');
            return;
        }
        const character = GameManager.getCharacter();
        const equipped = character?.equipment || {};
        const rows = [
            { item: GuildTutorialItems.main, slot: 'weapon', label: '主手', flag: GuildTutorialFlag.MAIN_EQUIPPED },
            { item: GuildTutorialItems.offhand, slot: 'armor', label: '副手', flag: GuildTutorialFlag.OFFHAND_EQUIPPED },
            { item: GuildTutorialItems.armor, slot: 'armor', label: '護甲', flag: GuildTutorialFlag.ARMOR_CONFLICT_SEEN }
        ];
        this.openModal('訓練裝備', `<div class="guild-loadout">
            <div class="guild-clue-card"><p>副手武器與護甲使用同一欄位。裝上護甲時，短刃會回到背包；這是流派選擇，不是額外裝備欄。</p></div>
            ${rows.map((row, index) => {
                const prerequisiteMissing = index > 0 && !GameManager.getFlag(rows[index - 1].flag);
                const completed = GameManager.getFlag(row.flag);
                return `<div class="guild-loadout-row"><span>${row.label}<strong>${row.item.icon} ${row.item.name}</strong></span><small>${equipped[row.slot]?.id === row.item.id ? '目前裝備' : '訓練用品'}</small><button type="button" data-equip-tutorial="${row.item.id}" data-slot="${row.slot}" ${prerequisiteMissing || completed ? 'disabled' : ''}>${completed ? '已完成' : '裝備'}</button></div>`;
            }).join('')}
        </div>`);
        this.modalBody.querySelectorAll('[data-equip-tutorial]').forEach(button => {
            button.addEventListener('click', () => this.equipTutorialItem(button.dataset.equipTutorial, button.dataset.slot));
        });
    }

    openModal(title, body, kicker = '出發準備') {
        this.modalTitle.textContent = title;
        this.modalKicker.textContent = kicker;
        this.modalBody.innerHTML = body;
        this.modal.hidden = false;
    }

    closeModal() {
        this.modal.hidden = true;
        this.room?.focus();
    }

    render() {
        const index = this.getStepIndex();
        const step = index < 0 ? null : STEPS[index];
        this.stepCount.textContent = step ? `${index + 1} / ${STEPS.length}` : '完成';
        this.stepTitle.textContent = step?.title || '準備完成';
        this.stepText.textContent = step?.text || '前往南境出口，開始失聯調查。';
        this.keyRow.hidden = step?.flag !== GuildTutorialFlag.MOVED;
        this.tools.hidden = !GameManager.getFlag(GuildTutorialFlag.COMMISSION_ACCEPTED);
        this.container.querySelectorAll('.guild-tools button').forEach(button => button.classList.remove('is-required'));
        if (step?.tool) this.container.querySelector(`#guild-open-${step.tool}`)?.classList.add('is-required');
        this.renderPosition();
    }

    cleanupTutorialItems() {
        const equipment = GameManager.getCharacter()?.equipment || {};
        Object.keys(equipment).forEach(slot => {
            if (TUTORIAL_ITEM_IDS.has(equipment[slot]?.id)) GameManager.unequipItem(slot, false);
        });
        [...(GameManager.getInventory() || [])].forEach(stack => {
            if (TUTORIAL_ITEM_IDS.has(stack.item?.id)) GameManager.discardItem(stack.instanceId, false, { force: true });
        });
    }

    finishTutorial() {
        this.cleanupTutorialItems();
        GameManager.setFlag(GuildTutorialFlag.COMPLETE, true, { reason: 'guild-tutorial-complete' });
        this.app?.navigateTo?.('adventure');
    }

    cleanup() {
        cancelAnimationFrame(this.frame);
        document.removeEventListener('keydown', this.handleKeyDown);
        document.removeEventListener('keyup', this.handleKeyUp);
    }
}
