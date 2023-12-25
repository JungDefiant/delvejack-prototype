export function normalize(val: number, min: number, max: number) {
    var delta = max - min;
    return (val - min) / delta;
}