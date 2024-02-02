// 
// THIS FILE HAS BEEN GENERATED AUTOMATICALLY
// DO NOT CHANGE IT MANUALLY UNLESS YOU KNOW WHAT YOU'RE DOING
// 
// GENERATED USING @colyseus/schema 2.0.25
// 

import { Schema, type, ArraySchema, MapSchema, SetSchema, DataChange } from '@colyseus/schema';
import { TileData } from './TileData'

export class MapRow extends Schema {
    @type([ TileData ]) public rowData: ArraySchema<TileData> = new ArraySchema<TileData>();
}
