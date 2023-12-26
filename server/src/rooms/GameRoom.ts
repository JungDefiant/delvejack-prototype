import { Room, Client } from "@colyseus/core";
import { MapParser } from "../parsers/MapParser";
import { Pathfinder } from "../manager/Pathfinder";
import { RoomState } from "../schema/RoomState";
import { InputData } from "../schema/Input";
import { Unit } from "../schema/Unit";
import { Attribute } from "../schema/Attribute";
import { magnitude } from "../utils/magnitude";
import { MapData } from "../schema/MapData";

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

    this.setSimulationInterval((deltaTime) => {
      this.update(deltaTime);

      while (this.elapsedTime >= this.fixedTimeStep) {
        this.elapsedTime -= this.fixedTimeStep;
        this.fixedTick(this.fixedTimeStep);
      }
    });

    this.state.currentMap = MapParser.ParseMapDataFromJSON("../assets/tilemaps/test_map/test_map.json");
    this.state.currentPathGrid = MapParser.CreateEasyStarMapFromMapData(this.state.currentMap);
    Pathfinder.SetCurrentGrid(this.state.currentPathGrid);
  }

  onJoin(client: Client, options: any) {
    console.log(client.sessionId, "joined!");

    // create Player instance
    const playerUnit = new Unit();

    // place Player at a random position
    playerUnit.currPos.x = 20;
    playerUnit.currPos.y = 20;
    playerUnit.destPos.x = 20;
    playerUnit.destPos.y = 20;
    playerUnit.inputInfo.speedAttrKey = "attr_movespeed";

    const moveSpeedAttr = new Attribute();
    moveSpeedAttr.id = "attr_movespeed";
    moveSpeedAttr.baseValue = moveSpeedAttr.currentValue = 120;
    playerUnit.attributes.set(moveSpeedAttr.id, moveSpeedAttr);

    playerUnit.moveRecharge = Math.round((60 / playerUnit.attributes.get(playerUnit.inputInfo.speedAttrKey).currentValue) * 1000);

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
    this.elapsedTime += this.fixedTimeStep;
  }

  fixedTick(timeStep: number) {
    this.state.playerUnits.forEach(playerUnit => {
      let input: any;
      let hasInput = false;

      // Dequeue player inputs
      while (input = playerUnit.inputQueue.shift()) {
        if (input.pointerX >= this.state.currentMap.width) {
          continue;
        }
        else if (input.pointerY >= this.state.currentMap.height) {
          continue;
        }

        playerUnit.destPos.x = input.pointerX;
        playerUnit.destPos.y = input.pointerY;
        playerUnit.tick = input.tick;
        hasInput = true;
      }

      if (hasInput) {
        Pathfinder.FindPath(playerUnit, this.state.currentMap);
      }
      this.MoveOnPath(playerUnit, timeStep);
    });
  }

  MoveOnPath(unit: Unit, timeStep: number) {
    if (!unit.nextPos) {
      return;
    }

    if (unit.moveTimer < unit.moveRecharge) {
      unit.moveTimer += timeStep;
      return;
    }

    // TO DO: check collision

    unit.currPos = unit.nextPos;
    unit.nextPos = unit.currPath.shift();
    unit.moveTimer = 0;

    if (!unit.nextPos) {
      return;
    }

    console.log(`CURR ${unit.currPos.x}, ${unit.currPos.y}`);
    console.log(`NEXT ${unit.nextPos.x}, ${unit.nextPos.y}`);
    console.log(`DEST ${unit.destPos.x}, ${unit.destPos.y}`);
  }
}
