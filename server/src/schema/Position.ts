import { Schema, type } from "@colyseus/schema";

export class Position extends Schema {
    @type("number") x: number;
    @type("number") y: number;

    constructor (_x?: number, _y?: number) {
        super();
        this.x = _x;
        this.y = _y;
    }
}