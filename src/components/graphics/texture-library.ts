import * as THREE from 'three';

export interface ITextureConfig {
    name: string;
    path: string;
    pixelated?: boolean
}

export class TextureLibrary {

    private loadPlan: ITextureConfig[];
    private library: {[name: string]: THREE.Texture}

    constructor(config: ITextureConfig[]) {
        this.loadPlan = [];
        for(const c of config) {
            this.loadPlan.push({
                name: c.name,
                path: c.path,
                pixelated: c.pixelated === true || c.pixelated === false ? c.pixelated : true
            });
        }
        this.library = {};
    }

    public async load(manager: THREE.LoadingManager): Promise<void> {
        await new Promise<void>((res, rej) => {

            const loader = new THREE.TextureLoader( manager );
            let unloadedCount = this.loadPlan.length;
            for(const c of this.loadPlan) {
                loader.load(c.path, (tex: THREE.Texture) => {
                    tex.minFilter = c.pixelated ? THREE.LinearFilter : THREE.NearestFilter;
                    tex.magFilter = c.pixelated ? THREE.LinearFilter : THREE.NearestFilter;
                    this.library[c.name] = tex;
                    unloadedCount--;
                    if (unloadedCount === 0)
                        res();
                });
            } 
        });
    }

    public get(name: string): THREE.Texture {
        return this.library[name];
    }
}