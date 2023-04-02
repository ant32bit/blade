import * as THREE from 'three';
import { IRenderPassOptions, RenderPass } from './render-pass';

export class LightRenderPass extends RenderPass {

    constructor(renderer: THREE.WebGLRenderer) {
        const parameters = {
			minFilter: THREE.LinearFilter,
			magFilter: THREE.LinearFilter,
			format: THREE.RGBAFormat
		};

        const size = renderer.getSize( new THREE.Vector2() );
		const pixelRatio = renderer.getPixelRatio();
		const width = size.width * pixelRatio;
		const height = size.height * pixelRatio;

        const target = new THREE.WebGLRenderTarget(width, height, parameters);
        target.texture.name = 'light-render-target.rpt';

        const material = new THREE.MeshStandardMaterial({
            color: new THREE.Color(0xffffff),
            roughness: 0.4
        });

        const params: IRenderPassOptions = {
            target, material, antiAlias: 1,
            clearColor: new THREE.Color(0x000000), clearAlpha: 1.0,
            clear: true,
            clearDepth: true,
            autoClear: true,
        };

        super(params);
    }
}