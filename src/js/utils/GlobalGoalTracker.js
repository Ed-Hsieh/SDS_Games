import GameManager from '../managers/GameManager.js';
import { questManager, ObjectiveType, QuestStatus } from '../managers/QuestManager.js';
import { RecipeDatabase, canCraft } from '../managers/RecipeManager.js';
import { getMaterial } from '../managers/MaterialManager.js';
import { getEquipmentBalanceGrade, RARITY_SEQUENCE, normalizeEquipmentKind } from '../data/EquipmentBalance.js';
import { escapeHtml } from './ItemDisplay.js';

const ROUTE_LABELS = {
    lobby: '整理',
    quest: '任務',
    adventure: '冒險',
    forge: '鍛造',
    casino: '賭場',
    tower: '無盡塔'
};

class GlobalGoalTracker {
    constructor() {
        this.app = null;
        this.container = null;
        this.sceneName = 'lobby';
        this.element = null;
        this.selectedRecipeId = null;
        this.collapsed = false;
        this.subscribed = false;
        this.handleStateChange = this.render.bind(this);
        this.handleQuestChange = this.render.bind(this);
    }

    mount(sceneName, container, app) {
        this.unmount();
        this.sceneName = sceneName;
        this.container = container;
        this.app = app;
        this.selectedRecipeId = sceneName === 'forge' ? this.selectedRecipeId : null;

        if (!this.subscribed) {
            GameManager.subscribe(this.handleStateChange);
            questManager.subscribe(this.handleQuestChange);
            this.subscribed = true;
        }

        this.element = document.createElement('section');
        this.element.className = `global-goal-tracker ${this.collapsed ? 'is-collapsed' : ''}`;
        this.element.setAttribute('aria-label', '全域目標追蹤器');
        this.element.addEventListener('click', event => this.handleClick(event));
        this.container.classList.add('goal-tracker-active');
        this.container.prepend(this.element);
        this.render();
    }

    unmount() {
        if (this.element) {
            this.element.remove();
            this.element = null;
        }
        if (this.container) {
            this.container.classList.remove('goal-tracker-active');
        }
        this.container = null;
    }

    destroy() {
        this.unmount();
        if (this.subscribed) {
            GameManager.unsubscribe(this.handleStateChange);
            questManager.unsubscribe(this.handleQuestChange);
            this.subscribed = false;
        }
    }

    setForgeRecipe(recipeId) {
        this.selectedRecipeId = recipeId || null;
        this.render();
    }

    handleClick(event) {
        const collapseBtn = event.target.closest('[data-goal-collapse]');
        if (collapseBtn) {
            this.collapsed = !this.collapsed;
            this.element?.classList.toggle('is-collapsed', this.collapsed);
            return;
        }

        const action = event.target.closest('[data-goal-route]');
        if (!action) return;

        const route = action.dataset.goalRoute;
        if (!route || route === this.sceneName) return;

        if (this.app?.loadScene) {
            this.app.loadScene(route);
        } else {
            window.location.hash = `#${route}`;
        }
    }

    render() {
        if (!this.element) return;

        const goals = [
            this.buildQuestGoal(),
            this.buildForgeGoal(),
            this.buildEquipmentGoal()
        ].filter(Boolean).slice(0, 3);

        this.element.innerHTML = `
            <div class="goal-tracker-head">
                <div class="goal-tracker-title">
                    <span class="goal-tracker-kicker">目前目標</span>
                    <strong>${escapeHtml(this.getSceneTitle())}</strong>
                </div>
                <button class="goal-collapse-btn" type="button" data-goal-collapse aria-label="收合目標追蹤器">
                    ${this.collapsed ? '展開' : '收合'}
                </button>
            </div>
            <div class="goal-tracker-list">
                ${goals.map(goal => this.renderGoal(goal)).join('')}
            </div>
        `;
    }

    getSceneTitle() {
        if (this.sceneName === 'forge') return '鍛造與素材';
        if (this.sceneName === 'adventure') return '冒險推進';
        if (this.sceneName === 'quest') return '任務追蹤';
        if (this.sceneName === 'tower') return '挑戰準備';
        return '下一步';
    }

    renderGoal(goal) {
        const route = goal.route || 'lobby';
        const progress = Number.isFinite(goal.progress) ? Math.max(0, Math.min(100, goal.progress)) : null;
        const progressHtml = progress === null
            ? ''
            : `<div class="goal-progress"><span style="width:${progress}%"></span></div>`;

        return `
            <button class="goal-card goal-${escapeHtml(goal.tone || 'info')}" type="button" data-goal-route="${escapeHtml(route)}">
                <span class="goal-card-icon">${escapeHtml(goal.icon || '◆')}</span>
                <span class="goal-card-copy">
                    <strong>${escapeHtml(goal.title)}</strong>
                    <span>${escapeHtml(goal.description)}</span>
                    ${progressHtml}
                </span>
                <span class="goal-card-action">${escapeHtml(goal.actionLabel || ROUTE_LABELS[route] || '前往')}</span>
            </button>
        `;
    }

    buildQuestGoal() {
        const completed = questManager.getCompletedQuests()[0];
        if (completed) {
            return {
                icon: '✓',
                tone: 'success',
                title: '任務可領取',
                description: `「${completed.name}」已完成，先領獎避免進度被忽略。`,
                route: 'quest',
                actionLabel: '領取',
                progress: 100
            };
        }

        const active = questManager.getActiveQuests()[0];
        if (active) {
            const objective = this.getNextObjective(active);
            return {
                icon: active.icon || '!',
                tone: 'primary',
                title: `追蹤：${active.name}`,
                description: objective.description,
                route: this.getObjectiveRoute(objective.type),
                actionLabel: ROUTE_LABELS[this.getObjectiveRoute(objective.type)] || '前往',
                progress: objective.progress
            };
        }

        const visible = questManager.getVisibleQuests();
        const available = [...visible.main, ...visible.bounty, ...visible.commission, ...visible.hidden]
            .find(quest => quest.state?.status === QuestStatus.AVAILABLE);

        if (available) {
            return {
                icon: available.icon || '+',
                tone: 'warning',
                title: '有任務可接取',
                description: `「${available.name}」可以接取，接下來的行動會更有方向。`,
                route: 'quest',
                actionLabel: '查看',
                progress: 0
            };
        }

        return {
            icon: '!',
            tone: 'info',
            title: '建立主要目標',
            description: '目前沒有追蹤中的任務，先到任務板選一個目標。',
            route: 'quest',
            actionLabel: '任務',
            progress: 0
        };
    }

    getNextObjective(quest) {
        const progress = quest.state?.progress || [];
        const objectives = quest.objectives || [];
        const firstOpenIndex = progress.findIndex(item => Number(item.current || 0) < Number(item.required || 0));
        const index = firstOpenIndex >= 0 ? firstOpenIndex : 0;
        const objective = objectives[index] || {};
        const state = progress[index] || {};
        const current = Number(state.current || 0);
        const required = Math.max(1, Number(state.required || objective.count || 1));
        const percent = Math.floor((current / required) * 100);

        return {
            type: objective.type || state.type,
            description: `${objective.description || this.getObjectiveFallback(objective)} (${current}/${required})`,
            progress: percent
        };
    }

    getObjectiveFallback(objective) {
        if (!objective) return '推進任務';
        if (objective.type === ObjectiveType.KILL) return `擊敗 ${objective.target}`;
        if (objective.type === ObjectiveType.COLLECT) return `收集 ${objective.target}`;
        if (objective.type === ObjectiveType.EXPLORE) return `探索 ${objective.target}`;
        if (objective.type === ObjectiveType.ENHANCE) return '強化裝備';
        if (objective.type === ObjectiveType.CRAFT) return '製作裝備';
        return '推進任務';
    }

    getObjectiveRoute(type) {
        if (type === ObjectiveType.ENHANCE || type === ObjectiveType.CRAFT) return 'forge';
        if (type === ObjectiveType.GAMBLE_WIN || type === ObjectiveType.GAMBLE_PROFIT) return 'casino';
        if (type === ObjectiveType.DUNGEON_CLEAR || type === ObjectiveType.DUNGEON_BOSS || type === ObjectiveType.DUNGEON_FLOOR) return 'adventure';
        if (type === ObjectiveType.TALK) return 'quest';
        return 'adventure';
    }

    buildForgeGoal() {
        const recipe = this.sceneName === 'forge' && this.selectedRecipeId
            ? RecipeDatabase[this.selectedRecipeId]
            : null;

        if (recipe) {
            const readiness = this.getRecipeReadiness(recipe);
            return {
                icon: '⚒',
                tone: readiness.ready ? 'success' : 'warning',
                title: `鍛造：${recipe.name}`,
                description: readiness.summary,
                route: 'forge',
                actionLabel: readiness.ready ? '製作' : '素材',
                progress: readiness.progress
            };
        }

        const craftable = this.getCraftableRecipes()[0];
        if (craftable) {
            return {
                icon: '⚒',
                tone: 'success',
                title: '有配方可製作',
                description: `${craftable.name} 材料與金幣已足夠，可以回工坊轉成戰力。`,
                route: 'forge',
                actionLabel: '鍛造',
                progress: 100
            };
        }

        const closest = this.getClosestRecipe();
        if (closest) {
            return {
                icon: '◇',
                tone: 'info',
                title: `收集素材：${closest.recipe.name}`,
                description: closest.summary,
                route: 'adventure',
                actionLabel: '收集',
                progress: closest.progress
            };
        }

        return null;
    }

    getCraftableRecipes() {
        const inventory = GameManager.getInventory() || [];
        const warehouse = GameManager.state?.warehouse || [];
        const gold = GameManager.getGold() || 0;

        return Object.values(RecipeDatabase)
            .filter(recipe => canCraft(recipe.id, inventory, warehouse) && gold >= recipe.cost)
            .sort((a, b) => this.getRarityRank(b.rarity) - this.getRarityRank(a.rarity));
    }

    getClosestRecipe() {
        const candidates = Object.values(RecipeDatabase)
            .map(recipe => ({ recipe, readiness: this.getRecipeReadiness(recipe) }))
            .filter(entry => !entry.readiness.ready)
            .sort((a, b) => {
                if (a.readiness.missingUnits !== b.readiness.missingUnits) {
                    return a.readiness.missingUnits - b.readiness.missingUnits;
                }
                return this.getRarityRank(b.recipe.rarity) - this.getRarityRank(a.recipe.rarity);
            });

        const entry = candidates[0];
        if (!entry) return null;

        return {
            recipe: entry.recipe,
            summary: entry.readiness.summary,
            progress: entry.readiness.progress
        };
    }

    getRecipeReadiness(recipe) {
        const materialStatus = (recipe.materials || []).map(mat => {
            const owned = this.getOwnedItemCount(mat.id);
            const required = Number(mat.quantity || 0);
            const material = getMaterial(mat.id);
            return {
                id: mat.id,
                name: material?.name || mat.id,
                owned,
                required,
                need: Math.max(0, required - owned)
            };
        });
        const missing = materialStatus.filter(item => item.need > 0);
        const requiredUnits = materialStatus.reduce((sum, item) => sum + item.required, 0);
        const ownedUnits = materialStatus.reduce((sum, item) => sum + Math.min(item.owned, item.required), 0);
        const gold = GameManager.getGold() || 0;
        const goldNeed = Math.max(0, Number(recipe.cost || 0) - gold);
        const ready = missing.length === 0 && goldNeed === 0;
        let summary = ready
            ? `材料齊全，成功率 ${recipe.successRate ?? 100}%。`
            : missing.slice(0, 2).map(item => `缺 ${item.name} x${item.need}`).join('、');

        if (goldNeed > 0) {
            summary = summary ? `${summary}，還缺 ${goldNeed} 金幣` : `還缺 ${goldNeed} 金幣`;
        }

        if (!summary) summary = '配方素材狀態待確認。';

        return {
            ready,
            missing,
            missingUnits: missing.reduce((sum, item) => sum + item.need, 0) + Math.ceil(goldNeed / 100),
            progress: requiredUnits > 0 ? Math.floor((ownedUnits / requiredUnits) * 100) : 100,
            summary
        };
    }

    getOwnedItemCount(itemId) {
        return [...(GameManager.state?.inventory || []), ...(GameManager.state?.warehouse || [])]
            .filter(stack => stack.item?.id === itemId)
            .reduce((sum, stack) => sum + (stack.quantity || 1), 0);
    }

    getRarityRank(rarity) {
        const index = RARITY_SEQUENCE.indexOf(rarity);
        return index >= 0 ? index : 0;
    }

    buildEquipmentGoal() {
        const char = GameManager.getCharacter();
        const stacks = [...(GameManager.state?.inventory || []), ...(GameManager.state?.warehouse || [])];
        const equipmentStacks = stacks.filter(stack => this.isEquipment(stack.item));

        for (const slot of ['weapon', 'armor', 'accessory']) {
            if (!char.equipment?.[slot]) {
                const candidate = equipmentStacks.find(stack => normalizeEquipmentKind(stack.item?.type) === slot);
                if (candidate) {
                    return {
                        icon: '⚔',
                        tone: 'warning',
                        title: `可裝備${this.getSlotName(slot)}`,
                        description: `${candidate.item.name} 可補上空的${this.getSlotName(slot)}欄位。`,
                        route: 'lobby',
                        actionLabel: '裝備',
                        progress: 30
                    };
                }
            }
        }

        let bestUpgrade = null;
        for (const stack of equipmentStacks) {
            const item = stack.item;
            const slot = normalizeEquipmentKind(item.type);
            const equipped = char.equipment?.[slot];
            if (!equipped) continue;

            const itemGrade = getEquipmentBalanceGrade(item);
            const equippedGrade = getEquipmentBalanceGrade(equipped);
            const delta = itemGrade.score - equippedGrade.score;
            if (delta > 4 && (!bestUpgrade || delta > bestUpgrade.delta)) {
                bestUpgrade = { item, slot, delta };
            }
        }

        if (bestUpgrade) {
            return {
                icon: '↑',
                tone: 'info',
                title: `${this.getSlotName(bestUpgrade.slot)}可替換`,
                description: `${bestUpgrade.item.name} 評分高出約 ${Math.round(bestUpgrade.delta)}，建議回大廳比較裝備。`,
                route: 'lobby',
                actionLabel: '整理',
                progress: 70
            };
        }

        return {
            icon: '◆',
            tone: 'info',
            title: '戰力整理',
            description: '目前沒有明顯裝備替換，優先推進任務或收集鍛造素材。',
            route: this.sceneName === 'forge' ? 'adventure' : 'forge',
            actionLabel: this.sceneName === 'forge' ? '冒險' : '鍛造',
            progress: 50
        };
    }

    isEquipment(item) {
        return ['weapon', 'armor', 'accessory', 'equipment'].includes(String(item?.type || '').toLowerCase());
    }

    getSlotName(slot) {
        return {
            weapon: '武器',
            armor: '防具',
            accessory: '飾品'
        }[slot] || '裝備';
    }
}

export const globalGoalTracker = new GlobalGoalTracker();
export default globalGoalTracker;
