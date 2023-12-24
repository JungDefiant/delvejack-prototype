// 
// THIS FILE HAS BEEN GENERATED AUTOMATICALLY
// DO NOT CHANGE IT MANUALLY UNLESS YOU KNOW WHAT YOU'RE DOING
// 
// GENERATED USING @colyseus/schema 2.0.25
// 

import { Schema, type, ArraySchema, MapSchema, SetSchema, DataChange } from '@colyseus/schema';
import { Unit } from './Unit'

export class RoomState extends Schema {
    @type({ map: Unit }) public playerUnits: MapSchema<Unit> = new MapSchema<Unit>();
}
