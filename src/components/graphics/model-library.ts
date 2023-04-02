import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader';

export interface IModelConfig {
    name: string;
    path: string;
}

export type ModelProgressListener = (percentComplete: number) => void;

export class ModelLibrary {

    private loadPlan: IModelConfig[];
    private library: {[name: string]: any}
    private listeners: ModelProgressListener[];

    constructor(config: IModelConfig[]) {
        this.loadPlan = [];
        for(const c of config) {
            this.loadPlan.push({
                name: c.name,
                path: c.path
            });
        }
        this.library = {};
        this.listeners = [];
    }

    public addModelProgressListener(listener: ModelProgressListener) {
        this.listeners.push(listener);
    }

    public async load(manager: THREE.LoadingManager): Promise<void> {
        await new Promise<void>((res, rej) => {

            const total = this.loadPlan.length;
            let unloadedCount = total;
            let errorCount = 0; 

            function markOneLoaded() {
                unloadedCount--;
                if (unloadedCount === 0)
                    if (errorCount === total) {
                        rej();
                    } else {
                        res();
                    }
            }
            
            function onModelProgress( xhr ) {

                if ( xhr.lengthComputable ) {
                    const percentComplete = xhr.loaded / xhr.total * 100;
                    this.listeners.forEach((l: ModelProgressListener) => l(percentComplete));
                }
            }
    
            function onModelError() {
                errorCount++;
                markOneLoaded();
            }
    
            const loader = new OBJLoader( manager );
            
            for (const c of this.loadPlan) {
                loader.load(c.path, (obj) => {
                    this.library[c.name] = obj;
                    markOneLoaded();
                }, onModelProgress.bind(this), onModelError.bind(this) );
            }
        });
    }
    
    public get(name: string): any {
        return this.library[name];
    }
}