import { numbercmp } from '../helpers';
import { InputState } from '../components';

export type InputMap = {[code: string]: IInputProperties};

export type IInputProperties = {
    action: string;
    falloff?: number;
}

export interface IInputMapper {
    map(inputs: InputState): string[];
}

export class InputMapper implements IInputMapper {

    private _map: InputMap;
    
    constructor(map: InputMap) {
        this._map = map || {};
    }

    public map(inputs: InputState): string[] {
        const counts: {[value: string]: number} = {};
        const mappings: {value: IInputProperties, t: number}[] = [];
        for (const code of Object.keys(inputs)) {
            if (this._map[code]) {
                for (const input of inputs[code]) {
                    if (input.active) {
                        const mapping = {
                            value: this._map[code],
                            t: input.activeDurationMs
                        };
                        if (!mapping.value.falloff || input.activeDurationMs <= mapping.value.falloff) {
                            mappings.push(mapping);
                            counts[mapping.value.action] = (counts[mapping.value.action] || 0) + 1;
                            break;
                        }
                    }
                }
            }
        }
        
        const sortedMappings = mappings.sort((a, b) => numbercmp(a.t, b.t));

        const dedupedMappings: string[] = [];
        for (const mapping of sortedMappings) {
            counts[mapping.value.action] -=1;
            if (counts[mapping.value.action] === 0) {
                dedupedMappings.push(mapping.value.action);
            }
        }

        return dedupedMappings;
    }
}
