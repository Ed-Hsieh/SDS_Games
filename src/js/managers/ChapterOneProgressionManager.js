import GameManager, { MIA_EMERGENCY_POTION_LIMIT } from './GameManager.js';
import { storySceneManager } from './StorySceneManager.js';
import { mergeEncounterDrops } from './AdventureEncounterManager.js';
import { resolveItemById } from '../utils/ItemResolver.js';
import {
    ChapterOneClosingReportStages,
    ChapterOneInvestigations,
    ChapterOneMantisRecovery,
    ChapterOneProgressFlag,
    ChapterOneRequirement,
    ChapterOneRotrootTrials,
    areChapterOneInvestigationsComplete,
    getChapterOneInvestigation,
    getChapterOneGearQualification,
    getEquippedChapterOneGearQualification,
    getNextChapterOneRotrootTrial,
    readChapterOneObjectiveContext
} from '../data/ChapterOneProgression.js';

const ITEM_RESOLUTION_ORDER = Object.freeze([
    'material',
    'equipment',
    'shop',
    'bossEquipment',
    'rewardItem'
]);

class ChapterOneProgressionManager {
    readFlag(flag) {
        return GameManager.getFlag(flag);
    }

    setFlag(flag, value) {
        if (this.readFlag(flag) === value) return false;
        return GameManager.setFlag(flag, value, { reason: `chapter-one-flag:${flag}` });
    }

    getObjectiveContext() {
        return Object.freeze({
            ...readChapterOneObjectiveContext(flag => this.readFlag(flag)),
            chapterOneGearReady: Boolean(this.getOwnedGearQualification()),
            chapterOneGearEquipped: Boolean(this.getEquippedGearQualification())
        });
    }

    getOwnedGearQualification() {
        const character = GameManager.getCharacter();
        const ownedItems = [
            ...Object.values(character.equipment || {}),
            ...(GameManager.getInventory?.() || []).map(stack => stack?.item),
            ...(GameManager.getWarehouse?.() || []).map(stack => stack?.item)
        ];
        for (const item of ownedItems) {
            const qualification = getChapterOneGearQualification(item);
            if (qualification) return qualification;
        }
        return null;
    }

    getEquippedGearQualification() {
        return getEquippedChapterOneGearQualification(GameManager.getCharacter());
    }

    getNextRotrootTrial() {
        return getNextChapterOneRotrootTrial(flag => this.readFlag(flag));
    }

    getInvestigation(investigationId) {
        return getChapterOneInvestigation(investigationId);
    }

    isInvestigationEvidenceRecorded(investigationId) {
        const investigation = this.getInvestigation(investigationId);
        return Boolean(investigation && this.readFlag(investigation.evidenceFlag));
    }

    getLandmarkAction(entryId) {
        const investigation = this.getInvestigation(entryId);
        const threeLandmarkSceneActive = storySceneManager.getNextAvailableSceneId() === 'ch1_s06_three_landmarks'
            && !storySceneManager.isSceneComplete('ch1_s06_three_landmarks');

        if (investigation && threeLandmarkSceneActive) {
            const previous = investigation.previousId
                ? ChapterOneInvestigations[investigation.previousId]
                : null;
            if (previous && !this.readFlag(previous.evidenceFlag)) {
                return Object.freeze({ type: 'investigation-blocked-previous', investigation, previous });
            }
            if (investigation.id !== 'south_gate_farmland'
                && this.readFlag(ChapterOneInvestigations.south_gate_farmland.evidenceFlag)
                && !this.hasCompletedHomeRecovery()) {
                return Object.freeze({ type: 'investigation-return-home', investigation });
            }
            if (this.readFlag(investigation.victoryFlag)) {
                return Object.freeze({
                    type: this.readFlag(investigation.evidenceFlag)
                        ? 'investigation-recorded'
                        : 'investigation-evidence',
                    investigation
                });
            }
            return Object.freeze({ type: 'investigation-encounter', investigation });
        }

        if (entryId === 'rotroot_ravine'
            && !storySceneManager.isSceneComplete('ch1_s09_rotroot_approach')) {
            const ownedGear = this.getOwnedGearQualification();
            const equippedGear = this.getEquippedGearQualification();
            if (!equippedGear) {
                return Object.freeze({ type: 'rotroot-needs-gear', ownedGear });
            }
            const trial = this.getNextRotrootTrial();
            return Object.freeze(trial
                ? { type: 'rotroot-trial', trial }
                : { type: 'rotroot-story', sceneId: 'ch1_s09_rotroot_approach' });
        }

        return null;
    }

    meetsRequirement(requirementId) {
        if (!requirementId) return true;
        if (requirementId === ChapterOneRequirement.QUALIFYING_GEAR_OWNED) {
            return Boolean(this.getOwnedGearQualification());
        }
        return false;
    }

    hasCompletedHomeRecovery() {
        return Boolean(this.readFlag(ChapterOneProgressFlag.HOME_RECOVERY_KNOWN));
    }

    isFirstReportPending() {
        return Boolean(this.readFlag(ChapterOneProgressFlag.FIRST_REPORT_PENDING))
            && !this.readFlag(ChapterOneProgressFlag.FIRST_REPORT_COMPLETE);
    }

    shouldStartFirstReport() {
        return this.isFirstReportPending() && !this.hasCompletedHomeRecovery();
    }

    shouldAutoStartFirstReport() {
        return this.shouldStartFirstReport()
            && Boolean(this.readFlag(ChapterOneProgressFlag.FIRST_REPORT_AUTO_START));
    }

    needsMiaEmergencyPotionSupport() {
        return GameManager.getEmergencyPotionCount() < MIA_EMERGENCY_POTION_LIMIT;
    }

    queueFirstReportOnTownReturn({ autoStart = false } = {}) {
        const firstEvidence = ChapterOneInvestigations.south_gate_farmland.evidenceFlag;
        if (!this.readFlag(firstEvidence)
            || this.hasCompletedHomeRecovery()
            || this.readFlag(ChapterOneProgressFlag.FIRST_REPORT_COMPLETE)) return false;
        this.setFlag(ChapterOneProgressFlag.FIRST_REPORT_PENDING, true);
        this.setFlag(ChapterOneProgressFlag.FIRST_REPORT_AUTO_START, Boolean(autoStart));
        return true;
    }

    completeFirstReport() {
        this.setFlag(ChapterOneProgressFlag.FIRST_REPORT_PENDING, false);
        this.setFlag(ChapterOneProgressFlag.FIRST_REPORT_AUTO_START, false);
        this.setFlag(ChapterOneProgressFlag.FIRST_REPORT_COMPLETE, true);
    }

    completeHomeRecovery() {
        this.setFlag(ChapterOneProgressFlag.HOME_RECOVERY_KNOWN, true);
    }

    getClosingReportStage() {
        return ChapterOneClosingReportStages.find(stage => !this.readFlag(stage.flag)) || null;
    }

    completeClosingReportStage(stageId) {
        const current = this.getClosingReportStage();
        if (!current || current.id !== stageId) {
            return Object.freeze({ success: false, stage: current, complete: !current });
        }
        this.setFlag(current.flag, true);
        const next = this.getClosingReportStage();
        return Object.freeze({ success: true, stage: current, next, complete: !next });
    }

    completeEvidence(investigationId) {
        const investigation = getChapterOneInvestigation(investigationId);
        if (!investigation) return Object.freeze({ success: false, complete: false });
        this.setFlag(investigation.evidenceFlag, true);
        return Object.freeze({
            success: true,
            complete: areChapterOneInvestigationsComplete(flag => this.readFlag(flag))
        });
    }

    getGuaranteedRewardSource(encounter = {}) {
        const investigationId = encounter.context?.chapterOneInvestigationId;
        const trialId = encounter.context?.chapterOneRotrootTrialId;
        if (investigationId) return getChapterOneInvestigation(investigationId);
        if (trialId) return ChapterOneRotrootTrials.find(entry => entry.id === trialId) || null;
        return encounter.monster?.id === 'ambush_mantis' ? ChapterOneMantisRecovery : null;
    }

    buildGuaranteedDrops(source) {
        return (source?.guaranteedRewards || []).map((reward, index) => {
            const item = resolveItemById(reward.itemId, { order: ITEM_RESOLUTION_ORDER });
            if (!item) {
                return {
                    dropId: `chapter1:${source.id}:${index}:${reward.itemId}`,
                    itemId: reward.itemId,
                    item: null,
                    quantity: reward.quantity,
                    decision: 'unavailable',
                    stored: 'missing'
                };
            }

            return {
                dropId: `chapter1:${source.id}:${index}:${reward.itemId}`,
                itemId: reward.itemId,
                item,
                quantity: reward.quantity,
                reason: reward.reason,
                decision: 'pending',
                stored: null
            };
        });
    }

    settleGuaranteedRewards(encounter, rewards = {}) {
        const source = this.getGuaranteedRewardSource(encounter);
        if (!source) return rewards;

        const alreadyResolved = Boolean(this.readFlag(source.victoryFlag));
        this.setFlag(source.victoryFlag, true);
        if (alreadyResolved) return rewards;

        return {
            ...rewards,
            drops: mergeEncounterDrops([
                ...(rewards.drops || []),
                ...this.buildGuaranteedDrops(source)
            ])
        };
    }

    completeRotrootTrial(trialId) {
        const trial = ChapterOneRotrootTrials.find(entry => entry.id === trialId);
        if (!trial || !this.readFlag(trial.victoryFlag)) {
            return Object.freeze({ success: false, trial: null, next: null, complete: false });
        }
        const next = getNextChapterOneRotrootTrial(flag => this.readFlag(flag));
        return Object.freeze({ success: true, trial, next, complete: !next });
    }
}

export const chapterOneProgressionManager = new ChapterOneProgressionManager();
export default chapterOneProgressionManager;
