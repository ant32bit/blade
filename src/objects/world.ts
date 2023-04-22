import { WorldCamera } from "../abstractions";
import { IDrawable, IDrawContext, IGameSettings, ISpriteLibrary, IUpdateable, IUpdateContext, ILogger } from "../components";
import { Coords, Rect } from "../locators";
import { IAnimation } from "../models";
import { TestGirl } from "./test-girl";

export class World implements IUpdateable, IDrawable {

    private camera: WorldCamera;
    private updateables: IUpdateable[];
    private drawables: IDrawable[];
    private background: IAnimation;


    constructor(gameSettings: IGameSettings, spriteLibrary: ISpriteLibrary, private logger: ILogger) {
        const testgirl = new TestGirl(gameSettings, spriteLibrary);
        this.camera = new WorldCamera();
        this.camera.position.y = -32;
        this.camera.follow(testgirl);
        this.updateables = [testgirl];
        this.drawables = [testgirl];

        this.background = spriteLibrary.getAnimation('world', 'sanwakai-tower');
        this.camera.bounds = new Rect(0, -150, 700, 0);

    }

    update(context: IUpdateContext): void {
        this.updateables.forEach(u => u.update(context));
    }

    draw(context: IDrawContext): void {
        context.fill('#000000');
        const worldContext = this.camera.getProjectedDrawContext(context);
        worldContext.drawAnimationFrame(
            worldContext.translate(new Coords(0,0)),
            this.background, 0);
        this.drawables.forEach(d => d.draw(worldContext));
    }
}