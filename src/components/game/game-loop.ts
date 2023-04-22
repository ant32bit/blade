import { IDrawable, IDrawContext } from "../contexts/draw-context";
import { IGameSettings } from "./game-settings";
import { IInputEvent, InputState, IUpdateable, IUpdateContext } from "../contexts/update-context";
import { IInputMapper } from "../../abstractions";

export interface IInputBuffer {
    start(): void;
    stop(): void;
    clear(): void;
    getState(timestamp: number): InputState;
}

export interface IRenderer {
    getDrawContext(): IDrawContext;
}

export interface IIntervalProvider {
    requestAnimationFrame?: (callback: (hrts: number) => void) => void;
    setInterval(callback: () => void, intervalMs: number): number;
    clearInterval(intervalId: number): void;
}

export class GameLoop {

    private _frameThreshold: number;
    private _lastFrameHeartRate: number;
    private _cumulativeDuration: number;
    private _stopped: boolean = true;
    private _frameFn: (callback: (heartRateTimeStamp: number) => void) => void;
    private _updateables: IUpdateable[] = [];
    private _drawables: IDrawable[] = [];
    private _inputBuffers: IInputBuffer[] = [];
    private _renderer: IRenderer = null;

    constructor(windowRef: IIntervalProvider, private gameSettings: IGameSettings, public inputMapper: IInputMapper = null) {
        if (windowRef.requestAnimationFrame) {
            this._frameFn = (callback: (elapsedMs: number) => void) => {
                const _doFrame = (heartRateTimeStamp: number) => {
                    const frameSpan = 1000 / gameSettings.fps;
                    if (this._lastFrameHeartRate < 0) {
                        this._frameThreshold = frameSpan;
                        this._lastFrameHeartRate = heartRateTimeStamp;
                        this._cumulativeDuration = heartRateTimeStamp;
                    }
                    if (heartRateTimeStamp - this._frameThreshold >= 0) {
                        const elapsedMs = heartRateTimeStamp - this._cumulativeDuration;
                        this._cumulativeDuration += elapsedMs;
                        this._frameThreshold += frameSpan;
                        callback(elapsedMs);
                        this._lastFrameHeartRate = heartRateTimeStamp;
                    }
                    if (!this._stopped)
                        windowRef.requestAnimationFrame(_doFrame);
                }
                
                if (!this._stopped)
                    windowRef.requestAnimationFrame(_doFrame);
            }
        } else {
            this._frameFn = (callback: (elapsedMs: number) => void) => {
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

                    const now = Date.now();
                    if (this._lastFrameHeartRate < 0) {
                        this._lastFrameHeartRate = now;
                    }
                    const elapsedMs = now - this._lastFrameHeartRate;
                    this._lastFrameHeartRate += elapsedMs; 
                    this._frameThreshold += 1000 / gameSettings.fps;

                    callback(elapsedMs);
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
            
            this._frameFn(((elapsedMs: number) => {
                const updateContext: IUpdateContext = {
                    inputs: {},
                    state: [],
                    fps: this.gameSettings.fps,
                    elapsedMs,
                    lastUpdateTime: this._lastFrameHeartRate,
                    currUpdateTime: this._lastFrameHeartRate + elapsedMs
                }

                for (const buffer of this._inputBuffers) {
                    const state = buffer.getState(updateContext.currUpdateTime);
                    for (const key of Object.keys(state)) {
                        if (!updateContext.inputs[key])
                            updateContext.inputs[key] = [];
                        updateContext.inputs[key].push(...state[key])
                    }
                }

                if (this.inputMapper) {
                    updateContext.state = this.inputMapper.map(updateContext.inputs);
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