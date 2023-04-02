import { IDeviceSettings, IElementProvider } from '../../models';
import { IRenderContext, RenderContext } from '../contexts/render-context';
import { IRenderer3D } from './game-loop';
import { IGameSettings } from './game-settings';
import { IRenderPipeline } from '../graphics';
import * as THREE from 'three';

export class Renderer3D implements IRenderer3D {

    private _canvas: HTMLCanvasElement = null;
    private _renderer: THREE.WebGLRenderer;
    private _scene: THREE.Scene;
    private _camera: THREE.Camera;

    private _ratio: number;
    private _width: number;
    private _height: number;

    public get canvas(): HTMLCanvasElement { return this._canvas; }
    public get width(): number { return this._width; }
    public get height(): number { return this._height; }

    constructor(
        private elementProvider: IElementProvider, 
        private deviceSettings: IDeviceSettings, 
        private renderPipeline: IRenderPipeline) {

        this._loadCanvas();
        this._scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera( 45, 1, 1, 1000 );
        camera.position.y = 7;
        camera.position.z = 25;
        this._camera = camera;
        this._scene.add(this._camera);
    }

    getRenderContext(): IRenderContext {
        const renderContext = new RenderContext(this._scene, this._camera);
        return renderContext;
    }

    render(context: IRenderContext) {
        this._loadCanvas();

        this._renderer.setClearColor(new THREE.Color(0xffffff));

        if (this._scene !== context.scene)
            this._scene = context.scene;

        if (this._camera !== context.camera)
            this._camera = context.camera;

        this.renderPipeline.render(this._renderer, this._scene, this._camera);
    }

    private _loadCanvas(): void {
        if (this._canvas == null) {
            this._canvas = this.elementProvider.getElementById('viewport') as HTMLCanvasElement;
            this._renderer = new THREE.WebGLRenderer({ canvas: this._canvas });
        }
        
        if (this._canvas != null) {
            this._ratio = this.deviceSettings.devicePixelRatio;
            this._width = this._canvas.clientWidth;
            this._height = this._canvas.clientHeight;
        }
    }
}