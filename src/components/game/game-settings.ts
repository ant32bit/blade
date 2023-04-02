import { ISettingsProvider } from '../env-settings-provider';

export interface IGameSettings {
    debug: boolean;
    fps: number;
    pixelsPerMeter: number;
    renderPass: number;
}

export class GameSettings implements IGameSettings {

    constructor(private _settingsProvider: ISettingsProvider) { }

    public get debug(): boolean {
        return this._settingsProvider.get('debug');
    }

    public get fps(): number {
        return this._settingsProvider.get('fps');
    }

    public get pixelsPerMeter(): number {
        return this._settingsProvider.get('pixelspermeter');
    }

    public get renderPass(): number {
        return this._settingsProvider.get('renderpass');
    }
}