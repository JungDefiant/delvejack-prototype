import EasyStar from "easystarjs";
import { magnitude } from "../utils/magnitude";
import { Unit } from "../schema/Unit";
import { Position } from "../schema/Position";
import { MapData } from "../schema/MapData";

export class Pathfinder {

    // Pathfinding Settings
    static pathing = new EasyStar.js();
    static minDist = 0.01;

    static SetCurrentGrid(map: number[][]) {
        this.pathing.setGrid(map);
        this.pathing.setAcceptableTiles([0]);
        this.pathing.enableDiagonals();
        this.pathing.disableCornerCutting();
    }

    static FindPath(unit: Unit, map: MapData) {

        console.log(`CURR POS ${unit.currPos.x}, ${unit.currPos.y}`);
        console.log(`DEST POS ${unit.destPos.x}, ${unit.destPos.y}`);

        const distX = unit.destPos.x - unit.currPos.x;
        const distY = unit.destPos.y - unit.currPos.y;
        const mag = magnitude(distX, distY);

        if(mag <= this.minDist) {
            return;
        }

        this.pathing.findPath(unit.currPos.x, unit.currPos.y, unit.destPos.x, unit.destPos.y, (path) => {
            unit.currPath = [];

            if(!path) {
                return;
            }

            for (let i = 1; i < path.length; i++) {
                const newPos = new Position();
                newPos.x = path[i].x;
                newPos.y = path[i].y;
                unit.currPath.push(newPos);
            }

            unit.nextPos = unit.currPath.shift();
        });

        this.pathing.calculate();
    } 
}