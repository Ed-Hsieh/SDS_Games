import GameManager from '../managers/GameManager.js';
import storyDialogueController from '../managers/StoryDialogueController.js';
import { questManager } from '../managers/QuestManager.js';
import { GuildTutorialCommissionId, QuestStatus } from '../data/Quests.js';
import {
    GuildTutorialFlag,
    GuildTutorialSupply,
    getGuildTutorialSupplyClaimFlag
} from '../data/GuildTutorial.js';
import { getGeneratedGuildSceneImage, getGeneratedItemImage } from '../data/AssetManifest.js';
import { RecipeDatabase } from '../data/Recipes.js';
import { preparePrologueOverworldDeparture } from '../utils/WorldMap.js';
import LobbyScene from './LobbyScene.js';

const STEPS = Object.freeze([
    { flag: GuildTutorialFlag.EVENT_MARK_SEEN, title: '認得事件標記', text: '角色或物件旁的「!」代表有事件。點擊櫃台人員開始。', target: 'clerk' },
    { flag: GuildTutorialFlag.SPOKEN, title: '詢問失聯狀況', text: '和櫃台人員談談，確認南境小鎮失聯的時間與公會要求。', target: 'clerk' },
    { flag: GuildTutorialFlag.COMMISSION_BOARD_READ, title: '查看調查委託', text: '點擊委託板，查看公會留下的南境調查內容。', target: 'board' },
    { complete: () => isCommissionAccepted(), title: '接下調查委託', text: '委託已收入旅人手札。點擊「線索」，親自接下「南境失聯調查」。', target: null, route: 'quest' },
    { flag: GuildTutorialFlag.MAIN_EQUIPPED, title: '裝備主武器', text: '從裝備架領取整套外勤裝備，再從行囊選一件青凝武器裝入主手。', target: 'rack', prepTab: 'inventory' },
    { flag: GuildTutorialFlag.OFFHAND_EQUIPPED, title: '理解副手攻擊', text: '再選一件青凝武器裝入副手。主手命中後，副手會開放兩圈攻擊機會。', target: 'rack', prepTab: 'inventory' },
    { flag: GuildTutorialFlag.ARMOR_CONFLICT_SEEN, title: '確認裝備取捨', text: '裝上皮甲。護甲與副手共用欄位，副手武器會自動回到行囊。', target: 'rack', prepTab: 'inventory' },
    { flag: GuildTutorialFlag.BATTLE_OFFHAND_READY, title: '準備雙武器', text: '前導實戰會練習副手追擊。離開前，請再把一件青凝武器裝入副手。', target: 'rack', prepTab: 'inventory' }
]);

function getRequiredSupplyResult(recipeId) {
    const result = RecipeDatabase[recipeId]?.result;
    if (!result) throw new Error(`Guild tutorial supply recipe ${recipeId} has no result`);
    return result;
}

const GUILD_SUPPLY_ITEMS = Object.freeze([
    ...GuildTutorialSupply.weaponRecipeIds.map(getRequiredSupplyResult),
    getRequiredSupplyResult(GuildTutorialSupply.armorRecipeId)
]);

const GUILD_SUPPLY_WEAPON_IDS = new Set(
    GUILD_SUPPLY_ITEMS.filter(item => item.type === 'weapon').map(item => item.id)
);

function isCommissionAccepted() {
    const status = questManager.getQuestState(GuildTutorialCommissionId)?.status;
    return [QuestStatus.ACTIVE, QuestStatus.COMPLETED, QuestStatus.FINISHED].includes(status);
}

function isStepComplete(step) {
    if (typeof step.complete === 'function') return Boolean(step.complete());
    return Boolean(step.flag && GameManager.getFlag(step.flag));
}

export default class GuildTutorialScene {
    constructor(container, app) {
        this.container = container;
        this.app = app;
        this.handleGameUpdate = this.handleGameUpdate.bind(this);
        this.handleQuestUpdate = this.handleQuestUpdate.bind(this);
    }

    init() {
        this.initialize().catch(error => console.error('Unable to initialize guild tutorial:', error));
    }

    async initialize() {
        this.cacheDom();
        this.bindMapEvents();
        const image = getGeneratedGuildSceneImage('adventurers-guild-hall');
        if (image && this.backdrop) this.backdrop.style.backgroundImage = `url("/${image}")`;
        this.ensureTutorialCommissionUnlocked();
        this.syncEquipmentFlags();
        await this.mountSharedTravelerInterface();
        this.render();
        GameManager.subscribe(this.handleGameUpdate);
        questManager.subscribe(this.handleQuestUpdate);
    }

    cacheDom() {
        this.room = this.container.querySelector('#guild-room');
        this.backdrop = this.container.querySelector('.guild-map-backdrop');
        this.interfaceHost = this.container.querySelector('#guild-interface-host');
        this.overlayHost = this.container.querySelector('#guild-overlay-host');
        this.supplyModal = this.container.querySelector('#guild-supply-modal');
        this.supplyGrid = this.container.querySelector('#guild-supply-grid');
        this.supplyStatus = this.container.querySelector('#guild-supply-status');
        this.supplyClaimAll = this.container.querySelector('#guild-supply-claim-all');
    }

    bindMapEvents() {
        this.container.querySelectorAll('[data-guild-point]').forEach(button => {
            button.addEventListener('click', () => this.interact(button.dataset.guildPoint));
        });
        this.container.querySelectorAll('[data-supply-close]').forEach(button => {
            button.addEventListener('click', () => this.closeSupplyModal());
        });
        this.supplyClaimAll?.addEventListener('click', () => this.claimAllSupplyItems());
    }

    async mountSharedTravelerInterface() {
        if (!this.interfaceHost || !this.overlayHost) return;
        this.interfaceHost.classList.add('guild-interface-loading');
        this.interfaceHost.textContent = '整理旅人手札…';
        const response = await fetch('src/views/lobby.html');
        if (!response.ok) throw new Error(`Unable to load shared lobby interface (${response.status})`);
        const source = new DOMParser().parseFromString(await response.text(), 'text/html');
        const rightRail = source.querySelector('.town-right-rail');
        const prepModal = source.querySelector('#lobby-prep-modal');
        const passiveModal = source.querySelector('#passive-effect-modal');
        if (!rightRail || !prepModal || !passiveModal) throw new Error('Shared traveler interface is incomplete');

        rightRail.classList.add('guild-right-rail');

        const clueButton = rightRail.querySelector('[data-route="quest"]');
        if (clueButton && !clueButton.querySelector('.guild-handbook-mark')) {
            const marker = document.createElement('span');
            marker.className = 'guild-handbook-mark';
            marker.textContent = '!';
            marker.hidden = true;
            marker.setAttribute('aria-hidden', 'true');
            clueButton.append(marker);
        }

        this.interfaceHost.replaceWith(rightRail);
        this.overlayHost.append(prepModal, passiveModal);
        this.interfaceHost = rightRail;

        rightRail.addEventListener('click', event => {
            const routeButton = event.target.closest?.('[data-route]');
            if (!routeButton) return;
            event.preventDefault();
            event.stopPropagation();
            event.stopImmediatePropagation();
            this.openSharedRoute(routeButton.dataset.route);
        }, true);

        this.hudController = new LobbyScene(this.container, this.app);
        this.hudController.cacheDOM();
        this.hudController.bindEvents();
        this.hudController.setPrepTutorialProvider(() => this.getEquipmentTutorialDirective());
        this.hudController.updateUI(null, 'all');
        this.initializeGuildNarrative();
    }

    initializeGuildNarrative() {
        if (!this.hudController) return;
        this.hudController.narrativeLines = [];
        this.hudController.renderedNarrativeCount = 0;
        this.hudController.getTownTitle = () => '冒險者公會';

        this.pushGuildNarrative(
            '公會大廳',
            '櫃台後的登記冊仍攤在桌面。委託板上，有一張南境調查被單獨釘在中央。',
            'ambient',
            'guild:arrival'
        );

        if (GameManager.getFlag(GuildTutorialFlag.SPOKEN)) {
            this.pushGuildNarrative(
                '失聯紀錄',
                '南境小鎮已一個月沒有送回稅簿。公會派出的兩名信使也沒有回來。',
                'discovery',
                'guild:clerk-record'
            );
        }
        if (GameManager.getFlag(GuildTutorialFlag.COMMISSION_BOARD_READ)) {
            this.pushCommissionNarrative();
        }
        if (isCommissionAccepted()) {
            this.pushGuildNarrative(
                '委託已接取',
                '南境失聯調查已登記在你的名下。出發前，公會允許你從裝備架領取外勤配備。',
                'discovery',
                'guild:commission-accepted'
            );
        }
    }

    pushGuildNarrative(title, message, tone, key) {
        this.hudController?.pushTownNarrativeOnce?.(key, title, message, tone);
    }

    pushCommissionNarrative() {
        this.pushGuildNarrative(
            '南境失聯調查',
            '沿南路確認商路，查明小鎮失聯的原因。委託內容已抄入旅人手札。',
            'discovery',
            'guild:commission-recorded'
        );
    }

    getStepIndex() {
        return STEPS.findIndex(step => !isStepComplete(step));
    }

    getStep() {
        const index = this.getStepIndex();
        return index < 0 ? null : STEPS[index];
    }

    getEquipmentTutorialDirective() {
        const equipment = GameManager.getCharacter()?.equipment || {};
        if (!GameManager.getFlag(GuildTutorialFlag.MAIN_EQUIPPED)) {
            return {
                progress: '裝備教學 1 / 4',
                title: '選擇主手武器',
                text: '點擊一件青凝武器，在物品詳情中選擇「裝備主手」。',
                targetItemIds: [...GUILD_SUPPLY_WEAPON_IDS],
                targetSlot: 'weapon'
            };
        }
        if (!GameManager.getFlag(GuildTutorialFlag.OFFHAND_EQUIPPED)) {
            return {
                progress: '裝備教學 2 / 4',
                title: '裝備副手武器',
                text: '點擊另一件青凝武器，選擇「裝備副手」。主手命中後，副手會開放兩圈攻擊機會。',
                targetItemIds: [...GUILD_SUPPLY_WEAPON_IDS].filter(itemId => itemId !== equipment.weapon?.id),
                targetSlot: 'armor'
            };
        }
        if (!GameManager.getFlag(GuildTutorialFlag.ARMOR_CONFLICT_SEEN)) {
            return {
                progress: '裝備教學 3 / 4',
                title: '換上防具',
                text: '點擊皮甲並裝備。防具與副手共用欄位，原本的副手武器會回到行囊。',
                targetItemIds: [getRequiredSupplyResult(GuildTutorialSupply.armorRecipeId).id],
                targetSlot: 'armor'
            };
        }
        if (!GameManager.getFlag(GuildTutorialFlag.BATTLE_OFFHAND_READY)) {
            return {
                progress: '裝備教學 4 / 4',
                title: '帶上副手武器',
                text: '再次選擇一件青凝武器並裝備副手。前導實戰會用到兩圈副手追擊。',
                targetItemIds: [...GUILD_SUPPLY_WEAPON_IDS].filter(itemId => itemId !== equipment.weapon?.id),
                targetSlot: 'armor'
            };
        }
        return null;
    }

    setFlag(flag) {
        if (GameManager.getFlag(flag)) return;
        GameManager.setFlag(flag, true, { reason: `guild-tutorial:${flag}` });
    }

    async interact(pointId) {
        const step = this.getStep();
        if (pointId === 'clerk') {
            if (!GameManager.getFlag(GuildTutorialFlag.EVENT_MARK_SEEN)) {
                this.setFlag(GuildTutorialFlag.EVENT_MARK_SEEN);
            }
            const knownRecord = GameManager.getFlag(GuildTutorialFlag.SPOKEN);
            const greeting = await storyDialogueController.play({
                participants: [],
                lines: [
                    { text: '我走到櫃台前。櫃台人員把筆放下，抬頭看了我一眼。', isNarration: true },
                    { text: knownRecord
                        ? '要再看南境那份紀錄嗎？'
                        : '來看委託？南境那份還掛著。', speaker: '公會櫃台人員' }
                ],
                choiceTitle: '你要查看什麼？',
                choices: [
                    {
                        id: 'missing-town', kind: 'commission', kindLabel: '委託',
                        title: knownRecord ? '重看失聯紀錄' : '查看南境調查',
                        summary: '確認失聯城鎮與信使資料'
                    },
                    {
                        id: 'leave', kind: 'leave', kindLabel: '離開',
                        title: '暫時離開', summary: '先不查看這份委託'
                    }
                ]
            }, { closable: true, backgroundImage: getGeneratedGuildSceneImage('adventurers-guild-hall') });

            if (greeting.status !== 'selected' || greeting.choiceId !== 'missing-town') return;
            const result = await storyDialogueController.play({
                participants: [],
                lines: [
                    { text: '她翻到登記冊最後一頁，把兩張送信紀錄推到我面前。', isNarration: true },
                    { text: '這座小鎮每個月都會送來稅簿。上一次沒收到，我們派人去催；第一個沒回來，第二個也一樣。', speaker: '公會櫃台人員' },
                    { text: '兩個人走的是同一條路？', speaker: '玩家' },
                    { text: '都是南路。公會要你先確認商路；能進鎮就問清楚情況，進不去就把原因帶回來。', speaker: '公會櫃台人員' },
                    { text: '如果路上已經不是偵查能處理的程度？', speaker: '玩家' },
                    { text: '撤退。這份委託不要求你拿命換答案。', speaker: '公會櫃台人員' }
                ]
            }, { closable: true, backgroundImage: getGeneratedGuildSceneImage('adventurers-guild-hall') });
            if (result.status !== 'complete' || knownRecord) return;

            let accepted = false;
            while (!accepted) {
                const decision = await storyDialogueController.choose({
                    title: '你要怎麼回覆？',
                    name: '公會櫃台人員',
                    backgroundImage: getGeneratedGuildSceneImage('adventurers-guild-hall'),
                    choices: [
                        {
                            id: 'accept', kind: 'accept', kindLabel: '接受',
                            title: '接受委託', summary: '希望報酬值得這一趟', isPrimary: true
                        },
                        {
                            id: 'question', kind: 'question', kindLabel: '詢問',
                            title: '詢問信使去向', summary: '確認兩人最後的行程'
                        },
                        {
                            id: 'leave', kind: 'leave', kindLabel: '離開',
                            title: '暫時離開', summary: '再考慮一下'
                        }
                    ]
                });
                if (decision.status !== 'selected' || decision.choiceId === 'leave') return;

                if (decision.choiceId === 'question') {
                    const inquiry = await storyDialogueController.play({
                        lines: [
                            { text: '關於那兩名失蹤的信使，有更多資料嗎？', speaker: '玩家' },
                            { text: '第一個十一天前出發，第二個晚三天走。兩人都騎公會的馬，也都沒在下一站簽到。', speaker: '公會櫃台人員' },
                            { text: '最後有人看見他們的地方呢？', speaker: '玩家' },
                            { text: '南路最後一個公會回報點。再往後，沒有回報。能找到人最好；只找到東西，也別移動現場，先記下位置。', speaker: '公會櫃台人員' }
                        ]
                    }, { closable: true, backgroundImage: getGeneratedGuildSceneImage('adventurers-guild-hall') });
                    if (inquiry.status !== 'complete') return;
                    continue;
                }

                const acceptance = await storyDialogueController.play({
                    lines: [
                        { text: '希望報酬值得我走這一趟。這單我接了；有狀況我會撤離。', speaker: '玩家' },
                        { text: '報酬按高階偵查計算。先到委託板登記名字，完成後再去領外勤配備。', speaker: '公會櫃台人員' }
                    ]
                }, { closable: true, backgroundImage: getGeneratedGuildSceneImage('adventurers-guild-hall') });
                if (acceptance.status !== 'complete') return;
                accepted = true;
            }

            if (accepted) {
                this.setFlag(GuildTutorialFlag.SPOKEN);
                this.ensureTutorialCommissionUnlocked();
                this.pushGuildNarrative(
                    '委託資料已查閱',
                    '南境調查仍需由本人到委託板登記。',
                    'discovery',
                    'guild:clerk-record'
                );
                this.render();
            }
            return;
        }

        if (pointId === 'board') {
            if (!GameManager.getFlag(GuildTutorialFlag.SPOKEN)) return this.playNotice('先向櫃台人員確認這份委託。');
            this.setFlag(GuildTutorialFlag.COMMISSION_BOARD_READ);
            this.pushCommissionNarrative();
            this.render();
            return;
        }

        if (pointId === 'rack') {
            if (!isCommissionAccepted()) return this.playNotice('先在旅人手札裡接下南境調查。');
            this.openSupplyModal();
            return;
        }

        if (pointId === 'exit') {
            if (step) return this.playNotice(step.text);
            this.finishTutorial();
        }
    }

    playNotice(text) {
        return storyDialogueController.play({ lines: [{ text, isNarration: true }] }, {
            closable: true,
            backgroundImage: getGeneratedGuildSceneImage('adventurers-guild-hall')
        });
    }

    openSharedRoute(route) {
        if (route === 'quest') {
            if (!GameManager.getFlag(GuildTutorialFlag.COMMISSION_BOARD_READ)) {
                this.playNotice('委託板上還有一張需要確認的調查。');
                return;
            }
            this.openQuestLedger();
            return;
        }
        this.app?.navigateTo?.(route, { returnTo: 'guild' });
    }

    openQuestLedger() {
        this.app?.navigateTo?.('quest', {
            returnTo: 'guild',
            state: {
                tab: 'commissions',
                selectedQuestId: GuildTutorialCommissionId
            }
        });
    }

    openSupplyModal() {
        if (!this.supplyModal) return;
        this.renderSupplyModal();
        this.supplyModal.hidden = false;
        this.supplyModal.querySelector('button:not([disabled])')?.focus();
    }

    closeSupplyModal() {
        if (this.supplyModal) this.supplyModal.hidden = true;
    }

    getSupplyItem(itemId) {
        return GUILD_SUPPLY_ITEMS.find(item => item.id === itemId) || null;
    }

    hasClaimedSupplyItem(itemId) {
        return GameManager.getFlag(getGuildTutorialSupplyClaimFlag(itemId));
    }

    claimSupplyItem(itemId, { render = true } = {}) {
        const item = this.getSupplyItem(itemId);
        if (!item || this.hasClaimedSupplyItem(itemId)) return false;
        const stored = GameManager.addToInventory({
            ...item,
            tutorialLocked: true,
            tutorialGroup: 'guild-prologue'
        }, 1, { ignoreCapacity: true });
        if (!stored) {
            if (this.supplyStatus) this.supplyStatus.textContent = '行囊已滿。請先整理行囊，再回來領取。';
            return false;
        }
        GameManager.setFlag(getGuildTutorialSupplyClaimFlag(itemId), true, {
            reason: `guild-supply:${itemId}`
        });
        if (this.supplyStatus) this.supplyStatus.textContent = `已領取「${item.name}」。`;
        if (render) this.renderSupplyModal();
        return true;
    }

    claimAllSupplyItems({ render = true } = {}) {
        let claimed = 0;
        GUILD_SUPPLY_ITEMS.forEach(item => {
            if (this.claimSupplyItem(item.id, { render: false })) claimed += 1;
        });
        if (this.supplyStatus) {
            this.supplyStatus.textContent = claimed > 0
                ? `已領取 ${claimed} 件外勤裝備。`
                : '這批外勤裝備已全部領取。';
        }
        if (render) this.renderSupplyModal({ preserveStatus: true });
    }

    renderSupplyModal({ preserveStatus = false } = {}) {
        if (!this.supplyGrid) return;
        const claimedCount = GUILD_SUPPLY_ITEMS.filter(item => this.hasClaimedSupplyItem(item.id)).length;
        const used = GameManager.getInventory()?.length || 0;
        const capacity = GameManager.getInventoryCapacity?.() || 0;
        if (!preserveStatus && this.supplyStatus) {
            this.supplyStatus.textContent = `已領取 ${claimedCount}/${GUILD_SUPPLY_ITEMS.length} · 行囊 ${used}/${capacity}`;
        }
        this.supplyGrid.innerHTML = GUILD_SUPPLY_ITEMS.map(item => {
            const claimed = this.hasClaimedSupplyItem(item.id);
            const image = getGeneratedItemImage(item);
            const level = Number(item.requiredLevel ?? item.level) || 1;
            const statLabel = item.type === 'weapon'
                ? `攻擊 ${Number(item.stats?.attack) || 0}`
                : `防禦 ${Number(item.stats?.defense) || 0}`;
            return `
                <article class="guild-supply-card${claimed ? ' is-claimed' : ''}">
                    <div class="guild-supply-item-icon">
                        ${image ? `<img src="/${image}" alt="">` : `<span>${item.icon || '?'}</span>`}
                    </div>
                    <div class="guild-supply-item-copy">
                        <strong>${item.name}</strong>
                        <span>${statLabel}</span>
                    </div>
                </article>
            `;
        }).join('');
        if (this.supplyClaimAll) {
            this.supplyClaimAll.disabled = claimedCount === GUILD_SUPPLY_ITEMS.length;
            this.supplyClaimAll.textContent = claimedCount === GUILD_SUPPLY_ITEMS.length ? '已領取' : '領取';
        }
    }

    ensureTutorialCommissionUnlocked() {
        if (!GameManager.getFlag(GuildTutorialFlag.SPOKEN)) return;
        const status = questManager.getQuestState(GuildTutorialCommissionId)?.status;
        if (!status || status === QuestStatus.LOCKED) {
            questManager.unlockQuest(GuildTutorialCommissionId);
        }
    }

    syncEquipmentFlags() {
        const equipment = GameManager.getCharacter()?.equipment || {};
        if (GUILD_SUPPLY_WEAPON_IDS.has(equipment.weapon?.id)) this.setFlag(GuildTutorialFlag.MAIN_EQUIPPED);
        if (GUILD_SUPPLY_WEAPON_IDS.has(equipment.armor?.id)) this.setFlag(GuildTutorialFlag.OFFHAND_EQUIPPED);
        if (GameManager.getFlag(GuildTutorialFlag.OFFHAND_EQUIPPED)
            && equipment.armor?.id === RecipeDatabase[GuildTutorialSupply.armorRecipeId]?.result?.id) {
            this.setFlag(GuildTutorialFlag.ARMOR_CONFLICT_SEEN);
        }
        if (GameManager.getFlag(GuildTutorialFlag.ARMOR_CONFLICT_SEEN)
            && GUILD_SUPPLY_WEAPON_IDS.has(equipment.armor?.id)) {
            this.setFlag(GuildTutorialFlag.BATTLE_OFFHAND_READY);
        }
    }

    handleGameUpdate(_state, type) {
        this.hudController?.updateUI(null, type || 'all');
        this.syncEquipmentFlags();
        this.render();
    }

    handleQuestUpdate() {
        if (isCommissionAccepted()) {
            this.pushGuildNarrative(
                '委託已接取',
                '南境失聯調查已登記在你的名下。出發前，公會允許你從裝備架領取外勤配備。',
                'discovery',
                'guild:commission-accepted'
            );
        }
        this.render();
    }

    render() {
        const index = this.getStepIndex();
        const step = index < 0 ? null : STEPS[index];

        this.container.querySelectorAll('[data-guild-point]').forEach(point => {
            const isTarget = point.dataset.guildPoint === step?.target || (!step && point.dataset.guildPoint === 'exit');
            point.classList.toggle('is-ready', isTarget);
            point.disabled = !isTarget;
            const marker = point.querySelector('.town-place-entry-mark');
            if (marker) marker.textContent = isTarget ? '!' : '';
        });

        this.container.querySelectorAll('.traveler-handbook-action').forEach(button => {
            const required = step?.route === button.dataset.route;
            button.classList.toggle('is-required', required);
            button.querySelector('.guild-handbook-mark')?.toggleAttribute('hidden', !required);
        });
        this.container.querySelector('.satchel-button')?.classList.toggle('is-required', Boolean(step?.prepTab));
        this.hudController?.renderPrepTutorial();
        this.hudController?.renderLobbyInventoryGrid(GameManager.getInventory() || []);
    }

    finishTutorial() {
        GameManager.setFlag(GuildTutorialFlag.COMPLETE, true, { reason: 'guild-tutorial-complete' });
        preparePrologueOverworldDeparture();
        this.app?.navigateTo?.('adventure');
    }

    cleanup() {
        GameManager.unsubscribe(this.handleGameUpdate);
        questManager.unsubscribe(this.handleQuestUpdate);
        this.hudController?.cleanup();
        storyDialogueController.resetForSceneChange();
    }
}
