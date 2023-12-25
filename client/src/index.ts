import { Client, Room } from "colyseus.js";
import Phaser, { Tilemaps } from "phaser";
import { RoomState } from "./schema/RoomState";
import { convertPixelPositionToGridPosition } from "./utils/positionConversion";

interface InputData {
    pointerX: number,
    pointerY: number,
    sent: boolean
}

// custom scene class
export class GameScene extends Phaser.Scene {

    // Phase Room Settings
    client = new Client("ws://localhost:2567");
    room: Room<RoomState>;
    playerEntities: { [sessionId: string]: any } = {};
    currentPlayer: Phaser.Types.Physics.Arcade.ImageWithDynamicBody;
    remoteRef: Phaser.GameObjects.Rectangle;

    // Input Settings
    inputPayload = {
        pointerX: 0,
        pointerY: 0,
        sent: false
    };

    // Map Settings
    currentMap: Tilemaps.Tilemap;
    currentTileset: Tilemaps.Tileset;
    gridSize = 16;
    isLMBHeld = false;

    // TimeStep Settings
    elapsedTime = 0;
    fixedTimeStep = 1000 / 40;

    preload() {
        // Load images
        this.load.image('ship_0001', 'https://cdn.glitch.global/3e033dcd-d5be-4db4-99e8-086ae90969ec/ship_0001.png');
        this.load.image('base_tiles', '/assets/tilemaps/test_map/Tiles.png');

        // Load tile JSONs
        this.load.tilemapTiledJSON('test_tilemap', '/assets/tilemaps/test_map/test_map.json');

        this.input.mouse!.enabled = true;
    }

    async create() {
        console.log("Joining room...");

        try {
            this.room = await this.client.joinOrCreate("my_room");
            console.log("Joined successfully!");

        } catch (e) {
            console.error(e);
        }

        if (!this.room) {
            return;
        }

        this.room.state.currentMap.onChange(() => {
            console.log("GENERATE MAP!");
            this.generateMap();
        });

        this.room.state.playerUnits.onAdd((unit, sessionId) => {
            //
            // A player has joined!
            //
            console.log("A player has joined! Their unique session id is", sessionId);

            const entity = this.physics.add.image(unit.currPos.x * this.gridSize, unit.currPos.y * this.gridSize, 'ship_0001');
            entity.width = entity.height = 16;
            entity.scale = 0.5;
            this.playerEntities[sessionId] = entity;

            if (sessionId === this.room.sessionId) {
                // this is the current player!
                // (we are going to treat it differently during the update loop)
                this.currentPlayer = entity;

                // remoteRef is being used for debug only
                this.remoteRef = this.add.rectangle(0, 0, entity.width, entity.height);
                this.remoteRef.setStrokeStyle(1, 0xff0000);

                this.inputPayload.pointerX = unit.currPos.x;
                this.inputPayload.pointerY = unit.currPos.y;

                this.cameras.main.startFollow(this.currentPlayer);
                this.cameras.main.setViewport(0, 0, 200, 200);
                this.cameras.main.setZoom(2, 2);
                this.cameras.main.setSize(800, 640);
            }

            unit.currPos.onChange(() => {
                entity.setData('serverX', unit.currPos.x * this.gridSize);
                entity.setData('serverY', unit.currPos.y * this.gridSize);
                this.remoteRef.x = unit.currPos.x * this.gridSize;
                this.remoteRef.y = unit.currPos.y * this.gridSize;
            });

            entity.setData('movespeed', unit.attributes.get(unit.inputInfo.speedAttrKey)?.currentValue);
        });

        this.room.state.playerUnits.onRemove((player, sessionId) => {
            const entity = this.playerEntities[sessionId];
            if (entity) {
                // destroy entity
                entity.destroy();

                // clear local reference
                delete this.playerEntities[sessionId];
            }
        });
    }

    update(time: number, delta: number): void {
        // skip loop if not connected yet.
        if (!this.room) { return; }

        if (game.input.activePointer.leftButtonDown() && !this.isLMBHeld) {
            const newInputPosition = { x: this.input.activePointer.worldX, y: this.input.activePointer.worldY };
            const gridInputPosition = convertPixelPositionToGridPosition(newInputPosition, this.gridSize);
            this.inputPayload.pointerX = gridInputPosition.x;
            this.inputPayload.pointerY = gridInputPosition.y;
            this.inputPayload.sent = false;
            this.isLMBHeld = true;
        }

        if (game.input.activePointer.leftButtonReleased()) {
            this.isLMBHeld = false;
        }

        if (!this.inputPayload.sent) {
            this.room.send(0, this.inputPayload);
            this.inputPayload.sent = true;
        }

        this.elapsedTime += delta;
        while (this.elapsedTime >= this.fixedTimeStep) {
            this.elapsedTime -= this.fixedTimeStep;
            this.fixedTick(this.fixedTimeStep);
        }
    }

    fixedTick(timeStep: number) {
        // skip loop if not connected with room yet.
        if (!this.room) { return; }

        for (let sessionId in this.playerEntities) {
            // interpolate all player entities
            const entity = this.playerEntities[sessionId];
            const { serverX, serverY } = entity.data.values;

            entity.x = Phaser.Math.Linear(entity.x, serverX, 0.1);
            entity.y = Phaser.Math.Linear(entity.y, serverY, 0.1);
        }
    }

    generateMap() {
        this.currentMap = this.make.tilemap({ key: 'test_tilemap' });
        this.currentTileset = this.currentMap.addTilesetImage('Dungeon', 'base_tiles')!;

        this.currentMap.createLayer('Ground', this.currentTileset);
        this.currentMap.createLayer('Wall', this.currentTileset);
        this.gridSize = this.room.state.currentMap.gridSize;
    }
}

// game config
const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: 800,
    height: 640,
    backgroundColor: '#000000',
    parent: 'phaser-example',
    physics: { default: "arcade" },
    pixelArt: true,
    scene: [GameScene],
};

// instantiate the game
const game = new Phaser.Game(config);