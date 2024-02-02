import { MapData } from "../schema/MapData";
import { Position } from "../schema/Position";
import { Unit } from "../schema/Unit";

export function SetUnitToTile(mapData: MapData, position: Position, unit: Unit | null) {
    const tileData = mapData.arrayData[position.y].rowData[position.x];
    tileData.occupyingUnit = unit;
}

export function GetUnitAtPosition(mapData: MapData, targetPos: Position): Unit {
    const tileData = mapData.arrayData[targetPos.y].rowData[targetPos.x];
    return tileData.occupyingUnit;
}