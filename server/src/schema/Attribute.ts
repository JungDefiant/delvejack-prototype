import { Schema, MapSchema, type } from "@colyseus/schema";
import { AttributeModifier } from "./AttributeModifier";

export class Attribute extends Schema {
    @type("string") id: string;
    @type("string") fullName: string;
    @type("string") abbrevName: string;
    @type("number") baseValue: number;
    @type("number") currentValue: number;
    @type("number") lastTickChange: number;
    @type({ map: AttributeModifier }) modifiers = new MapSchema<AttributeModifier>();
}