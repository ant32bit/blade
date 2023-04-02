
export interface IRenderPipeline {
    render(renderer: THREE.WebGLRenderer, scene: THREE.Scene, camera: THREE.Camera): void;
}