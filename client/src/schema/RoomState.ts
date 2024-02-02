// 
// THIS FILE HAS BEEN GENERATED AUTOMATICALLY
// DO NOT CHANGE IT MANUALLY UNLESS YOU KNOW WHAT YOU'RE DOING
// 
// GENERATED USING @colyseus/schema 2.0.25
// 

import { Schema, type, ArraySchema, MapSchema, SetSchema, DataChange } from '@colyseus/schema';
import { Unit } from './Unit'
import { MapData } from './MapData'

export class RoomState extends Schema {
    @type({ map: Unit }) public players: MapSchema<Unit> = new MapSchema<Unit>();
    @type({ map: Unit }) public npcs: MapSchema<Unit> = new MapSchema<Unit>();
    @type(MapData) public currentMap: MapData = new MapData();
}
