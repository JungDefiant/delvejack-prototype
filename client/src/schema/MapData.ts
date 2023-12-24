// 
// THIS FILE HAS BEEN GENERATED AUTOMATICALLY
// DO NOT CHANGE IT MANUALLY UNLESS YOU KNOW WHAT YOU'RE DOING
// 
// GENERATED USING @colyseus/schema 2.0.25
// 

import { Schema, type, ArraySchema, MapSchema, SetSchema, DataChange } from '@colyseus/schema';
import { MapRow } from './MapRow'

export class MapData extends Schema {
    @type([ MapRow ]) public arrayData: ArraySchema<MapRow> = new ArraySchema<MapRow>();
    @type("string") public mapPath!: string;
}
