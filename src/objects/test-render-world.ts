import { GameSettings, IRenderable, IRenderContext, IUpdateable, IUpdateContext } from "../components";
import { IModelConfig, ITextureConfig, ModelLibrary, TextureLibrary } from "../components/graphics";
import { getLink } from "../helpers";
import { IElementProvider, LinkedShader } from "../models";
import * as THREE from 'three';

export class TestRenderWorld implements IUpdateable, IRenderable {

    private models: ModelLibrary;
    private textures: TextureLibrary;

    private scene: THREE.Scene = null;
    private model: any = null;
    private rotY: number;

    constructor(private gameSettings: GameSettings) {

    }

    public async init(elementProvider: IElementProvider, objects: string[]) {

        const manager = new THREE.LoadingManager();
        
        const configs: {
            model: IModelConfig,
            texture: ITextureConfig
        }[] = [];
        for(const objectName of objects)
            configs.push({
                model: {
                    name: objectName,
                    path: getLink(elementProvider, 'model', objectName)
                },
                texture: {
                    name: objectName,
                    path: getLink(elementProvider, 'texture', objectName),
                    pixelated: true
                }
            });
        
        const models = new ModelLibrary(configs.map(c => c.model));
        await models.load(manager);
        this.models = models;

        const textures = new TextureLibrary(configs.map(c => c.texture));
        await textures.load(manager);
        this.textures = textures;

        const vertexShader = 
`
varying vec2 v_texCoord;

void main() {
    v_texCoord = uv;
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}

`;
        const fragmentShader = new LinkedShader(elementProvider, 'super-nearest-shader');
        await fragmentShader.load();

        const uniforms = {
            u_texture: { value: textures.get(objects[0]) }
        };

        const material = new THREE.ShaderMaterial({
            uniforms,
            vertexShader,
            fragmentShader: fragmentShader.content
        });

        const model = models.get(objects[0]);

        model.traverse( function ( child ) {
            if ( child.isMesh ) child.material = material;
        } );

        model.position.y -= 7; // Magic ~*

        this.model = model;
        this.rotY = 0;
    }

    public update(context: IUpdateContext): void {

        const rate = (2 * Math.PI * -7.5) / (this.gameSettings.fps * 60);
        this.rotY += rate;
        
        this.model.rotation.y = this.rotY;
    }

    public render(context: IRenderContext): void {
        if (!this.scene || this.scene != context.scene) {
            this.scene = context.scene;
            this.scene.add(this.model);

            const ambientLight = new THREE.AmbientLight( 0xcccccc, 0.4 );
            this.scene.add( ambientLight );

            const pointLight = new THREE.PointLight( 0xffffff, 0.8 );
            context.camera.add( pointLight );
            this.scene.add( context.camera );

            pointLight.position.x += 5;
            pointLight.position.y += 3;
            pointLight.position.z += 1;
        }
    }
}