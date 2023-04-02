import { getLink, loadText } from '../helpers';
import { IElementProvider } from './descriptors/element-provider';
import { IShader } from './shader';

export class LinkedShader implements IShader {

    private registerPromises: { res: () => void, rej: (reason?: any) => void }[];
    private shader: string;
    private _loaded: boolean;
    private _error: string;

    constructor(private elementProvider: IElementProvider, private shaderName: string) {
        let href: string = getLink(elementProvider, 'shader', shaderName);
        this.registerPromises = [];
        loadText(href)
            .then((shader => {
                this.shader = shader;
                this._loaded = true;
                this.registerPromises.forEach(p => p.res());
            }).bind(this))
            .catch(((e: Error) => {
                this._error = e.message;
                this.registerPromises.forEach(p => p.rej(this._error));
            }).bind(this));
    }

    public get name(): string { return this.shaderName; }
    public get content(): string { return this.shader; }
    public get loaded(): boolean { return this._loaded; }
    public get error(): string { return this._error; }

    public async load(): Promise<void> {
        if (this._loaded) {
            return Promise.resolve();
        }

        return new Promise(((res, rej) => {
            this.registerPromises.push({ res, rej });
        }).bind(this))
    }

}
