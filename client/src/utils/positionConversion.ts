
export function convertGridPositionToPixelPosition(gridPos: { x: number, y: number }, gridSize: number): { x: number, y: number } {
    const newPos = { x: 0, y: 0 };
    newPos.x = gridPos.x * gridSize;
    newPos.y = gridPos.y * gridSize;
    return newPos;
}

export function convertPixelPositionToGridPosition(gridPos: { x: number, y: number }, gridSize: number): { x: number, y: number } {
    const newPos = { x: 0, y: 0 };
    newPos.x = Math.round(gridPos.x / gridSize);
    newPos.y = Math.round(gridPos.y / gridSize);
    console.log(`POS ${newPos.x} ${newPos.y}`);
    return newPos;
}