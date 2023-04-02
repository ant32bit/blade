
class ISetting {
    public raw: any;
    public value: any;
}

class StringSetting implements ISetting {
    private _lastRaw: any;
    private _value: string;

    constructor(private _key: string, private _default: string, private _accept: string[] = null) {
        this._lastRaw = this._default;
        this._value = this._default;
    }

    public get value(): string {
        return this._value;
    }

    public get raw(): string {
        return this._lastRaw;
    }

    public set raw(value: any) {
        if (value !== this._lastRaw) {
            this._lastRaw = value;

            if (value == null) {
                this._value = this._default;
                return;
            }

            var stringVal = value.toString();
            this._value = this._isValid(stringVal) ? stringVal : this._default;
        }
    }

    private _isValid(value: string): boolean {
        return (this._accept == null || this._accept.indexOf(value) >= 0);
    }
}

class BooleanSetting implements ISetting {
    private _lastRaw: any;
    private _value: boolean;

    constructor(private _key: string, private _default: boolean) {
        this._lastRaw = this._default;
        this._value = this._default;
    }

    public get value(): boolean {
        return this._value;
    }

    public get raw(): any {
        return this._lastRaw;
    }

    public set raw(value: any) {
        if (value !== this._lastRaw) {
            this._lastRaw = value;

            if (value == null) {
                this._value = this._default;
                return;
            }

            if (typeof value === 'boolean') {
                this._value = value;
                return;
            }

            if (typeof value === 'number') {
                this._value = value !== 0;
                return;
            }

            const stringVal = value.toString().toLowerCase();
            if (stringVal === 'false')
                this._value = false;
            else if (stringVal === 'true')
                this._value = true;
            else {
                this._value = this._default;
            }
        }
    }
}

class NumberSetting implements ISetting {
    private _lastRaw: any;
    private _value: number;

    constructor(private _key: string, private _default: number, private _min: number = null, private _max: number = null) {
        this._lastRaw = this._default;
        this._value = this._default;
    }

    public get value(): number {
        return this._value;
    }

    public get raw(): any {
        return this._lastRaw;
    }

    public set raw(value: any) {
        if (value !== this._lastRaw) {
            this._lastRaw = value;

            if (value == null) {
                this._value = this._default;
                return;
            }
            
            switch (typeof value) {
                case "string":
                    const intVal = parseInt(value);
                    this._value = this._constrain(intVal);
                    break;
                case "number":
                    this._value = this._constrain(value);
                    break;
                default:
                    this._value = this._default;
            }
        }
    }

    private _constrain(value: number): number {
        if (!isFinite(value)) {
            return this._default;
        }

        if (this._min != null && this._min > value) {
            return this._min;
        }

        if (this._max != null && this._max < value) {
            return this._max;
        }

        return value;
    }
}

export interface ISettingsProvider {
    get(settingName: string): any;
}

export class EnvSettingsProvider implements ISettingsProvider {
    private settings: {[key: string]: ISetting} = {
        'debug': new BooleanSetting('debug', false),
        'fps': new NumberSetting('fps', 8, 4, 60),
        'pixelspermeter': new NumberSetting('pixelspermeter', 32, 8, 128),
        'renderpass': new NumberSetting('renderpass', 5, 1, 5)
    };

    private connectedSettings: {[key: string]: string} = null;

    constructor() {

    }

    public get(settingName: string): any {
        const key = settingName.toLowerCase();
        if (this.connectedSettings && this.connectedSettings.hasOwnProperty(key))
            this.settings[key].raw = this.connectedSettings[key];
        return this.settings[key].value;
    }

    public connectToWindow(window: any) {
        if (window.settings) {
            const settingsToConnect: {[key: string]: any} = window.settings;
            for (const key of Object.keys(this.settings))
            {
                this.settings[key].raw = settingsToConnect[key];
            }
            this.connectedSettings = settingsToConnect;
        }
        else {
            const settingsToConnect: {[key: string]: any} = {};
            for (const key of Object.keys(this.settings))
            {
                settingsToConnect[key] = this.settings[key].raw;
            }
            window.settings = settingsToConnect;
            this.connectedSettings = settingsToConnect;
        }
    }

    public useSearchParams(params: URLSearchParams) {
        for (const key of Object.keys(this.settings)) {
            const val = params.get(key);
            if (val)
                this.settings[key].raw = val;
        }
    }
}

