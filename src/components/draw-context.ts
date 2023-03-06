import { Coords, Rect } from "../locators";

export interface IDrawContext {
    context: CanvasRenderingContext2D;
    isVisible(rect: Rect): boolean;
    translate(loc: Coords): Coords;
}