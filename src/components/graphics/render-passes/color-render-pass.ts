import * as THREE from 'three';
import { IRenderPassOptions, RenderPass } from './render-pass';

export class ColorRenderPass extends RenderPass {

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
        target.texture.name = 'color-render-target.rpt';

        const clearColor = new THREE.Color();
        renderer.getClearColor(clearColor);
        const clearAlpha = renderer.getClearAlpha();

        const params: IRenderPassOptions = {
            target, clearColor, clearAlpha, antiAlias: 1,
            clear: true,
            clearDepth: true,
            autoClear: renderer.autoClear,
        };

        super(params);
    }
}