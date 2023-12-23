import { Room, Client } from "@colyseus/core";
import { RoomState } from "./schema/RoomState";
import { PlayerController } from "./schema/PlayerController";
import { InputData } from "./schema/Input";
import { Unit } from "./schema/units/Unit";

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
      const player = this.state.players.get(client.sessionId);

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
  }

  fixedTick(timeStep: number) {
    const velocity = 2;

    this.state.players.forEach(player => {
      let input: InputData;

      // dequeue player inputs
      while (input = player.inputQueue.shift()) {
        if (input.left) {
          player.x -= velocity;

        } else if (input.right) {
          player.x += velocity;
        }

        if (input.up) {
          player.y -= velocity;

        } else if (input.down) {
          player.y += velocity;
        }

        player.tick = input.tick;
      }
    });
  }

  onJoin(client: Client, options: any) {
    console.log(client.sessionId, "joined!");

    const mapWidth = 800;
    const mapHeight = 600;

    // create Player instance
    const player = new PlayerController();

    // place Player at a random position
    player.x = (Math.random() * mapWidth);
    player.y = (Math.random() * mapHeight);
    player.velocity = 2;

    // place player in the map of players by its sessionId
    // (client.sessionId is unique per connection!)
    this.state.players.set(client.sessionId, player);
  }

  onLeave(client: Client, consented: boolean) {
    console.log(client.sessionId, "left!");
    this.state.players.delete(client.sessionId);
  }

  onDispose() {
    console.log("room", this.roomId, "disposing...");
  }

  update(deltaTime: number) {
    this.state.players.forEach(player => {
      let input: any;

      // dequeue player inputs
      while (input = player.inputQueue.shift()) {
        if (input.left) {
          player.x -= player.velocity;

        } else if (input.right) {
          player.x += player.velocity;
        }

        if (input.up) {
          player.y -= player.velocity;

        } else if (input.down) {
          player.y += player.velocity;
        }
      }
    });
  }

}
