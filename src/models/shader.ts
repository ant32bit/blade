export interface IShader {
    name: string;
    content: string;
}

export class Shader implements IShader {

    public get name() { return this._name; }
    public get content() { return this._content; }

    constructor(private _name: string, private _content: string) {

    }
}