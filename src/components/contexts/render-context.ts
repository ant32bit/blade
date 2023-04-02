import * as THREE from 'three';


export interface IRenderable {
    render(context: IRenderContext): void;
}

export interface IRenderContext {
    scene: THREE.Scene;
    camera: THREE.Camera;
}

export class RenderContext implements IRenderContext {

    constructor(public scene: THREE.Scene, public camera: THREE.Camera) {
        
    }
}