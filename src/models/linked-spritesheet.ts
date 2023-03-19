import { IImageLoader } from "../helpers";
import { IAnimation } from "./animation";
import { ISpritesheet, Spritesheet } from "./spritesheet";

export interface ISpritesheetMetadata
{
    title: string;
    sprites: {
        width: number;
        height: number;
        centreX: number;
        centreY: number;
    };
    animations: {
        name: string;
        nFrames: number;
        duration: number;
    }[];
}

export class LinkedSpritesheet implements ISpritesheet {
    
    private animations: {[name: string]: IAnimation} = null;
    private registerPromises: { res: () => void, rej: (reason?: any) => void }[];
    private _loaded: boolean;
    private _error: string;
    private _image: HTMLImageElement;

    constructor(private documentRef: Document, private imageLoader: IImageLoader, private metadata: ISpritesheetMetadata) {
        this.animations = {};
        this.registerPromises = [];
        this._loaded = false;
        this._error = null;

        let href: string;
        const links = documentRef.getElementsByTagName('link');
        for (const link of links) {
            if (link.rel == 'spritesheet' && link.title == this.metadata.title)
            {
                href = link.href;
                break;
            }
        }
        imageLoader
            .load(href)
            .then((image => {
                this._image = image;

                try {
                    let x = 0, y = 0;
                    for (const animMetadata of this.metadata.animations) {
                        var animation: IAnimation = {
                            name: animMetadata.name,
                            width: this.metadata.sprites.width,
                            height: this.metadata.sprites.height,
                            centreX: this.metadata.sprites.centreX,
                            centreY: this.metadata.sprites.centreY,
                            image: image,
                            frames: [],
                            duration: animMetadata.duration
                        }

                        for (let i = 0; i < animMetadata.nFrames; i++) {
                            animation.frames.push({x, y});

                            x = x + this.metadata.sprites.width;
                            if (x >= image.naturalWidth) {
                                x = 0;
                                y += this.metadata.sprites.height;
                            }
                        }

                        this.animations[animation.name] = animation;
                    }

                    this._loaded = true;
                    this.registerPromises.forEach(p => p.res());
                }
                catch(e) {
                    this._error = e.message;
                    this.registerPromises.forEach(p => p.rej(this._error));
                }
            }).bind(this))
            .catch(((e: ErrorEvent) => {
                this._error = e.message;
                this.registerPromises.forEach(p => p.rej(this._error));
            }).bind(this));
    }

    public get name(): string { return this.metadata.title; }
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

    public getAnimation(name: string): IAnimation {
        return this.animations ? this.animations[name] : null;
    }

    public async createMirror(): Promise<ISpritesheet> {
        await this.load();
        const canvas = this.documentRef.createElement('canvas');
        canvas.width = this._image.naturalWidth;
        canvas.height = this._image.naturalHeight;
        const context = canvas.getContext("2d");

        context.fillStyle = 'rgba(0,0,0,0)';
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.translate(canvas.width,0);
        context.scale(-1,1);
        context.drawImage(this._image, 0, 0);
        context.setTransform(1, 0, 0, 1, 0, 0);
        
        const mirroredImage = await this.imageLoader.load(canvas.toDataURL('image/png'));

        const mirroredAnimations: {[name: string]: IAnimation} = {};
        for (const name of Object.keys(this.animations)) {
            const animation = this.animations[name];
            mirroredAnimations[name] = {
                name: animation.name,
                width: animation.width,
                height: animation.height,
                centreX: animation.centreX,
                centreY: animation.centreY,
                duration: animation.duration,
                image: mirroredImage,
                frames: []
            };

            for(const frame of animation.frames) {
                mirroredAnimations[name].frames.push({
                    x: canvas.width - animation.width - frame.x,
                    y: frame.y
                });
            }
        }

        return new Spritesheet(this.name + "-mirror", mirroredAnimations);
    }
}
