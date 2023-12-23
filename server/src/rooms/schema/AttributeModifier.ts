import { Schema, type } from "@colyseus/schema";

enum AttrModType {
    AddSubtract,
    Multiply,
    Divide,
    Override
}

export class AttributeModifier extends Schema {
    @type("string") name: string;
    @type("uint8") type: AttrModType;
    @type("number") amount: number;
}