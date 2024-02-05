import { Schema, MapSchema, type } from "@colyseus/schema";
import { Unit } from "./Unit";
import { MapData } from "./MapData";
import { ActionSystem } from "../systems/ActionSystem";
import { PathfindingSystem } from "../systems/PathfindingSystem";

export class RoomState extends Schema {
  @type({ map: Unit }) players = new MapSchema<Unit>();
  @type({ map: Unit }) npcs = new MapSchema<Unit>();
  @type(MapData) currentMap: MapData;
}
