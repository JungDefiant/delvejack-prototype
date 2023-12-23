import { Schema, MapSchema, type } from "@colyseus/schema";
import { PlayerController } from "./PlayerController";

export class RoomState extends Schema {
  @type({ map: PlayerController }) players = new MapSchema<PlayerController>();
}
