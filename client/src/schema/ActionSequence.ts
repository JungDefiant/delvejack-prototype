// 
// THIS FILE HAS BEEN GENERATED AUTOMATICALLY
// DO NOT CHANGE IT MANUALLY UNLESS YOU KNOW WHAT YOU'RE DOING
// 
// GENERATED USING @colyseus/schema 2.0.25
// 

import { Schema, type, ArraySchema, MapSchema, SetSchema, DataChange } from '@colyseus/schema';


export class ActionSequence extends Schema {
    @type("string") public key!: string;
    @type("string") public actionKey!: string;
    @type("string") public icon!: string;
    @type("number") public rechargeTime!: number;
    @type("string") public resourceAttrKey!: string;
    @type("number") public resourceCost!: number;
}
