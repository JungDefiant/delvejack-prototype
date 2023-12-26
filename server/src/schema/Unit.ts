import { Schema, MapSchema, ArraySchema, type } from "@colyseus/schema";
import { Position } from "./Position";
import { Attribute } from "./Attribute";
import { EventEmitter } from "tseep";
import { InputData } from "./Input";

export class InputInfo extends Schema {
    @type("string") speedAttrKey: string;
}

export class Unit extends Schema {
    inputQueue: InputData[] = [];
    @type("string") entityId: string;
    @type("number") tick: number;

    // Pathfinding settings
    isMoving: boolean;
    pathIndex: number;
    currPath: Position[] = [];
    nextPos: Position;
    destPos: Position = new Position();
    @type(Position) currPos = new Position();

    // Action settings
    moveTimer: number;
    moveRecharge: number;

    // Other settings
    @type({ map: Attribute }) attributes = new MapSchema<Attribute>();
    @type(InputInfo) inputInfo = new InputInfo();

    events: EventEmitter;
}
