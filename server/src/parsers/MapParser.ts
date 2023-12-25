import fs from "fs";
import { MapData, MapRow } from "../schema/MapData";

export class MapParser {

    static ParseMapDataFromJSON(path: string): MapData {
        const mapJSON = JSON.parse(fs.readFileSync(path, 'utf-8'));
        const wallData = mapJSON.layers[1].data;

        if (!wallData) {
            console.error("No wall data found!");
            return null;
        }

        const width = mapJSON.layers[1].width;

        if (!width) {
            console.error("No width property found!");
            return null;
        }

        const newMapData = new MapData();
        newMapData.height = mapJSON.height * mapJSON.tileheight;
        newMapData.width = mapJSON.width * mapJSON.tilewidth;
        newMapData.gridSize = mapJSON.tileheight;

        for (let i = 0; i < wallData.length; i += width) {
            const newMapRow = new MapRow();
            for (let j = 0; j < width; j++) {
                newMapRow.rowData.push(wallData[i + j] > 0 ? 1 : 0);
            }
            newMapData.arrayData.push(newMapRow);
        }

        return newMapData;
    }

    static CreateEasyStarMapFromMapData(map: MapData): number[][] {

        const grid: number[][] = [];

        for (let i = 0; i < map.arrayData.length; i++) {
            const mapDataRow = map.arrayData[i];
            const gridRow = [];
            for (let j = 0; j < mapDataRow.rowData.length; j++) {
                const number = mapDataRow.rowData[j];
                gridRow.push(number);
            }

            grid.push(gridRow);
        }

        return grid;
    }
}
