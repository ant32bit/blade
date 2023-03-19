import { ISettingsProvider } from '../env-settings-provider';

export interface IGameSettings {
    debug: boolean;
    fps: number;
}

export class GameSettings implements IGameSettings {

    constructor(private _settingsProvider: ISettingsProvider) { }

    public get debug(): boolean {
        return this._settingsProvider.Get('debug');
    }

    public get fps(): number {
        return this._settingsProvider.Get('fps');
    }
}