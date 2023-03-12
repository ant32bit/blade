import { IAnimation } from "../models";

export interface ISpritesheetMetadata
{
    width: number;
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

export class LinkedSpritesheet {
    
    private animations: {[name: string]: IAnimation} = null;

    constructor(private document: Document, private title: string, private metadata: ISpritesheetMetadata) {

    }

    public async load(): Promise<void>
    {
        if (this.animations == null) {
            this.animations = {};

            let imageHref: string = null;
            const links = document.getElementsByTagName('link');
            for (const link of links) {
                if (link.rel == 'spritesheet' && link.title == this.title)
                {
                    imageHref = link.href;
                    break;
                }
            }
        
            if (!imageHref)
                throw new Error(`no image found at ${imageHref}`);

            const image = await new Promise<HTMLImageElement>((res, rej) => {
                const image = document.createElement('image') as HTMLImageElement;
                image.src = imageHref;
                image.addEventListener('load', (ev) => { res(image); });
            });
            
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
                    if (x > image.naturalWidth) {
                        x = 0;
                        y += this.metadata.sprites.height;
                    }
                }

                this.animations[animation.name] = animation;
            }
        }
    }

    public getAnimation(title: string): IAnimation {
        return this.animations ? this.animations[title] : null;
    }
}