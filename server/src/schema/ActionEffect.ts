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

export class ActionEffect {
    key: string;
    targetType: EffectTargetType;
    durationType: EffectDurationType;
    targetAttrKey: string;
    modifierType: EffectModifierType;
    modifierAmount: number;
    tagsApplied: ArraySchema<string> = new ArraySchema<string>();
}