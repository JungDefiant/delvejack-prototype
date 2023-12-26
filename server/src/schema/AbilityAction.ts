import { Schema, ArraySchema, type } from "@colyseus/schema";
import { Position } from "./Position";
import { Unit } from "./Unit";

export enum ActionType {
    ApplyDirectEffect = "ApplyDirectEffect",
    PerformMove = "PerformMove",
    PerformDash = "PerformDash",
    PerformBlink = "PerformBlink",
    SpawnProjectiles = "SpawnProjectiles",
    SpawnAreaOfEffect = "SpawnAreaOfEffect"
}

interface ActionInfo {
}

export class ActionMoveInfo implements ActionInfo {
    animationKey: string;
    speed: number;
    destination: Position;
    currentTimer: Position;
}

export class ActionBlinkInfo implements ActionInfo {
    animationKey: string;
    delay: number;
    minRange: number;
    maxRange: number;
    destination: Position;
}

export class ActionDashInfo implements ActionInfo{
    animationKey: string;
    speed: number;
    stopOnObstacle: boolean;
    minRange: number;
    maxRange: number;
    destination: Position;
    currentTimer: Position;
}

export class ActionProjInfo implements ActionInfo {
    destroyOnHit: boolean;
    speed: number;
    range: number;
    amount: number;
    spread: number;
    hasWaves: boolean;
    waves: number;
    interval: number;
    // @type(FxInfo) onCreateFxInfo: FxInfo;
    // @type(FxInfo) onTickFxInfo: FxInfo;
    // @type(FxInfo) onHitFxInfo: FxInfo;
    currPos: Position;
    destPos: Position;
}

export enum AoeOriginType {
    Source = "Source",
    Target = "Target",
    Point = "Point",
}

export enum AoeShapeType {
    Burst = "Burst",
    Spray = "Spray",
    Line = "Line",
}

export class ActionAoeInfo implements ActionInfo {
    destroyOnHit: boolean;
    originType: AoeOriginType;
    shapeType: AoeShapeType;
    // @type(FxInfo) onCreateFxInfo: FxInfo;
    // @type(FxInfo) onTickFxInfo: FxInfo;
    // @type(FxInfo) onHitFxInfo: FxInfo;
    speed: number;
    size: number;
    amount: number;
    delay: number;
    duration: number;
    tickRate: number;
    targetTile: Position;
}

export class AbilityAction extends Schema {
    @type("string") key: string;
    @type("string") icon: ActionType;
    @type(["string"]) effectKeyArray: ArraySchema<string> = new ArraySchema<string>();
    @type(["string"]) targetFilterArray: ArraySchema<string> = new ArraySchema<string>();
    @type("number") durationTime: number;
    @type("number") tickRate: number;
    // @type(FxInfo) onTickFxInfo: FxInfo;
    actionInfo: ActionInfo;
    specialBehaviorScript: string;
    currentRecharge: number;
    currentDuration: number;
}