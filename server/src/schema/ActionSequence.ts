import { Schema, ArraySchema, MapSchema, type } from "@colyseus/schema";
import { Action } from "./Action";
import { Position } from "./Position";

export enum RangeType {
    NO_TARGET = "NO_TARGET",
    POINT = "POINT",
    DIRECT = "DIRECT"
}

export class ActionVariable extends Schema {
    @type("string") name: string;
    @type("number") value: number;
}

export class ActionSequenceState {
    currentRechargeTime: number;
    currentTick: number;
    currentSeqInd: number;
    targetPos: Position;
}

export class TargetingInfo {
    rangeType: RangeType;
    rangeValue: number;
    specialBehaviorScript: string;
}

export class ActionSequence extends Schema {
    @type("string") key: string;
    @type("string") actionKey: string;
    @type("string") icon: string;
    @type("number") rechargeTime: number;
    @type("string") resourceAttrKey: string;
    @type("number") resourceCost: number;
    targetingInfo: TargetingInfo;
    actions: ArraySchema<Action> = new ArraySchema<Action>();
    actionVariables = new MapSchema<ActionVariable>();
    specialBehaviorScript: string;
}