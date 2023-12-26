import { Schema, ArraySchema, type } from "@colyseus/schema";

export enum EffectTargetType {
    Caster = "Caster",
    Target = "Target",
}

export enum EffectDurationType {
    Instant = "Instant",
    Duration = "Duration",
    Indefinite = "Indefinite"
}

export enum EffectModifierType {
    AddSubtract = "AddSubtract",
    Multiply = "Multiply",
    Divide = "Divide",
    Override = "Override"
}

export class AbilityEffect extends Schema {
    @type("string") key: string;
    @type("string") targetType: EffectTargetType;
    @type("string") durationType: EffectDurationType;
    @type("string") targetAttrKey: string;
    @type("string") modifierType: EffectModifierType;
    @type(["string"]) tagsApplied: ArraySchema<string> = new ArraySchema<string>();
}