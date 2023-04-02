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
        this._setState(new NewState('none', 'r', []));
    }

    update(context: IUpdateContext): void {
        for(let i = 0; i < context.framesSinceLastUpdate; i++) {
            this.currAnimationCounter.next(context.framesSinceLastUpdate);
            let deltaX = 0;

            if (!this.state.startsWith('attack') || this.currAnimationCounter.finished()) {
                if(this.currAnimationCounter.finished())
                    this.state = 'none';

                const newState = new NewState(this.state, this.direction, context.state);

                if (newState.changed)
                    this._setState(newState);

                if (this.state === 'walk') deltaX = 3;
                if (this.state === 'run') deltaX = 15;
                deltaX *= this.direction === 'r' ? 1 : -1;
            }

            const prevFrame = this.currFrame;
            this.currFrame = Math.floor(this.currAnimationCounter.value());

            let frameDelta = this.currFrame - prevFrame;
            if (prevFrame > this.currFrame) 
                frameDelta += this.currAnimation.frames.length;

            this.position = this.position.move(deltaX * frameDelta, 0);
        }
    }

    draw(context: IDrawContext): void {
        const screenCoords = context.translate(this.position);
        context.drawAnimationFrame(screenCoords, this.currAnimation, this.currFrame);
    }

    private _setState(newState: NewState) {
        if (!newState.changed)
            return;

        this.state = newState.state;
        this.direction = newState.direction;

        const spritesheetName = this.direction === 'r' ? 'testgirl' : 'testgirl-mirror';

        this.currAnimation = this.spriteLibrary.getAnimation(spritesheetName, this.state);

        const length = this.currAnimation.frames.length;

        const step = (length * 1000) / (this.currAnimation.duration * this.settings.fps);

        this.currAnimationCounter = new CountAnimator(0, length, step, !this.state.startsWith('attack'));
        this.currFrame = 0;
    }
}

class NewState {
    private _direction: string;
    private _state: string;
    private _changed: boolean;

    public get direction(): string { return this._direction; }
    public get state(): string { return this._state; }
    public get changed(): boolean { return this._changed; }

    constructor(state: string, direction: string, stateFromContext: string[]) {
        let fast = false;
        let newState = null;
        let newDirection = null;
        for(const s of stateFromContext) {
            switch (s) {
                case 'left':
                    if (!newState)
                        newState = 'move';
                    if (!newDirection)
                        newDirection = 'l';
                    break;
                case 'right':
                    if (!newState)
                        newState = 'move';
                    if (!newDirection)
                        newDirection = 'r';
                    break;
                case 'run':
                    fast = true;
                    break;
                case 'punch':
                    if (!newState)
                        newState = 'punch';
                    break;
                case 'kick':
                    if (!newState)
                        newState = 'kick';
                    break;
            }
        }

        this._direction = newDirection || direction;
        switch (newState) {
            case null:
                this._state = 'idle';
                break;
            case 'move':
                this._state = fast ? 'run' : 'walk';
                break;
            case 'punch':
            case 'kick':
                this._state = 'attack-' + newState;
                break;
        }

        this._changed = state != this._state || direction != this._direction;
    }
}