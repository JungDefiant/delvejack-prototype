// 
// THIS FILE HAS BEEN GENERATED AUTOMATICALLY
// DO NOT CHANGE IT MANUALLY UNLESS YOU KNOW WHAT YOU'RE DOING
// 
// GENERATED USING @colyseus/schema 2.0.25
// 

import { Schema, type, ArraySchema, MapSchema, SetSchema, DataChange } from '@colyseus/schema';
import { Position } from './Position'
import { Attribute } from './Attribute'
import { InputInfo } from './InputInfo'

export class Unit extends Schema {
    @type("string") public entityId!: string;
    @type("number") public tick!: number;
    @type(Position) public currPos: Position = new Position();
    @type(Position) public destPos: Position = new Position();
    @type({ map: Attribute }) public attributes: MapSchema<Attribute> = new MapSchema<Attribute>();
    @type(InputInfo) public inputInfo: InputInfo = new InputInfo();
}
