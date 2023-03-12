export interface IAnimation {
    name: string;
    width: number;
    height: number;
    centreX: number;
    centreY: number;
    duration: number;
    image: HTMLImageElement;
    frames: {
        x: number;
        y: number;
    }[];
}

export class Animation {
    
    private _name: string;
    public get name(): string {
        return this._name;
    }

    private _duration: number;
    public get duration(): number {
        return this._duration;
    }

    public get nFrames(): number {
        return this.frames.length;
    }

    constructor(
        name: string, duration: number,
        private width: number, private height: number, 
        private centreX: number, private centreY: number, 
        private source: HTMLImageElement, private frames: {x: number, y: number}[]) {

        this._name = name;
        this._duration = duration;
    }


}