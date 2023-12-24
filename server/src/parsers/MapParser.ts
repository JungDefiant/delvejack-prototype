import { MapData, MapRow } from "../rooms/schema/MapData";
import fs from "fs";

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
        return null;
    }
}
