
import { MapSchema } from "@colyseus/schema";
import { Action, ActionMoveInfo, ActionMoveState, ActionState, ActionType } from "../schema/Action";
import { ActionSequenceState } from "../schema/ActionSequence";
import { InputData } from "../schema/Input";
import { Unit, UnitType } from "../schema/Unit";
import { ISystem } from "./ISystem";
import { Position } from "../schema/Position";
import { RoomState } from "../schema/RoomState";
import { magnitude } from "../utils/magnitude";
import { ActionEffect, EffectModifierType, EffectTargetType } from "../schema/ActionEffect";
import fs from "fs";
import { GetUnitAtPosition, SetUnitToTile } from "../utils/mapUtils";

export class ActionSystem implements ISystem {

    currentTick: number;
    state: RoomState;
    effectData: any;

    constructor(_state: RoomState) {
        this.state = _state;
        this.effectData = JSON.parse(fs.readFileSync("./src/data/abilities/d_effects.json", "utf-8"));
    }

    OnTick(units: MapSchema<Unit>, timeStep: number) {
        units.forEach((unit: Unit) => {
            let input: InputData;

            // Dequeue player inputs
            while (input = unit.inputQueue.shift()) {
                if (!input) {
                    continue;
                }

                const targetPositionX = unit.currPos.x + input.directionX;
                const targetPositionY = unit.currPos.y + input.directionY;
                if (targetPositionX > Math.floor(this.state.currentMap.width / this.state.currentMap.gridSize) ||
                    targetPositionY > Math.floor(this.state.currentMap.height / this.state.currentMap.gridSize) ||
                    targetPositionX < 0 ||
                    targetPositionY < 0 ||
                    input.actionKey === "") {
                    continue;
                }

                unit.currentInput = input;
                
                const actionSeq = unit.actionInputMap.get(input.actionKey);
                if(unit.rechargeTimes.get(input.actionKey) >= actionSeq.rechargeTime) {
                    if(unit.currentActionSequence || !unit.currentActionSequence) {
                        unit.queuedActionSequence = actionSeq;
                    }
                }
                unit.tick = input.tick;
            }

            const qActionSeq = unit.queuedActionSequence;
            const cActionSeq = unit.currentActionSequence;
            const cActionState = unit.currentActionState;

            if (!cActionSeq && qActionSeq && unit.currentInput) {
                unit.currentActionSequence = unit.queuedActionSequence;
                unit.currentActionSeqState = new ActionSequenceState();
                unit.currentActionSeqState.currentSeqInd = 0;
                unit.currentActionSeqState.targetPos = new Position(unit.currPos.x + unit.currentInput.directionX, unit.currPos.y + unit.currentInput.directionY);

                unit.queuedActionSequence = null;
                unit.currentInput = null;
                this.OnCastActionSequence(unit, timeStep);
            }
            else if (cActionSeq && cActionState && !cActionState.isCasting) {
                this.OnTickActionSequence(unit, timeStep);
            }

            unit.rechargeTimes.forEach((val, key) => {
                const rechargeTime = unit.actionInputMap.get(key).rechargeTime;
                unit.rechargeTimes.set(key, Math.min(val + timeStep, rechargeTime));
            });
        });
    }

    TransitionToNextAction(source: Unit, timeStep: number) {
        source.currentActionSeqState.currentSeqInd++;
        this.OnCastActionSequence(source, timeStep);
    }

    OnStartCasting(source: Unit, timeStep: number, func: Function) {
        const action = source.currentAction;
        const actionState = source.currentActionState;

        if (action.castTime > 0) {
            actionState.isCasting = true;
            setTimeout(() => {
                actionState.isCasting = false;
                func(this.state, source, action.castTime + timeStep)
            }, action.castTime);
        }
        else {
            func(this.state, source, timeStep);
        }
    }

    OnCastActionSequence(source: Unit, timeStep: number) {
        const action = source.currentActionSequence.actions.at(source.currentActionSeqState.currentSeqInd);
        if (!action) {
            this.OnEndActionSequence(source, timeStep);
            return;
        }

        switch (action.actionType) {
            case ActionType.ApplyDirectEffect:
                source.currentAction = action;
                source.currentActionState = new ActionState();
                this.OnStartCasting(source, timeStep, this.OnCastDirectAction);
                break;
            case ActionType.PerformMove:
                source.currentAction = action;
                source.currentActionState = new ActionMoveState();
                this.OnStartCasting(source, timeStep, this.OnCastMoveAction);
                break;
            case ActionType.PerformDash:
                break;
            case ActionType.PerformBlink:
                break;
            case ActionType.SpawnProjectiles:
                break;
            case ActionType.SpawnAreaOfEffect:
                break;
        }
    }

    OnTickActionSequence(source: Unit, timeStep: number) {
        const action = source.currentAction;
        if (!action) {
            return;
        }

        switch (action.actionType) {
            case ActionType.ApplyDirectEffect:
                return;
            case ActionType.PerformMove:
                this.OnTickMoveAction(source, timeStep);
                return;
            case ActionType.PerformDash:
                return;
            case ActionType.PerformBlink:
                return;
            case ActionType.SpawnProjectiles:
                return;
            case ActionType.SpawnAreaOfEffect:
                return;
        }
    }

    OnInterruptActionSequence(source: Unit, timeStep: number) {
        const action = source.currentAction;
        if (!action) {
            return;
        }

        switch (action.actionType) {
            case ActionType.ApplyDirectEffect:
                break;
            case ActionType.PerformMove:
                break;
            case ActionType.PerformDash:
                break;
            case ActionType.PerformBlink:
                break;
            case ActionType.SpawnProjectiles:
                break;
            case ActionType.SpawnAreaOfEffect:
                break;
        }

        this.OnEndActionSequence(source, timeStep);
    }

    OnEndActionSequence(source: Unit, timeStep: number) {
        source.rechargeTimes.set(source.currentActionSequence.actionKey, 0);
        
        source.currentAction = null;
        source.currentActionState = null;
        source.currentActionSequence = null;
        source.currentActionSeqState = null;

        if(source.queuedActionSequence) {
            source.currentActionSequence = source.queuedActionSequence;
            source.currentActionSeqState = new ActionSequenceState();
            source.currentActionSeqState.currentSeqInd = 0;
            source.currentActionSeqState.targetPos = new Position(source.currPos.x + source.currentInput.directionX, source.currPos.y + source.currentInput.directionY);

            source.queuedActionSequence = null;
            source.currentInput = null;
            this.OnCastActionSequence(source, timeStep);
        }
    }

    CheckTargetFilter(target: Unit, filter: number): boolean {
        if (filter === 0) {
            return true;
        }
        Object.values(UnitType).forEach((val) => {
            const uType = val as UnitType;
            if ((filter & uType) === uType) {
                return true;
            }
        })
        return false;
    }

    // Direct Action Functions
    OnCastDirectAction(roomState: RoomState, source: Unit, timeStep: number) {
        const actionSystem = roomState.actionSystem;
        const target = GetUnitAtPosition(roomState.currentMap, source.currentActionSeqState.targetPos);
        actionSystem.ApplyEffectsToTargets(roomState, source, [target]);
        actionSystem.OnEndAction(source, timeStep);
    }

    OnTickDirectAction(source: Unit, timeStep: number) {
    }

    ApplyEffectsToTargets(roomState: RoomState, source: Unit, targets: Unit[]) {
        const actionSystem = roomState.actionSystem;
        const filter = source.currentAction.targetFilter;

        targets.forEach(target => {
            if (actionSystem.CheckTargetFilter(target, filter)) {
                // Get and apply effects
                source.currentAction.effectKeyArray.forEach((key) => {
                    const eff = actionSystem.effectData[key] as ActionEffect;
                    if(eff.targetType === EffectTargetType.Target) {
                        actionSystem.ApplyEffectToUnit(roomState, eff, source, source);
                    }
                    else if (eff.targetType === EffectTargetType.Caster) {
                        actionSystem.ApplyEffectToUnit(roomState, eff, source, target);
                    }
                });
            }
        });
    }

    ApplyEffectToUnit(roomState: RoomState, effect: ActionEffect, source: Unit, target: Unit) {
        // Apply tags
        effect.tagsApplied.forEach((tag) => {
            if(!target.tags.has(tag)) {
                target.tags.add(tag);
            }
        })
        
        // Modify target attributes
        const targetAttr = target.attributes.get(effect.targetAttrKey);
        if(!targetAttr) {
            console.error("Target attribute not found!");
            return;
        }

        switch(effect.modifierType) {
            case EffectModifierType.AddSubtract:
                targetAttr.currentValue += effect.modifierAmount;
            case EffectModifierType.Divide:
                targetAttr.currentValue *= 1 / effect.modifierAmount;
            case EffectModifierType.Multiply:
                targetAttr.currentValue *= effect.modifierAmount;
            case EffectModifierType.Override:
                targetAttr.currentValue = effect.modifierAmount;
        }
    }



    // Move Action Functions
    OnCastMoveAction(roomState: RoomState, source: Unit, timeStep: number) {
        const actionState = source.currentActionState as ActionMoveState;
        actionState.currentTick = timeStep;
        actionState.currentPath = null;
        actionState.nextPos = source.currentActionSeqState.targetPos;

        // roomState.actionSystem.OnTickMoveAction(source, timeStep);
        // const speedAttr = source.attributes.get(source.inputInfo.speedAttrKey);
        // actionState.timePerMove = (1 / speedAttr.currentValue)
        //     * (source.currentAction.actionInfo as ActionMoveInfo).speedModifier
        //     * 1000;
        // actionState.currentDelay = 0;
        // roomState.pathfindingSystem.FindPath(source, source.currentActionSeqState.targetPos, source.currentActionState as ActionMoveState);
    }

    OnTickMoveAction(source: Unit, timeStep: number) {
        const actionState = source.currentActionState as ActionMoveState;
        const actionInfo = source.currentAction.actionInfo as ActionMoveInfo;

        // Interrupt this action if another input is done and it can be overidden with input
        if (actionInfo.canOverrideWithInput 
            && source.currentInput 
            && source.queuedActionSequence 
            && source.queuedActionSequence.key !== source.currentActionSequence.key) {
            this.OnInterruptAction(source, timeStep);
            return;
        }

        // End the action sequence if there's no next position
        if (!actionState.nextPos) {
            this.OnEndAction(source, timeStep);
            return;
        }

        // Check collision, call OnInterruptMoveAction if collision
        if (GetUnitAtPosition(this.state.currentMap, actionState.nextPos)) {
            this.OnInterruptAction(source, timeStep);
            return;
        }

        // Set new position
        SetUnitToTile(this.state.currentMap, source.currPos, null);
        SetUnitToTile(this.state.currentMap, actionState.nextPos, source);
        source.currPos = actionState.nextPos;
        actionState.nextPos = null;

        if (!actionState.nextPos) {
            return;
        }
    }

    // Dash Action Functions
    OnCastDashAction(roomState: RoomState, source: Unit, timeStep: number) {
    }

    OnTickDashAction(source: Unit, timeStep: number) {
    }

    // Blink Action Functions
    OnCastBlinkAction(roomState: RoomState, source: Unit, timeStep: number) {
    }

    OnTickBlinkAction(source: Unit, timeStep: number) {
    }

    // Projectile Action Functions
    OnCastProjectileAction(roomState: RoomState, source: Unit, timeStep: number) {
    }

    OnTickProjectileAction(source: Unit, timeStep: number) {
    }

    // Area Of Effect Action Functions
    OnCastAreaOfEffectAction(roomState: RoomState, source: Unit, timeStep: number) {
    }

    OnTickAreaOfEffectAction(source: Unit, timeStep: number) {
    }

    // Interrupting and ending actions
    OnInterruptAction(source: Unit, timeStep: number) {
        this.OnInterruptActionSequence(source, timeStep);
    }

    OnEndAction(source: Unit, timeStep: number) {
        source.currentAction = null;
        source.currentActionState = null;
        this.TransitionToNextAction(source, timeStep);
    }
}