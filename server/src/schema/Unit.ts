import { Schema, MapSchema, SetSchema, type } from "@colyseus/schema";
import { Position } from "./Position";
import { Attribute } from "./Attribute";
import { EventEmitter } from "tseep";
import { InputData } from "./Input";
import { Action, ActionState } from "./Action";
import { ActionSequence, ActionSequenceState } from "./ActionSequence";

export class InputInfo extends Schema {
    @type("string") speedAttrKey: string;
}

export enum UnitType {
    Player = 1 << 1,
    Monster = 1 << 2,
    Trap = 1 << 3,
    Wall = 1 << 4
}

export class Unit extends Schema {
    @type("string") entityId: string;
    @type("number") tick: number;
    unitType: UnitType;
    events: EventEmitter;

    // Transform
    @type(Position) currPos = new Position();

    // Attributes
    @type({ map: Attribute }) attributes = new MapSchema<Attribute>();
    @type({ map: "number"}) rechargeTimes = new MapSchema<number>();
    @type({ set: "string" }) tags = new SetSchema<string>();

    // Input settings
    inputQueue: InputData[] = [];
    currentInput: InputData;
    inputInfo = new InputInfo();

    // Action settings
    actionInputMap: Map<string, ActionSequence> = new Map<string, ActionSequence>();
    queuedActionSequence: ActionSequence;
    currentActionSequence: ActionSequence;
    currentActionSeqState: ActionSequenceState;
    currentAction: Action;
    currentActionState: ActionState;
}
