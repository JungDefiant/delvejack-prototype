
export function magnitude(x: number, y: number) {
    return Math.sqrt(x * x + y * y);
}

// Ref: https://gist.github.com/basarat/4670200
export function getDirectionFromAngle(angle: number): { x: number, y: number } {
    const directions = [{ x: -1, y: 0 }, { x: 0, y: -1 }, { x: 1, y: 0 }, { x: 0, y: 1 }]
    const degree = 360 / 4;
    angle =  angle + 180;

    for (let i = 1; i < directions.length; i++) {
        if (angle >= ((i * degree) - (degree / 2)) && angle < ((i * degree) + (degree / 2))) {
            return directions[i];
        }
    }

    if (angle < (degree / 2) || angle >= (directions.length - 1) * degree + (degree / 2)) {
        return directions[0];
    }

    return { x: 0, y: 0 };
}