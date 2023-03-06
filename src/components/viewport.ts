import { Coords, Rect } from "../locators";
import { IDrawContext } from "./draw-context";
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
        return new DrawContext(this._canvas);
    }

    public translate(clientX: number, clientY: number): Coords {
        return null;
    }

    public project(position: Coords): number[] {
        return null;
    }

    private _loadCanvas(): void {
        if (this._canvas == null)
            this._canvas = document.getElementById('viewport') as HTMLCanvasElement;
        
        if (this._canvas != null) {
            this._ratio = this._window.devicePixelRatio;
            this._width = this._canvas.clientWidth;
            this._height = this._canvas.clientHeight;
        }
    }
}

class DrawContext implements IDrawContext {
    private _context: CanvasRenderingContext2D;
    private _midX: number;
    private _midY: number;
    private _width: number;
    private _height: number;
    private _ratio: number;

    public get context(): CanvasRenderingContext2D { return this._context; }

    constructor(canvas: HTMLCanvasElement) {

        this._ratio = window.devicePixelRatio;
        this._width = canvas.clientWidth / this._ratio;
        this._height = canvas.clientHeight / this._ratio;
        this._midX = Math.round(this._width / 2);
        this._midY = Math.round(this._height / 2);

        canvas.width = this._width;
        canvas.height = this._height;

        this._context = canvas.getContext('2d');
    }

    public isVisible(rect: Rect) {
        const start = this.translate(new Coords(rect.x, rect.y));
        if (start.x > this._width) return false;
        if (start.y > this._height) return false;
        if (start.x + rect.width < 0) return false;
        if (start.y + rect.height < 0) return false;

        return true;
    }

    public translate(loc: Coords): Coords {
        return new Coords(Math.round(loc.x + this._midX), Math.round(loc.y + this._midY));
    }
}

