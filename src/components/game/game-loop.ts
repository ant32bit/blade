import { IDrawable, IDrawContext } from "../contexts/draw-context";
import { IGameSettings } from "./game-settings";
import { IInputEvent, InputState, IUpdateable, IUpdateContext } from "../contexts/update-context";

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

    private _frameThreshold: number;
    private _lastFrameHeartRate: number;
    private _lastTotalFramesUpdate: number;
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
                    if (this._lastFrameHeartRate < 0) {
                        this._frameThreshold = frameSpan;
                        this._lastFrameHeartRate = heartRateTimeStamp;
                    }
                    if (heartRateTimeStamp - this._frameThreshold >= 0) {
                        this._lastTotalFramesUpdate = (heartRateTimeStamp - this._lastFrameHeartRate) / frameSpan;
                        this._frameThreshold += frameSpan;
                        callback(heartRateTimeStamp);
                        this._lastFrameHeartRate = heartRateTimeStamp;
                    }
                    if (!this._stopped)
                        windowRef.requestAnimationFrame(_doFrame);
                }
                
                if (!this._stopped)
                    windowRef.requestAnimationFrame(_doFrame);
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

                    this._lastFrameHeartRate = Date.now();
                    this._frameThreshold += 1000 / gameSettings.fps;

                    callback(this._lastFrameHeartRate);
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
            this._lastFrameHeartRate = -1;
            this._frameThreshold = -1;
            
            this._frameFn(((hrts: number) => {
                const updateContext: IUpdateContext = {
                    inputs: {},
                    framesSinceLastUpdate: Math.round(this._lastTotalFramesUpdate),
                    lastUpdateTime: this._lastFrameHeartRate,
                    currUpdateTime: hrts
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
        this._inputBuffers.forEach(buffer => { buffer.stop(); });
        this._stopped = true;
    }
}