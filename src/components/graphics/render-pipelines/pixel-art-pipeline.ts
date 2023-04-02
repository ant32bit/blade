import { IElementProvider } from "../../../models/descriptors/element-provider";
import { LinkedShader } from "../../../models";
import { IRenderPipeline } from "./render-pipeline";
import * as THREE from 'three';
import { IGameSettings } from "../../game/game-settings";
import { RenderPass, ColorRenderPass, LightRenderPass, NormalsRenderPass, DepthsRenderPass } from "../render-passes";

export class PixelArtPipeline implements IRenderPipeline {
    private passes: RenderPass[];
    private vertexShader: string;
    private fragmentShader: string;
    private renderView: number;
    private renderMeshGeometry: THREE.BufferGeometry;
    private renderMeshMaterial: THREE.Material;
    private renderCamera: THREE.Camera;
    private size: THREE.Vector2;
    private initialised: boolean;

    constructor(private gameSettings: IGameSettings) {
        this.initialised = false;
    }

    public async init(elementProvider: IElementProvider) {
        if (this.initialised)
            return;

        this.vertexShader = `
            varying vec2 v_pixel;

            void main() {
                v_pixel = uv;
                gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
            }
        `;
        
        const fragmentShader = new LinkedShader(elementProvider, 'final-shader');
        await fragmentShader.load();
        this.fragmentShader = fragmentShader.content;

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( [ -1, 3, 0, -1, -1, 0, 3, -1, 0 ], 3 ) );
        geometry.setAttribute( 'uv', new THREE.Float32BufferAttribute( [ 0, 2, 0, 0, 2, 0 ], 2 ) );
        this.renderMeshGeometry = geometry;

        this.size = new THREE.Vector2(0, 0);
        this.renderView = 5;
    }

    public render(renderer: THREE.WebGLRenderer, scene: THREE.Scene, camera: THREE.Camera): void {
        this.refresh(renderer);

        for(const pass of this.passes) {
            pass.render(renderer, scene, camera);
        }

        const renderMesh = new THREE.Mesh( this.renderMeshGeometry, this.renderMeshMaterial );

        renderer.setRenderTarget(null)
        renderer.render(renderMesh, this.renderCamera);
    }

    private refresh(renderer: THREE.WebGLRenderer) {
        const size = renderer.getSize( new THREE.Vector2() );
        if (this.renderView === this.gameSettings.renderPass && this.size && size.x === this.size.x && size.y === this.size.y)
            return;

        this.size = size.clone()//.divideScalar(this.gameSettings.pixelsPerMeter);
        const mid = size.clone().divideScalar(2);

        const color = new ColorRenderPass(renderer);
        const light = new LightRenderPass(renderer);
        const normals = new NormalsRenderPass(renderer, 2);
        const depths = new DepthsRenderPass(renderer, 2);
        this.passes = [color, light, normals, depths];

        const uniforms = {
            u_pixelSize: { value: new THREE.Vector2(1.0 / size.x, 1.0 / size.y) },
            u_normalsAA: { value: normals.antiAlias },
            u_depthsAA: { value: depths.antiAlias },
            u_color: { value: color.texture },
            u_light: { value: light.texture },
            u_normals: { value: normals.texture },
            u_depths: { value: depths.texture }
        }; 

        this.renderMeshMaterial = new THREE.ShaderMaterial({
            uniforms,
            vertexShader: this.vertexShader,
            fragmentShader: this.fragmentShader
        });

        if (this.gameSettings.renderPass < 5) {
            this.renderMeshMaterial = new THREE.MeshBasicMaterial({
                map: this.passes[this.gameSettings.renderPass - 1].texture
            });
        }

        this.renderCamera = new THREE.OrthographicCamera( mid.x - size.x, size.x - mid.x, size.y - mid.y, mid.y - size.y, 0, 1 );
    }
}