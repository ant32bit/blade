import { Coords, Rect } from "../../locators";
import { IAnimation, IDeviceSettings } from "../../models";

export interface IDrawable {
    draw(context: IDrawContext): void;
}

export interface IDrawContext {
    translate(loc: Coords): Coords;
    fill(color: string): void;
    drawAnimationFrame(loc: Coords, animation: IAnimation, frame: number);
}

export class DrawContext implements IDrawContext {
    private _context: CanvasRenderingContext2D;
    private _midX: number;
    private _midY: number;
    private _width: number;
    private _height: number;
    private _ratio: number;

    constructor(deviceSettings: IDeviceSettings, canvasRef: HTMLCanvasElement) {

        this._ratio = deviceSettings.devicePixelRatio;
        this._width = canvasRef.clientWidth / this._ratio;
        this._height = canvasRef.clientHeight / this._ratio;
        this._midX = Math.round(this._width / 2);
        this._midY = Math.round(this._height / 2);

        canvasRef.width = this._width;
        canvasRef.height = this._height;

        this._context = canvasRef.getContext('2d');
    }

    public translate(loc: Coords): Coords {
        return new Coords(Math.round(loc.x + this._midX), Math.round(loc.y + this._midY));
    }

    public fill(color: string) {
        this._context.rect(0, 0, this._width, this._height);
        this._context.fillStyle = color;
        this._context.fill();
    }

    public drawAnimationFrame(loc: Coords, animation: IAnimation, frame: number) {
        this._context.drawImage(animation.image, 
            animation.frames[frame].x, animation.frames[frame].y,
            animation.width, animation.height,
            loc.x - animation.centreX, loc.y - animation.centreY,
            animation.width, animation.height);
    }
}
