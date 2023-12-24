import EasyStar from "easystarjs";
import { Unit } from "../rooms/schema/units/Unit";
import { Position } from "../rooms/schema/units/Position";
import { magnitude } from "../../../shared/utils/magnitude";

export class Pathfinder {

    // Pathfinding Settings
    static pathing = new EasyStar.js();
    static minDist = 0.1;

    static SetCurrentGrid(map: number[][]) {
        this.pathing.setGrid(map);
    }

    static FindPath(entityId: string, unit: Unit) {
        const distX = unit.destPos.x - unit.currPos.x;
        const distY = unit.destPos.y - unit.currPos.y;
        const mag = magnitude(distX, distY);

        if(mag <= this.minDist) {
            return;
        }

        this.pathing.findPath(unit.currPos.x, unit.currPos.y, unit.destPos.x, unit.destPos.y, (path) => {
            path.forEach(pos => {
                const newPos = new Position();
                newPos.x = pos.x;
                newPos.y = pos.y;
                unit.currPath.push(newPos); 
            });
            unit.pathIndex = 0;
            unit.isMoving = true;
        });
    } 

    static MoveOnPath(unit: Unit, deltaTime: number) {
        if(!unit.isMoving) {
            return;
        }

        const speedAttr = unit.attributes.get(unit.inputInfo.speedAttrKey);
        const distMoved = speedAttr.currentValue * deltaTime;

        const distX = unit.destPos.x - unit.currPos.x;
        const distY = unit.destPos.y - unit.currPos.y;
        const mag = magnitude(distX, distY);

        if(mag < distMoved) {
            unit.currPos.x += distX;
            unit.currPos.y += distY;
            unit.pathIndex++;

            if(unit.pathIndex >= unit.currPath.length) {
                unit.isMoving = false;
            }
        }
        else {
            const normX = distX / mag;
            const normY = distY / mag;
            unit.currPos.x += normX * distMoved;
            unit.currPos.y += normY * distMoved;
        }
    }
}