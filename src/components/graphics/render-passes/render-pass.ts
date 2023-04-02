import * as THREE from 'three';

export interface IRenderPassOptions {
    target: THREE.WebGLRenderTarget;
    antiAlias: number;
    clearColor: THREE.Color;
    clearAlpha: number;
    autoClear: boolean;
    clearDepth: boolean;
    clear: boolean;
    material?: THREE.Material;
}

export abstract class RenderPass {
    
    constructor (private params: IRenderPassOptions) { }

    public get antiAlias(): number { return this.params.antiAlias; };
    public get texture(): THREE.Texture { return this.params.target.texture; }

    public render(renderer: THREE.WebGLRenderer, scene: THREE.Scene, camera: THREE.Camera): void {
        renderer.setRenderTarget(this.params.target);
        renderer.setClearColor(this.params.clearColor);
        renderer.setClearAlpha(this.params.clearAlpha);
        renderer.autoClear = this.params.autoClear;
        if (this.params.clearDepth) renderer.clearDepth();
        if (this.params.clear) renderer.clear();
        if (this.params.material) {
            scene.overrideMaterial = this.params.material;
        }
        renderer.render( scene, camera );
    }
}