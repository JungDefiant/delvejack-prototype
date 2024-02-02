import EasyStar from "easystarjs";
import { magnitude } from "../utils/magnitude";
import { Unit } from "../schema/Unit";
import { Position } from "../schema/Position";
import { MapData } from "../schema/MapData";
import { ActionMoveState } from "../schema/Action";

export class PathfindingSystem {

    // Pathfinding Settings
    pathing = new EasyStar.js();
    minDist = 0.01;

    SetCurrentGrid(map: number[][]) {
        this.pathing.setGrid(map);
        this.pathing.setAcceptableTiles([0]);
        this.pathing.enableDiagonals();
        this.pathing.disableCornerCutting();
    }

    FindPath(unit: Unit, targetPos: Position, actionState: ActionMoveState) {
        const distX = targetPos.x - unit.currPos.x;
        const distY = targetPos.y - unit.currPos.y;
        const mag = magnitude(distX, distY);

        if(mag <= this.minDist) {
            return;
        }

        this.pathing.findPath(unit.currPos.x, unit.currPos.y, targetPos.x, targetPos.y, (path) => {
            actionState.currentPath = [];

            if(!path) {
                return;
            }

            for (let i = 1; i < path.length; i++) {
                const newPos = new Position();
                newPos.x = path[i].x;
                newPos.y = path[i].y;
                actionState.currentPath.push(newPos);
            }

            actionState.nextPos = actionState.currentPath.shift();
        });

        this.pathing.calculate();
    } 
}