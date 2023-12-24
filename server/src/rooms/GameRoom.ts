import { Room, Client } from "@colyseus/core";
import { RoomState } from "./schema/RoomState";
import { InputData } from "./schema/Input";
import { MapParser } from "../parsers/MapParser";
import { Pathfinder } from "../manager/Pathfinder";
import { Unit } from "./schema/units/Unit";
import { Attribute } from "./schema/Attribute";

export class GameRoom extends Room<RoomState> {
  maxClients = 4;

  // TimeStep Settings
  elapsedTime = 0;
  fixedTimeStep = 1000 / 40;

  onCreate(options: any) {
    this.setState(new RoomState());

    // handle player input
    this.onMessage(0, (client, input) => {
      // get reference to the player who sent the message
      const player = this.state.playerUnits.get(client.sessionId);

      // enqueue input to user input buffer.
      player.inputQueue.push(input);
    });

    let elapsedTime = 0;
    this.setSimulationInterval((deltaTime) => {
      this.update(deltaTime);

      while (elapsedTime >= this.fixedTimeStep) {
        elapsedTime -= this.fixedTimeStep;
        this.fixedTick(this.fixedTimeStep);
      }
    });

    MapParser.ParseMapDataFromJSON("../shared/tilemaps/test_map/test_map.json");
  }

  fixedTick(timeStep: number) {
    const velocity = 2;

    this.state.playerUnits.forEach(player => {
      let input: InputData;

      // dequeue player inputs
      while (input = player.inputQueue.shift()) {
        

        player.tick = input.tick;
      }
    });
  }

  onJoin(client: Client, options: any) {
    console.log(client.sessionId, "joined!");

    const mapWidth = 800;
    const mapHeight = 640;

    // create Player instance
    const playerUnit = new Unit();

    // place Player at a random position
    playerUnit.currPos.x = 0;
    playerUnit.currPos.x = 0;
    playerUnit.inputInfo.speedAttrKey = "attr_movespeed";

    const moveSpeedAttr = new Attribute();
    moveSpeedAttr.id = "attr_movespeed";
    moveSpeedAttr.baseValue = moveSpeedAttr.currentValue = 2;
    playerUnit.attributes.set(moveSpeedAttr.id, moveSpeedAttr);

    // place player in the map of players by its sessionId
    // (client.sessionId is unique per connection!)
    this.state.playerUnits.set(client.sessionId, playerUnit);
  }

  onLeave(client: Client, consented: boolean) {
    console.log(client.sessionId, "left!");
    this.state.playerUnits.delete(client.sessionId);
  }

  onDispose() {
    console.log("room", this.roomId, "disposing...");
  }

  update(deltaTime: number) {
    this.state.playerUnits.forEach(playerUnit => {
      let input: any;

      // Dequeue player inputs
      while (input = playerUnit.inputQueue.shift()) {
        playerUnit.destPos.x = input.pointerX;
        playerUnit.destPos.y = input.pointerY;
      }

      Pathfinder.FindPath(playerUnit.entityId, playerUnit);
      Pathfinder.MoveOnPath(playerUnit, deltaTime);
    });
  }

}
