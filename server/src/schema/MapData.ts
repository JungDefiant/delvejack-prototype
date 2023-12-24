import { Schema, ArraySchema, type } from "@colyseus/schema";

export class MapRow extends Schema {
    @type(["number"]) rowData = new ArraySchema<number>();
}

export class MapData extends Schema {
    @type([MapRow]) arrayData = new ArraySchema<MapRow>();
    @type("string") mapPath: string;
}