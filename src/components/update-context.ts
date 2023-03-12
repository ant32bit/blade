
export interface IUpdateContext {
    inputs: InputState;
}

export type InputState = {[key: string]: IInputEvent[]};

export interface IInputEvent {
    code: string;
    active: boolean;
    activeDurationMs: number;
    msSinceLastUpdate: number;
}

export interface IUpdateable {
    update(context: IUpdateContext): void;
}

