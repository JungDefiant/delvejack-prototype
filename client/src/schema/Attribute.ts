// 
// THIS FILE HAS BEEN GENERATED AUTOMATICALLY
// DO NOT CHANGE IT MANUALLY UNLESS YOU KNOW WHAT YOU'RE DOING
// 
// GENERATED USING @colyseus/schema 2.0.25
// 

import { Schema, type, ArraySchema, MapSchema, SetSchema, DataChange } from '@colyseus/schema';
import { AttributeModifier } from './AttributeModifier'

export class Attribute extends Schema {
    @type("string") public id!: string;
    @type("string") public fullName!: string;
    @type("string") public abbrevName!: string;
    @type("number") public baseValue!: number;
    @type("number") public currentValue!: number;
    @type({ map: AttributeModifier }) public modifiers: MapSchema<AttributeModifier> = new MapSchema<AttributeModifier>();
}
