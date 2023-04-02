import * as THREE from 'three';
import { IRenderPassOptions, RenderPass } from './render-pass';

export class NormalsRenderPass extends RenderPass {

    constructor(renderer: THREE.WebGLRenderer, antiAlias: number = 1) {
        const parameters = {
			minFilter: THREE.LinearFilter,
			magFilter: THREE.LinearFilter,
			format: THREE.RGBAFormat
		};

        const size = renderer.getSize( new THREE.Vector2() );
		const pixelRatio = renderer.getPixelRatio();
		const width = size.width * pixelRatio * antiAlias;
		const height = size.height * pixelRatio * antiAlias;

        const target = new THREE.WebGLRenderTarget(width, height, parameters);
        target.texture.name = 'normals-render-target.rpt';

        const params: IRenderPassOptions = {
            target, material: new THREE.MeshNormalMaterial(), 
            antiAlias,
            clearColor: new THREE.Color(0x727200), clearAlpha: 1.0,
            clear: true,
            clearDepth: true,
            autoClear: true,
        };

        super(params);
    }
}