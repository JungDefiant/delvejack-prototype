import { Schema, MapSchema, type } from "@colyseus/schema";
import { AttributeModifier } from "./AttributeModifier";

export class Attribute extends Schema {
    @type("number") baseValue: number;
    @type("number") currentValue: number;
    @type({ map: AttributeModifier }) modifiers = new MapSchema<AttributeModifier>();
}