import { Client, Room } from "colyseus.js";
import Phaser, { Input, Math as PMath, Tilemaps } from "phaser";
import { RoomState } from "./schema/RoomState";
import { getDirectionFromAngle, magnitude } from "./utils/math";
import { acos, atan, atan2, dot, pi, sqrt } from "mathjs";

interface InputData {
    directionX: number,
    directionY: number,
    actionKey: string,
    tick: number,
    sent: boolean
}

interface InputState {
    moveUp: boolean;
    moveDown: boolean;
    moveLeft: boolean;
    moveRight: boolean;
}

// custom scene class
export class GameScene extends Phaser.Scene {

    // Phase Room Settings
    client = new Client("ws://localhost:2567");
    room: Room<RoomState>;
    playerUnits: { [sessionId: string]: any } = {};
    currentPlayer: Phaser.Types.Physics.Arcade.ImageWithDynamicBody;
    destRef: Phaser.GameObjects.Rectangle;

    // Input Settings
    inputPayload: InputData = {
        directionX: 0,
        directionY: 0,
        actionKey: "",
        tick: 0,
        sent: false
    };

    inputState: InputState = {
        moveUp: false,
        moveDown: false,
        moveLeft: false,
        moveRight: false
    }

    // Map Settings
    currentMap: Tilemaps.Tilemap;
    currentTileset: Tilemaps.Tileset;
    gridSize = 16;
    inputHeld = false;

    // TimeStep Settings
    elapsedTime = 0;
    fixedTimeStep = 1000 / 60;

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

        this.generateMap();
        
        // NOTE: Add message to 'disable mouse gestures for best experience' in main menu

        // this.room.state.currentMap.onChange(() => {
        //     console.log("GENERATE MAP!");
        //     this.generateMap();
        // });

        this.setupInputEvents();

        this.room.state.players.onAdd((player, sessionId) => {
            //
            // A player has joined!
            //
            console.log("A player has joined! Their unique session id is", sessionId);

            const entity = this.physics.add.image(player.currPos.x * this.gridSize, player.currPos.y * this.gridSize, 'ship_0001');
            entity.width = entity.height = 16;
            entity.scale = 0.5;
            this.playerUnits[sessionId] = entity;

            if (sessionId === this.room.sessionId) {
                // this is the current player!
                // (we are going to treat it differently during the update loop)
                this.currentPlayer = entity;

                // remoteRef is being used for debug only
                this.destRef = this.add.rectangle(0, 0, entity.width, entity.height);
                this.destRef.setStrokeStyle(1, 0xff0000);

                this.inputPayload.directionX = 0;
                this.inputPayload.directionY = 0;

                this.cameras.main.startFollow(this.currentPlayer);
                this.cameras.main.setViewport(0, 0, 200, 200);
                this.cameras.main.setZoom(4, 4);
                this.cameras.main.setSize(800, 640);
                // entity.setData('moveSpeed', player.attributes.get("attr_movespeed")?.currentValue!);
            }

            player.currPos.onChange(() => {
                entity.setData('serverX', player.currPos.x * this.gridSize);
                entity.setData('serverY', player.currPos.y * this.gridSize);
            });

            player.attributes.get("attr_movespeed")?.onChange(() => {
                entity.setData('moveSpeed', player.attributes.get("attr_movespeed")?.currentValue!);
            })
        });

        this.room.state.players.onRemove((player, sessionId) => {
            const entity = this.playerUnits[sessionId];
            if (entity) {
                // destroy entity
                entity.destroy();

                // clear local reference
                delete this.playerUnits[sessionId];
            }
        });


    }

    update(time: number, delta: number): void {
        // skip loop if not connected yet.
        if (!this.room) { return; }

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

    resetInputData() {
        this.inputPayload = {
            directionX: 0,
            directionY: 0,
            actionKey: "",
            tick: 0,
            sent: false
        }
    }

    setupInputEvents() {
        this.input.keyboard?.on('keydown', (ev: any) => {
            switch(ev.code) {
                case 'KeyW':
                    this.setInputData("move");
                    this.inputPayload.directionX = 0;
                    this.inputPayload.directionY = -1;
                    this.inputState.moveUp = true;
                    break;
                case 'KeyA':
                    this.setInputData("move");
                    this.inputPayload.directionX = -1;
                    this.inputPayload.directionY = 0;
                    this.inputState.moveLeft = true;
                    break;
                case 'KeyS':
                    this.setInputData("move");
                    this.inputPayload.directionX = 0;
                    this.inputPayload.directionY = 1;
                    this.inputState.moveDown = true;
                    break;
                case 'KeyD':
                    this.setInputData("move");
                    this.inputPayload.directionX = 1;
                    this.inputPayload.directionY = 0;
                    this.inputState.moveRight = true;
                    break;
            }
            
        });
        
        this.input.keyboard?.on('keyup', (ev: any) => {
            switch(ev.code) {
                case 'KeyW':
                    this.inputState.moveUp = false;
                    break;
                case 'KeyA':
                    this.inputState.moveLeft = false;
                    break;
                case 'KeyS':
                    this.inputState.moveDown = false;
                    break;
                case 'KeyD':
                    this.inputState.moveRight = false;
                    break;
            }
        })

        this.input.on("pointerdown", () => {
            if (game.input.activePointer.leftButtonDown()) {
                this.setInputData("attack");
                this.setPointerDirectionToInputData();
            }
            else if (game.input.activePointer.rightButtonDown()) {
                this.setInputData("useOffenseAbility");
                this.setPointerDirectionToInputData();
            }
        });

        this.input.on("pointerup", () => {
            if (game.input.activePointer.leftButtonReleased()) { }
            else if(game.input.activePointer.rightButtonReleased()) { }
        })
    }

    setInputData(key: string) {
        this.resetInputData();
        this.inputPayload.actionKey = key;
    }

    setPointerDirectionToInputData() {
        if (this.input.activePointer.x > this.cameras.main.width ||
            this.input.activePointer.y > this.cameras.main.height) {
                return;
        }

        const playerEntity = this.playerUnits[this.room.sessionId];
        const newInputPosition = { x: this.input.activePointer.worldX, y: this.input.activePointer.worldY };

        let angle= Math.atan2(newInputPosition.y - playerEntity.y, newInputPosition.x - playerEntity.x) * 180 / Math.PI;
        
        const dirVector = getDirectionFromAngle(Math.round(angle));

        if (this.destRef) {
            this.destRef.x = playerEntity.x + (dirVector.x * this.gridSize);
            this.destRef.y = playerEntity.y + (dirVector.y * this.gridSize);
        }

        this.inputPayload.directionX = dirVector.x;
        this.inputPayload.directionY = dirVector.y;
    }

    fixedTick(timeStep: number) {
        // skip loop if not connected with room yet.
        if (!this.room) { return; }

        for (let sessionId in this.playerUnits) {
            this.interpolateEntityMovements(timeStep, sessionId);
        }
    }

    interpolateEntityMovements(timeStep: number, sessionId: string) {
        // interpolate all player entities
        const entity = this.playerUnits[sessionId];
        const { serverX, serverY, moveSpeed } = entity.data.values;

        console.log((this.gridSize * moveSpeed));
        
        console.log((timeStep / 1000));
        entity.x = Phaser.Math.Linear(entity.x, serverX, (moveSpeed * timeStep) / 1000);
        entity.y = Phaser.Math.Linear(entity.y, serverY, (moveSpeed * timeStep) / 1000);
    }

    generateMap() {
        this.currentMap = this.make.tilemap({ key: 'test_tilemap' });
        this.currentTileset = this.currentMap.addTilesetImage('Dungeon', 'base_tiles')!;

        this.currentMap.createLayer('Ground', this.currentTileset, -8, -8);
        this.currentMap.createLayer('Wall', this.currentTileset, -8, -8);
        // this.gridSize = this.room.state.currentMap.gridSize;
        this.gridSize = 16;
    }
}

// game config
const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    width: 800,
    height: 640,
    zoom: 1.25,
    backgroundColor: '#000000',
    parent: 'phaser-example',
    physics: { default: "arcade" },
    pixelArt: true,
    scene: [GameScene],
    disableContextMenu: true,
    input: {
        mouse: {
            target: null,
        },
        touch: {
            target: null,
            capture: false
        }
    }
};

// instantiate the game
const game = new Phaser.Game(config);