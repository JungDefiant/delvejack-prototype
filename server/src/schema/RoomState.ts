import { Schema, MapSchema, type } from "@colyseus/schema";
import { Unit } from "./Unit";
import { MapData } from "./MapData";

export class RoomState extends Schema {
  @type({ map: Unit }) playerUnits = new MapSchema<Unit>();
  @type(MapData) currentMap: MapData;
  currentPathGrid: number[][];

}
