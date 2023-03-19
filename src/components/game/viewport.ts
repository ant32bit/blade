import { Rect } from "../../locators";
import { IDrawContext, DrawContext } from "../contexts/draw-context";
import { IRenderer } from "./game-loop";

export class Viewport implements IRenderer {

    private _canvas: HTMLCanvasElement = null;
    private _document: Document;
    private _window: Window;

    private _ratio: number;
    private _width: number;
    private _height: number;

    public get canvas(): HTMLCanvasElement { return this._canvas; }
    public get width(): number { return this._width; }
    public get height(): number { return this._height; }

    constructor(docRef: Document, windRef: Window) {
        this._document = docRef;
        this._window = windRef;
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
        return new DrawContext(this._window, this._canvas);
    }

    private _loadCanvas(): void {
        if (this._canvas == null)
            this._canvas = this._document.getElementById('viewport') as HTMLCanvasElement;
        
        if (this._canvas != null) {
            this._ratio = this._window.devicePixelRatio;
            this._width = this._canvas.clientWidth;
            this._height = this._canvas.clientHeight;
        }
    }
}


