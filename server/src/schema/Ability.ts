import { Schema, type } from "@colyseus/schema";

export class Ability extends Schema {
    @type("string") icon: string;
    @type("number") rechargeTime: number;
    @type("number") castTime: number;
    @type("string") castAnimation: number;
    // @type(FxInfo) castFxInfo: FxInfo;
    @type("string") resourceAttrKey: string;
    @type("number") resourceCost: number;
    // @type(TargetingInfo) targetingInfo: TargetingInfo;
    // @type([AbilityActionInfo]) abilityActionSequence: ArraySchema<AbilityActionInfo> = new ArraySchema<AbilityActionInfo>();
    // @type({ map: AbilityVariable }) abilityVariables = new MapSchema<AbilityVariable>();
    @type("string") specialBehaviorScript: string;
    currentRecharge: number;
}