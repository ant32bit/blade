import { IAnimation } from "./animation";

export interface ISpritesheet {
    name: string;
    getAnimation(name: string): IAnimation;
}

export class Spritesheet implements ISpritesheet {

    private _name: string;

    constructor(name: string, private library: {[name: string]: IAnimation}) {
        this._name = name;
    }

    public get name(): string {
        return this._name;
    }
    public getAnimation(name: string): IAnimation {
        return this.library[name];
    }
}