import { Schema, type } from "@colyseus/schema";
import { InputData } from "./Input";

export class PlayerController extends Schema {
    inputQueue: InputData[] = [];
    @type("number") x: number;
    @type("number") y: number;
    @type("number") velocity: number;
    @type("number") tick: number;
}