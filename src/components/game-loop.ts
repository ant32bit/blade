import { IDrawable, IDrawContext } from "./draw-context";
import { IGameSettings } from "./game-settings";
import { IInputEvent, InputState, IUpdateable, IUpdateContext } from "./update-context";

export interface IInputBuffer {
    start(): void;
    stop(): void;
    clear(): void;
    getState(timestamp: number): InputState;
}

export interface IRenderer {
    getDrawContext(): IDrawContext;
}

export class GameLoop {

    private _lastFrameThreshold: number;
    private _lastHearRate: number;
    private _stopped: boolean = true;
    private _frameFn: (callback: (heartRateTimeStamp: number) => void) => void;
    private _updateables: IUpdateable[] = [];
    private _drawables: IDrawable[] = [];
    private _inputBuffers: IInputBuffer[] = [];
    private _renderer: IRenderer = null;

    constructor(windowRef: Window, gameSettings: IGameSettings) {
        if (windowRef.requestAnimationFrame) {
            this._frameFn = (callback: (heartRateTimeStamp: number) => void) => {
                const _doFrame = (heartRateTimeStamp: number) => {
                    const frameSpan = 1000 / gameSettings.fps;
                    if (this._lastFrameThreshold - heartRateTimeStamp >= frameSpan) {
                        this._lastFrameThreshold += frameSpan;
                        this._lastHearRate = heartRateTimeStamp;
                        callback(heartRateTimeStamp);
                    }
                    if (!this._stopped)
                        windowRef.requestAnimationFrame(_doFrame);
                }
                
                _doFrame(0);
            }
        } else if ((windowRef as any).webkitRequestAnimationFrame) {
            this._frameFn = (callback: (heartRateTimeStamp: number) => void) => {
                const _doFrame = (heartRateTimeStamp: number) => {
                    const frameSpan = 1000 / gameSettings.fps;
                    if (this._lastFrameThreshold - heartRateTimeStamp >= frameSpan) {
                        this._lastFrameThreshold += frameSpan;
                        this._lastHearRate = heartRateTimeStamp;
                        callback(heartRateTimeStamp);
                    }
                    if (!this._stopped)
                        (windowRef as any).webkitRequestAnimationFrame(_doFrame);
                }
                
                _doFrame(0);
            }
        } else {
            this._frameFn = (callback: (heartRateTimeStamp: number) => void) => {
                let fps = -1;
                let h_interval = 0;
                let intervalFn = () => {
                    if (this._stopped && h_interval) {
                        windowRef.clearInterval(h_interval);
                        return;
                    }

                    let newFps = gameSettings.fps;
                    if (newFps !== fps) {
                        if (h_interval)
                            clearInterval(h_interval);

                        fps = newFps;
                        h_interval = windowRef.setInterval(intervalFn, 1000 / fps);
                        return;
                    }

                    this._lastHearRate = Date.now();
                    this._lastFrameThreshold += 1000 / gameSettings.fps;

                    callback(this._lastHearRate);
                };

                intervalFn();
            }
        }
    }

    public addUpdateable(updateable: IUpdateable) {
        this._updateables.push(updateable);
    }

    public addDrawable(drawable: IDrawable) {
        this._drawables.push(drawable);
    }

    public addInputBuffer(buffer: IInputBuffer) {
        this._inputBuffers.push(buffer);
        if (!this._stopped)
            buffer.start();
    }

    public setRenderer(renderer: IRenderer) {
        this._renderer = renderer;
    }

    public start(): void {
        if (this._stopped) {
            this._stopped = false;
            this._lastHearRate = Date.now();
            this._lastFrameThreshold = this._lastHearRate;
            
            this._frameFn(((hrts: number) => {
                const updateContext: IUpdateContext = {
                    inputs: {}
                }

                for (const buffer of this._inputBuffers) {
                    const state = buffer.getState(hrts);
                    for (const key of Object.keys(state)) {
                        if (!updateContext.inputs[key])
                            updateContext.inputs[key] = [];
                        updateContext.inputs[key].push(...state[key])
                    }
                }

                for (const updateable of this._updateables) {
                    updateable.update(updateContext);
                }

                if (this._renderer) {
                    const drawContext = this._renderer.getDrawContext();
                    for (const drawable of this._drawables) {
                        drawable.draw(drawContext);
                    }
                }                
            }).bind(this))

            this._inputBuffers.forEach(buffer => { buffer.start(); });
        }
    }

    public stop(): void {
        this._stopped = true;
    }
}