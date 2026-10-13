export function requiresRotation(width:number,height:number):boolean {
    return width < height && width < 900;
}
