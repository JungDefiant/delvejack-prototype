import { Schema, MapSchema, type } from "@colyseus/schema";
import { Position } from "./Position";
import { Attribute } from "../Attribute";
import { EventEmitter } from "tseep";

export class Unit extends Schema {
    @type("string") id: string;
    @type(Position) position = new Position();

    @type({ map: Attribute }) attributes = new MapSchema<Attribute>();

    events: EventEmitter;
}
