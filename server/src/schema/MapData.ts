import { Schema, ArraySchema, type } from "@colyseus/schema";
import { Unit } from "./Unit";

export class TileData extends Schema {
    @type("boolean") isWall: boolean;
    @type(Unit) occupyingUnit: Unit;
}

export class MapRow extends Schema {
    @type([TileData]) rowData = new ArraySchema<TileData>();
}

export class MapData extends Schema {
    @type([MapRow]) arrayData = new ArraySchema<MapRow>();
    @type("string") mapPath: string;
    @type("number") gridSize: number;
    height: number;
    width: number;
}