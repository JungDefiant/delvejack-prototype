import { Client, Room } from "colyseus.js";
import Phaser, { Tilemaps } from "phaser";
import { RoomState } from "./schema/RoomState";
import { getDirectionFromAngle } from "./utils/math";

type Key = Phaser.Input.Keyboard.Key;

interface InputData {
    directionX: number,
    directionY: number,
    actionKey: string,
    tick: number,
    sent: boolean,
    accum: 0
}

interface InputState {
    moveUp: boolean,
    moveDown: boolean,
    moveLeft: boolean,
    moveRight: boolean,
}

interface ActionKeys {
    moveUp: Key,
    moveDown: Key,
    moveLeft: Key,
    moveRight: Key,
    specSkill1: Key,
    specSkill2: Key,
    specSkill3: Key
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
    keyboard: ActionKeys;
    inputPayload: InputData = {
        directionX: 0,
        directionY: 0,
        actionKey: "",
        tick: 0,
        sent: false,
        accum: 0
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

        this.generateMap();

        // NOTE: Add message to 'disable mouse gestures for best experience' in main menu

        // this.room.state.currentMap.onChange(() => {
        //     console.log("GENERATE MAP!");
        //     this.generateMap();
        // });

        this.setupActionKeys();

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

                this.cameras.main.startFollow(this.currentPlayer, true, 0.5, 0.5);
                this.cameras.main.setViewport(0, 0, 200, 200);
                this.cameras.main.setZoom(4, 4);
                this.cameras.main.setSize(800, 640);

                entity.setData('localX', player.currPos.x * this.gridSize);
                entity.setData('localY', player.currPos.y * this.gridSize);
                entity.setData('moveDelay', 0);
                entity.setData('moveTime', player.attributes.get("attr_movespeed")?.currentValue! * this.fixedTimeStep);
            }

            player.currPos.onChange(() => {
                // if(sessionId === this.room.sessionId) {
                //     console.log("X: " + (player.currPos.x * this.gridSize) + ", Y: " + (player.currPos.y * this.gridSize));
                //     entity.x = player.currPos.x * this.gridSize;
                //     entity.y = player.currPos.y * this.gridSize;
                // }
                // else {
                //     entity.setData('serverX', player.currPos.x * this.gridSize);
                //     entity.setData('serverY', player.currPos.y * this.gridSize);
                // }
                entity.setData(sessionId === this.room.sessionId ? 'localX' : 'serverX', player.currPos.x * this.gridSize);
                entity.setData(sessionId === this.room.sessionId ? 'localY' : 'serverY', player.currPos.y * this.gridSize);
                // entity.setData('serverX', player.currPos.x * this.gridSize);
                // entity.setData('serverY', player.currPos.y * this.gridSize);
            });

            player.attributes.get("attr_movespeed")?.onChange(() => {
                entity.setData('moveSpeed', player.attributes.get("attr_movespeed")?.currentValue!);
                entity.setData('moveTime', player.attributes.get("attr_movespeed")?.currentValue! * this.fixedTimeStep);
            });

            player.rechargeTimes.onChange(() => {
                entity.setData('moveDelay', player.rechargeTimes.get("move"));
            });
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

    // Update/Tick Functions
    update(time: number, delta: number): void {
        // skip loop if not connected yet.
        if (!this.room) { return; }

        this.elapsedTime += delta;
        while (this.elapsedTime >= this.fixedTimeStep) {
            this.elapsedTime -= this.fixedTimeStep;
            this.fixedTick(this.fixedTimeStep);
        }
    }

    fixedTick(timeStep: number) {
        // skip loop if not connected with room yet.
        if (!this.room) { return; }
        if (!this.currentPlayer) { return; }

        for (let sessionId in this.playerUnits) {
            this.interpolatePlayerMovements(timeStep, sessionId);
        }

        this.resetInputData();
        this.setInputData(timeStep); 

        if (!this.inputPayload.sent) {
            this.room.send(0, this.inputPayload);
            this.inputPayload.sent = true;
        }
    }

    // Input Handling
    resetInputData() {
        this.inputPayload = {
            directionX: 0,
            directionY: 0,
            actionKey: "",
            tick: 0,
            sent: false,
            accum: 0
        }
    }

    setInputData(timeStep: number) {
        if (!this.currentPlayer) {
            return;
        }

        const pData = this.room.state.players.get(this.room.sessionId);
        const { moveDelay, moveTime } = this.currentPlayer.data.values;

        console.log("MOVE RECHARGE", moveDelay);
        console.log("RECHARGE TIME", moveTime);

        if(moveDelay >= moveTime) {
            if (this.keyboard.moveUp.isDown
                || this.keyboard.moveDown.isDown
                || this.keyboard.moveLeft.isDown
                || this.keyboard.moveRight.isDown) {
                this.inputPayload.actionKey = "move";
                if (this.keyboard.moveUp.isDown) {
                    this.inputPayload.directionY = -1;
                    this.currentPlayer!.setData('localY', (pData!.currPos.y - 1) * this.gridSize);
                } else if (this.keyboard.moveDown.isDown) {
                    this.inputPayload.directionY = 1;
                    this.currentPlayer!.setData('localY', (pData!.currPos.y + 1) * this.gridSize);
                }
    
                if (this.keyboard.moveLeft.isDown) {
                    this.inputPayload.directionX = -1;
                    this.currentPlayer!.setData('localX', (pData!.currPos.x - 1) * this.gridSize);
                } else if (this.keyboard.moveRight.isDown) {
                    this.inputPayload.directionX = 1;
                    this.currentPlayer!.setData('localX', (pData!.currPos.x + 1) * this.gridSize);
                }
    
                this.currentPlayer.setData('moveDelay', 0);
                return;
            }
        }

        this.currentPlayer.setData('moveDelay', moveDelay + timeStep);
    }

    setupActionKeys() {
        this.keyboard = {
            moveUp: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.W),
            moveDown: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.S),
            moveLeft: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A),
            moveRight: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.D),
            specSkill1: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.Q),
            specSkill2: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.E),
            specSkill3: this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT)
        };

        this.input.on("pointerdown", () => {
            if (game.input.activePointer.leftButtonDown()) {
                this.setPointerDirectionToInputData();
            }
            else if (game.input.activePointer.rightButtonDown()) {
                this.setPointerDirectionToInputData();
            }
        });

        this.input.on("pointerup", () => {
            if (game.input.activePointer.leftButtonReleased()) { }
            else if (game.input.activePointer.rightButtonReleased()) { }
        })
    }

    setPointerDirectionToInputData() {
        if (this.input.activePointer.x > this.cameras.main.width ||
            this.input.activePointer.y > this.cameras.main.height) {
            return;
        }

        const playerEntity = this.playerUnits[this.room.sessionId];
        const newInputPosition = { x: this.input.activePointer.worldX, y: this.input.activePointer.worldY };

        let angle = Math.atan2(newInputPosition.y - playerEntity.y, newInputPosition.x - playerEntity.x) * 180 / Math.PI;

        const dirVector = getDirectionFromAngle(Math.round(angle));

        if (this.destRef) {
            this.destRef.x = playerEntity.x + (dirVector.x * this.gridSize);
            this.destRef.y = playerEntity.y + (dirVector.y * this.gridSize);
        }

        this.inputPayload.directionX = dirVector.x;
        this.inputPayload.directionY = dirVector.y;
    }

    interpolatePlayerMovements(timeStep: number, sessionId: string) {
        // interpolate all player entities
        const entity = this.playerUnits[sessionId];
        const { serverX, serverY, localX, localY, moveSpeed } = entity.data.values;
        const destX = sessionId === this.room.sessionId ? localX : serverX;
        const destY = sessionId === this.room.sessionId ? localY : serverY;
        // const destX = serverX;
        // const destY = serverY;

        console.log("LOCAL X", localX);
        console.log("LOCAL Y", localY);
        console.log("SERVER X", serverX);
        console.log("SERVER Y", serverY);
        console.log("ENTITY X", entity.x);
        console.log("ENTITY Y", entity.y);
        console.log("PIXELS MOVED", moveSpeed * this.gridSize * (timeStep / 1000));

        const pixelsToMoveX = Math.min(moveSpeed * this.gridSize * (timeStep / 1000), Math.abs(entity.x - destX));
        const pixelsToMoveY = Math.min(moveSpeed * this.gridSize * (timeStep / 1000), Math.abs(entity.y - destY));
        const directionX = entity.x >= destX ? -1 : 1;
        const directionY = entity.y >= destY ? -1 : 1;
        entity.x += pixelsToMoveX * directionX;
        entity.y += pixelsToMoveY * directionY;
        // entity.x = destX;
        // entity.y = destY;
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