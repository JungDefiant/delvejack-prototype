// 
// THIS FILE HAS BEEN GENERATED AUTOMATICALLY
// DO NOT CHANGE IT MANUALLY UNLESS YOU KNOW WHAT YOU'RE DOING
// 
// GENERATED USING @colyseus/schema 2.0.25
// 

import { Schema, type, ArraySchema, MapSchema, SetSchema, DataChange } from '@colyseus/schema';


export class Action extends Schema {
    @type("string") public key!: string;
    @type("string") public icon!: string;
    @type("string") public actionType!: string;
    @type("number") public durationTime!: number;
    @type("number") public castTime!: number;
    @type("string") public castAnimation!: string;
    @type("number") public tickRate!: number;
    @type([ "string" ]) public effectKeyArray: ArraySchema<string> = new ArraySchema<string>();
}
