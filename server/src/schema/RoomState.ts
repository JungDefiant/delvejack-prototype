import { Schema, MapSchema, type } from "@colyseus/schema";
import { Unit } from "./units/Unit";

export class RoomState extends Schema {
  @type({ map: Unit }) playerUnits = new MapSchema<Unit>();
}
