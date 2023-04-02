import { IDrawable, IDrawContext, IGameSettings, ISpriteLibrary, IUpdateable, IUpdateContext, ILogger } from "../components";
import { TestGirl } from "./test-girl";

export class World implements IUpdateable, IDrawable {

    private updateables: IUpdateable[];
    private drawables: IDrawable[]; 

    constructor(gameSettings: IGameSettings, spriteLibrary: ISpriteLibrary, private logger: ILogger) {
        const testgirl = new TestGirl(gameSettings, spriteLibrary);
        this.updateables = [testgirl];
        this.drawables = [testgirl];
    }

    update(context: IUpdateContext): void {
        this.updateables.forEach(u => u.update(context));
    }

    draw(context: IDrawContext): void {
        this.drawables.forEach(d => d.draw(context));
    }
}