import { Rect } from "../../locators";
import { IDeviceSettings, IElementProvider } from "../../models";
import { IDrawContext, DrawContext } from "../contexts/draw-context";
import { IRenderer } from "./game-loop";


export class Viewport implements IRenderer {

    private _canvas: HTMLCanvasElement = null;

    private _ratio: number;
    private _width: number;
    private _height: number;

    public get canvas(): HTMLCanvasElement { return this._canvas; }
    public get width(): number { return this._width; }
    public get height(): number { return this._height; }

    constructor(private elementProvider: IElementProvider, private deviceSettings: IDeviceSettings) {
        this._loadCanvas();
    }

    public getVisibleRect(): Rect {
        this._loadCanvas();
        const width = this._width / this._ratio;
        const height = this._height / this._ratio;
        return new Rect(0, 0, width, height);
    }

    public getDrawContext(): IDrawContext {
        this._loadCanvas();
        return new DrawContext(this.deviceSettings, this._canvas);
    }

    private _loadCanvas(): void {
        if (this._canvas == null)
            this._canvas = this.elementProvider.getElementById('viewport') as HTMLCanvasElement;
        
        if (this._canvas != null) {
            this._ratio = this.deviceSettings.devicePixelRatio;
            this._width = this._canvas.clientWidth;
            this._height = this._canvas.clientHeight;
        }
    }
}


