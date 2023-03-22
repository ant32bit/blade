import { assert, expect } from 'chai';
import * as sinon from 'sinon';
import { InputState } from '../../src/components';
import { InputMap, InputMapper } from '../../src/abstractions';

describe("Input Mapper", () => {
    it('can map an input state to a character state', () => {
        const inputState: InputState = {
            KeyA: [
                {
                    code: 'KeyA',
                    active: true,
                    activeDurationMs: 20,
                    msSinceLastUpdate: 10
                }
            ]
        };

        const map: InputMap = {
            'KeyA': { action: 'left' }
        }

        const inputMapper = new InputMapper(map);
        const mappings = inputMapper.map(inputState);

        expect(mappings).to.contain('left');
    });

    it('only maps active states', () => {
        const inputState: InputState = {
            KeyA: [
                {
                    code: 'KeyA',
                    active: false,
                    activeDurationMs: 20,
                    msSinceLastUpdate: 10
                }
            ]
        };

        const map: InputMap = {
            'KeyA': { action: 'left' }
        }

        const inputMapper = new InputMapper(map);
        const mappings = inputMapper.map(inputState);

        expect(mappings).to.not.contain('left');
    });

    it('will map when any entry is active', () => {
        const inputState: InputState = {
            KeyA: [
                {
                    code: 'KeyA',
                    active: false,
                    activeDurationMs: 14,
                    msSinceLastUpdate: 2
                },
                {
                    code: 'KeyA',
                    active: true,
                    activeDurationMs: 20,
                    msSinceLastUpdate: 10
                }
            ]
        };

        const map: InputMap = {
            'KeyA': { action: 'left' }
        }

        const inputMapper = new InputMapper(map);
        const mappings = inputMapper.map(inputState);

        expect(mappings).to.contain('left');
    });

    it('does not duplicate mappings', () => {
        const inputState: InputState = {
            KeyA: [{
                code: 'KeyA',
                active: true,
                activeDurationMs: 14,
                msSinceLastUpdate: 2
            }],
            ArrowLeft: [{
                code: 'ArrowLeft',
                active: true,
                activeDurationMs: 20,
                msSinceLastUpdate: 10
            }]
        };

        const map: InputMap = {
            'KeyA': { action: 'left' },
            'ArrowLeft': { action: 'left' }
        }

        const inputMapper = new InputMapper(map);
        const mappings = inputMapper.map(inputState);

        expect(mappings.filter(m => m === 'left').length).to.equal(1);
    });

    it('prioritises mappings by time (latest first)', () => {
        const inputState: InputState = {
            KeyA: [{
                code: 'KeyA',
                active: true,
                activeDurationMs: 100,
                msSinceLastUpdate: 10
            }],
            KeyQ: [{
                code: 'KeyQ',
                active: true,
                activeDurationMs: 200,
                msSinceLastUpdate: 10
            }],
            ArrowLeft: [{
                code: 'ArrowLeft',
                active: true,
                activeDurationMs: 300,
                msSinceLastUpdate: 10
            }],
            KeyW: [{
                code: 'KeyW',
                active: true,
                activeDurationMs: 400,
                msSinceLastUpdate: 10
            }],
        };

        const map: InputMap = {
            'KeyA': { action: 'left' },
            'ArrowLeft': { action: 'left' },
            'KeyQ': { action: 'attack' },
            'KeyW': { action: 'up' }
        }

        const inputMapper = new InputMapper(map);
        const mappings = inputMapper.map(inputState);

        expect(mappings[0]).to.equal('attack');
        expect(mappings[1]).to.equal('left');
        expect(mappings[2]).to.equal('up');
    });

    it('applies falloff to input', () => {
        const inputState: InputState = {
            KeyA: [{
                code: 'KeyA',
                active: true,
                activeDurationMs: 200,
                msSinceLastUpdate: 2
            }],
            KeyB: [{
                code: 'KeyB',
                active: true,
                activeDurationMs: 201,
                msSinceLastUpdate: 10
            }]
        };

        const map: InputMap = {
            'KeyA': { action: 'test-a', falloff: 200 },
            'KeyB': { action: 'test-b', falloff: 200 }
        };

        const inputMapper = new InputMapper(map);
        const mappings = inputMapper.map(inputState);

        expect(mappings).to.contain('test-a');
        expect(mappings).not.to.contain('test-b');
    });
});