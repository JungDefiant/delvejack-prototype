// 
// THIS FILE HAS BEEN GENERATED AUTOMATICALLY
// DO NOT CHANGE IT MANUALLY UNLESS YOU KNOW WHAT YOU'RE DOING
// 
// GENERATED USING @colyseus/schema 2.0.25
// 

import { Schema, type, ArraySchema, MapSchema, SetSchema, DataChange } from '@colyseus/schema';


export class AbilityEffect extends Schema {
    @type("string") public key!: string;
    @type("string") public targetType!: string;
    @type("string") public durationType!: string;
    @type("string") public targetAttrKey!: string;
    @type("string") public modifierType!: string;
    @type([ "string" ]) public tagsApplied: ArraySchema<string> = new ArraySchema<string>();
}
