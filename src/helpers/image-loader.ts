export interface IImageLoader {
    load(uri: string): Promise<HTMLImageElement>;
}

export class ImageLoader implements IImageLoader {
    public async load(uri: string): Promise<HTMLImageElement> {
        return await new Promise<HTMLImageElement>((res, rej) => {
            const image = new Image();
            image.addEventListener('load', _ => { 
                res(image);
            });
            image.addEventListener('error', (e: ErrorEvent) => { 
                rej(e);
            });
            image.src = uri;
        });
    }
}