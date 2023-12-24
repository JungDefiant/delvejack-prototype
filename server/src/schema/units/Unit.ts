import { Schema, MapSchema, ArraySchema, type } from "@colyseus/schema";
import { Position } from "./Position";
import { Attribute } from "../Attribute";
import { EventEmitter } from "tseep";
import { InputData } from "../Input";

export class InputInfo extends Schema {
    @type("string") speedAttrKey: string;
}

export class Unit extends Schema {
    inputQueue: InputData[];
    @type("string") entityId: string;
    @type("number") tick: number;

    // Pathfinding settings
    @type("number") pathIndex: number;
    @type("boolean") isMoving: boolean;
    @type(Position) currPos = new Position();
    @type(Position) destPos = new Position();
    @type({ array: Position }) currPath = new ArraySchema<Position>();

    // Other settings
    @type({ map: Attribute }) attributes = new MapSchema<Attribute>();
    @type(InputInfo) inputInfo = new InputInfo();

    events: EventEmitter;
}
