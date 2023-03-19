import { CountAnimator } from "../animators";
import { IDrawable, IDrawContext, IGameSettings, ISpriteLibrary, IUpdateable, IUpdateContext, SpriteLibrary } from "../components";
import { Coords } from "../locators";
import { IAnimation } from "../models";

export class TestGirl implements IUpdateable, IDrawable {
    
    private position: Coords;
    private state: string = 'none';
    private direction: string = 'r';

    private currAnimation: IAnimation;
    private currAnimationCounter: CountAnimator;
    private currFrame: number;

    constructor(private settings: IGameSettings, private spriteLibrary: ISpriteLibrary) {
        this.position = new Coords(0, 0);
        this._setStateAndDirection('idle', 'r');
    }

    update(context: IUpdateContext): void {
        //console.log(context);
        let modifier = 0;
        let newState = this.state;
        let newDirection = this.direction;
        const a = context.inputs['KeyA'];
        const d = context.inputs['KeyD'];
        if (!a && !d) {
            newState = 'idle';
        }
        else if (d) {
            const l = d[d.length - 1];
            newDirection = 'r';
            newState = l.active ? 'walk' : 'idle';
        }
        else if (a) {
            const l = a[a.length - 1];
            newDirection = 'l';
            newState = l.active ? 'walk' : 'idle';
        }

        if (this.state == 'walk') {
            let t = 3;
            t *= context.framesSinceLastUpdate;
            t *= this.direction == 'r' ? 1 : -1;
            this.position = this.position.move(t, 0);
        }

        if (newState != this.state || newDirection != this.direction) {
            this._setStateAndDirection(newState, newDirection);
            modifier = -1;
        }

        this.currAnimationCounter.next(context.framesSinceLastUpdate + modifier);
        this.currFrame = Math.floor(this.currAnimationCounter.value());
    }

    draw(context: IDrawContext): void {
        const screenCoords = context.translate(this.position);
        context.drawAnimationFrame(screenCoords, this.currAnimation, this.currFrame);
    }

    private _setStateAndDirection(newState: string, newDirection: string) {
        if (this.state == newState && this.direction == newDirection)
            return;

        this.state = newState;
        this.direction = newDirection;

        const spritesheetName = newDirection == 'r' ? 'testgirl' : 'testgirl-mirror';

        this.currAnimation = this.spriteLibrary.getAnimation(spritesheetName, newState);

        const length = this.currAnimation.frames.length;

        const step = (length * 1000) / (this.currAnimation.duration * this.settings.fps);

        this.currAnimationCounter = new CountAnimator(0, length, step, true);
        this.currFrame = 0;
    }
}