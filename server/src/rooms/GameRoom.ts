import { Room, Client } from "@colyseus/core";
import { MapParser } from "../parsers/MapParser";
import { PathfindingSystem } from "../systems/PathfindingSystem";
import { RoomState } from "../schema/RoomState";
import { Unit } from "../schema/Unit";
import { Attribute } from "../schema/Attribute";
import { ActionSequence } from "../schema/ActionSequence";
import { Action, ActionDirectInfo, ActionMoveInfo, ActionType } from "../schema/Action";
import { ActionSystem } from "../systems/ActionSystem";

export class GameRoom extends Room<RoomState> {
  maxClients = 4;

  // TimeStep Settings
  elapsedTime = 0;
  fixedTimeStep = 1000 / 20;

  onCreate(options: any) {
    this.setState(new RoomState());

    this.state.actionSystem = new ActionSystem(this.state);
    this.state.pathfindingSystem = new PathfindingSystem();

    // handle player input
    this.onMessage(0, (client, input) => {
      // get reference to the player who sent the message
      const player = this.state.players.get(client.sessionId);

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
    this.state.pathfindingSystem.SetCurrentGrid(this.state.currentPathGrid);
  }

  onJoin(client: Client, options: any) {
    console.log(client.sessionId, "joined!");

    const playerUnit = this.initializePlayerUnit();

    // place player in the map of players by its sessionId
    // (client.sessionId is unique per connection!)
    this.state.players.set(client.sessionId, playerUnit);
  }

  initializePlayerUnit(): Unit {
    // create Player instance
    const playerUnit = new Unit();

    // place Player at a random position
    playerUnit.currPos.x = 20;
    playerUnit.currPos.y = 20;

    // parse attribute schema and add attributes
    playerUnit.inputInfo.speedAttrKey = "attr_movespeed";

    const moveSpeedAttr = new Attribute();
    moveSpeedAttr.id = "attr_movespeed";
    moveSpeedAttr.baseValue = moveSpeedAttr.currentValue = 4;
    playerUnit.attributes.set(moveSpeedAttr.id, moveSpeedAttr);

    // Add movement ability
    const basicMove = new ActionSequence();
    basicMove.key = "aq_basicMove";
    basicMove.actionKey = "move";
    basicMove.rechargeTime = 0;

    const moveAction = new Action();
    moveAction.key = "a_moveToTile";
    moveAction.actionType = ActionType.PerformMove;
    moveAction.actionInfo = new ActionMoveInfo();
    moveAction.actionInfo.speedModifier = 1;
    moveAction.actionInfo.stopWithinRange = 0;
    moveAction.actionInfo.canRepath = true;
    moveAction.actionInfo.canOverrideWithInput = true;
    moveAction.actionInfo.moveToUnit = false;
    moveAction.castTime = moveSpeedAttr.currentValue * this.fixedTimeStep;

    basicMove.actions.push(moveAction);
    playerUnit.actionInputMap.set(basicMove.actionKey, basicMove);
    playerUnit.rechargeTimes.set(basicMove.actionKey, 0);

    // Add attack ability
    const basicAttack = new ActionSequence();
    basicAttack.key = "aq_basicAttack";
    basicAttack.actionKey = "attack";
    basicAttack.rechargeTime = 1000;

    const attackAction = new Action();
    attackAction.key = "a_attack";
    attackAction.actionType = ActionType.ApplyDirectEffect;
    attackAction.actionInfo = new ActionDirectInfo();
    attackAction.actionInfo.hasProjectile = false;
    attackAction.actionInfo.range = 1;
    attackAction.castTime = 120;  

    basicAttack.actions.push(attackAction);
    playerUnit.actionInputMap.set(basicAttack.actionKey, basicAttack);
    playerUnit.rechargeTimes.set(basicAttack.actionKey, 0);

    return playerUnit;
  }

  onLeave(client: Client, consented: boolean) {
    console.log(client.sessionId, "left!");
    this.state.players.delete(client.sessionId);
  }

  onDispose() {
    console.log("room", this.roomId, "disposing...");
  }

  update(deltaTime: number) {
    this.elapsedTime += this.fixedTimeStep;
  }

  fixedTick(timeStep: number) {
    if(!this.state) {
      return;
    }

    this.state.actionSystem.OnTick(this.state.players, timeStep);
  }

}
