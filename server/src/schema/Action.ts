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

export class ActionDirectState {
    nextPos: Position;
    currentDelay: number;
    currentTick: number;
    timePerMove: number;
    currentPath: Position[];
}

export class ActionState {
    isCasting: boolean;
    currCastTime: number;
}

export class ActionDirectInfo {
    hasProjectile: boolean;
    projectileSpeed: number;
    range: number;
    // @type(FxInfo) onCreateFxInfo: FxInfo;
    // @type(FxInfo) onProjectileTickFxInfo: FxInfo;
    // @type(FxInfo) onHitFxInfo: FxInfo;
}

export class ActionMoveState extends ActionState {
    nextPos: Position;
    currentDelay: number;
    currentTick: number;
    timePerMove: number;
    currentPath: Position[];
}

export class ActionMoveInfo {
    animationKey: string;
    speedModifier: number;
    stopWithinRange: number;
    canRepath: boolean;
    canOverrideWithInput: boolean;
    moveToUnit: boolean;
}

export class ActionBlinkState extends ActionState {
    currentDelay: number;
    currentTick: number;
}

export class ActionBlinkInfo {
    animationKey: string;
    delay: number;
    minRange: number;
    maxRange: number;
}

export class ActionDashState extends ActionState {
    nextPos: Position;
    currentDelay: number;
    currentTick: number;
}

export class ActionDashInfo {
    animationKey: string;
    speed: number;
    stopOnObstacle: boolean;
    minRange: number;
    maxRange: number;
}

export class ActionProjState extends ActionState {
    nextPos: Position;
    currentDelay: number;
    currentTick: number;
    // projectiles: Projectile[];
}

export class ActionProjInfo {
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

export class ActionAoEState extends ActionState {
    nextPos: Position;
    currentDelay: number;
    currentTick: number;
    // area: AreaEffect
}

export class ActionAoEInfo {
    destroyOnHit: boolean;
    originType: AoeOriginType;
    shapeType: AoeShapeType;
    // @type(FxInfo) onCreateFxInfo: FxInfo;
    // @type(FxInfo) onTickFxInfo: FxInfo;
    // @type(FxInfo) onHitFxInfo: FxInfo;
    speed: number;
    size: number;
    delay: number;
    duration: number;
    tickRate: number;
}

export class Action extends Schema {
    @type("string") key: string;
    @type("string") icon: string;
    @type("string") actionType: ActionType;
    @type("number") durationTime: number;
    @type("number") castTime: number;
    @type("string") castAnimation: number;
    // @type(FxInfo) castFxInfo: FxInfo;
    @type("number") tickRate: number;
    @type(["string"]) effectKeyArray: ArraySchema<string> = new ArraySchema<string>();
    targetFilter: number;
    actionInfo: ActionDirectInfo | ActionMoveInfo | ActionDashInfo | ActionBlinkInfo | ActionProjInfo | ActionAoEInfo;
    specialBehaviorScript: string;
}