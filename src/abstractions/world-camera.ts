import { IDrawContext } from "../components";
import { Coords, Rect } from "../locators";
import { IAnimation } from "../models";

export interface IPositioned {
    position: Coords;
}

export interface IWorldCamera extends IPositioned {
    project(object: Coords): Coords;
    getProjectedDrawContext(viewContext: IDrawContext): IDrawContext;
}

export class WorldCamera implements IWorldCamera {
    public position: Coords;
    public bounds: Rect;
    private target: IPositioned;

    constructor() {
        this.position = new Coords(0, 0);
        this.target = null;
    }

    public project(object: Coords): Coords {
        const cameraPos = this.calcCameraPosition();

        return new Coords(object.x - cameraPos.x, object.y - cameraPos.y);
    }

    public follow(object: IPositioned) {
        this.target = object;
    }

    public getProjectedDrawContext(viewContext: IDrawContext): IDrawContext {
        return new WorldProjectedDrawContext(viewContext, this);
    }

    private calcCameraPosition(): Coords {
        const targetPos = this.target && this.target.position ? this.target.position : new Coords(0, 0);
        const cameraPos = new Coords(this.position.x + targetPos.x, this.position.y + targetPos.y);
        if (this.bounds) {
            cameraPos.x = 
                this.bounds.x > cameraPos.x ? this.bounds.x :
                this.bounds.x2 < cameraPos.x ? this.bounds.x2 :
                cameraPos.x;
            cameraPos.y = 
                this.bounds.y > cameraPos.y ? this.bounds.y :
                this.bounds.y2 < cameraPos.y ? this.bounds.y2 :
                cameraPos.y;
        }
        return cameraPos;
    }
}

export class WorldProjectedDrawContext implements IDrawContext {
    
    constructor(private viewContext: IDrawContext, private worldCamera: WorldCamera) {

    }

    translate(loc: Coords): Coords {
        return this.viewContext.translate(this.worldCamera.project(loc));
    }
    fill(color: string): void {
        return this.viewContext.fill(color);
    }
    drawAnimationFrame(loc: Coords, animation: IAnimation, frame: number) {
        return this.viewContext.drawAnimationFrame(loc, animation, frame);
    }
}