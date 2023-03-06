import { assert, expect } from 'chai';
import * as setup from '../setup';
import { sleep } from '../../src/helpers';
import { KeyInputBuffer } from '../../src/components';

describe("Key Input Buffer", () => {
    beforeEach(setup.initDOM);

    it('can connect to a key listener', async () => {
        const element = document.getElementById('viewport');
        const buffer = new KeyInputBuffer(element);
        buffer.start();

        const downEvent = new Event('keydown');
        (downEvent as any).code = 'KeyA';
        element.dispatchEvent(downEvent);
        const upEvent = new Event('keyup');
        (upEvent as any).code = 'KeyA';
        element.dispatchEvent(upEvent);
        
        await sleep(0);

        const expectedDurationMs = upEvent.timeStamp - downEvent.timeStamp;
        const expectedMsSinceLastUpdate = 100;
        const broadcastTime = downEvent.timeStamp + expectedMsSinceLastUpdate;

        const inputState = buffer.getState(broadcastTime);
        const events = inputState['KeyA'];
        buffer.stop();

        expect(events.length).to.equal(1);
        expect(events[0].code).to.equal('KeyA');
        expect(events[0].active).to.equal(false);
        expect(events[0].activeDurationMs).to.equal(expectedDurationMs);
        expect(events[0].msSinceLastUpdate).to.equal(expectedMsSinceLastUpdate);
    });

    it('deletes finished events after an update', async () => {
        const element = document.getElementById('viewport');
        const buffer = new KeyInputBuffer(element);
        buffer.start();

        const downAEvent = new Event('keydown');
        (downAEvent as any).code = 'KeyA';
        element.dispatchEvent(downAEvent);
        const downBEvent = new Event('keydown');
        (downBEvent as any).code = 'KeyB';
        element.dispatchEvent(downBEvent);
        const upAEvent = new Event('keyup');
        (upAEvent as any).code = 'KeyA';
        element.dispatchEvent(upAEvent);
        await sleep(0);

        const expectedUpdateDurationMs = 2;

        const firstUpdateTime = downBEvent.timeStamp + expectedUpdateDurationMs;
        const secondUpdateTime = downBEvent.timeStamp + expectedUpdateDurationMs * 2;

        const firstUpdate = buffer.getState(firstUpdateTime);
        
        const secondUpdate = buffer.getState(secondUpdateTime);
        const eventsForA = secondUpdate['KeyA'];
        const eventsForB = secondUpdate['KeyB'];

        buffer.stop();

        assert.isUndefined(eventsForA);
        expect(eventsForB.length).to.equal(1);
        expect(eventsForB[0].code).to.equal('KeyB');
        expect(eventsForB[0].active).to.equal(true);
        expect(eventsForB[0].activeDurationMs).to.equal(expectedUpdateDurationMs * 2);
        expect(eventsForB[0].msSinceLastUpdate).to.equal(expectedUpdateDurationMs);
    });

    
});

