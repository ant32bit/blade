import { IInputBuffer } from "./game-loop";
import { IInputEvent, InputState } from "./update-context";

export class KeyInputBuffer implements IInputBuffer {

    private _started: boolean;
    private _element: HTMLElement;
    private _keydownHandler: (ev: KeyboardEvent) => void;
    private _keyupHandler: (ev: KeyboardEvent) => void;

    private _keyEventBuffer: IKeyEvent[];
    private _keyEventActiveIndex: {[code: string]: IKeyEvent};

    constructor(element: HTMLElement) {
        this._element = element;
        this._keydownHandler = (event: KeyboardEvent) => {
            if (!this._keyEventActiveIndex[event.code]) {
                const keyEvent: IKeyEvent = {
                    code: event.code,
                    startTimestamp: event.timeStamp,
                    endTimestamp: null,
                    broadcastTimestamp: null
                };
                this._keyEventActiveIndex[keyEvent.code] = keyEvent;
                this._keyEventBuffer.push(keyEvent);
            }
        };
        
        this._keyupHandler = (event: KeyboardEvent) => {
            if (this._keyEventActiveIndex[event.code]) {
                this._keyEventActiveIndex[event.code].endTimestamp = event.timeStamp;
                delete this._keyEventActiveIndex[event.code];
            }
        };

        this.clear();
        this._started = false;
    }

    public start() {
        if (!this._started) {
            this.clear();
            this._element.addEventListener('keydown', this._keydownHandler);
            this._element.addEventListener('keyup', this._keyupHandler);
            this._started = true;
        }
    }

    public stop() {
        if (this._started) {
            this._element.removeEventListener('keydown', this._keydownHandler);
            this._element.removeEventListener('keyup', this._keyupHandler);
            this._started = false;
        }
    }

    public clear() {
        this._keyEventActiveIndex = {};
        this._keyEventBuffer = [];
    }

    public getState(timestamp: number): InputState {
        const state: InputState = {};
        const swapBuffer: IKeyEvent[] = [];

        for (const event of this._keyEventBuffer) {
            if (!state[event.code])
                state[event.code] = [];
            state[event.code].push({
                code: event.code,
                active: event.endTimestamp == null,
                activeDurationMs: (event.endTimestamp || timestamp) - event.startTimestamp,
                msSinceLastUpdate: timestamp - (event.broadcastTimestamp || event.startTimestamp)
            });

            if (event.endTimestamp == null) {
                event.broadcastTimestamp = timestamp;
                swapBuffer.push(event);
            }
        }

        this._keyEventBuffer = swapBuffer;
        return state;
    }
}

interface IKeyEvent {
    code: string;
    startTimestamp: number;
    endTimestamp: number;
    broadcastTimestamp: number;
}