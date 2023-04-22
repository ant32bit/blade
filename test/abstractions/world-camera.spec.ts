import { assert, expect } from 'chai';
import { IPositioned, WorldCamera } from '../../src/abstractions';
import { Coords } from '../../src/locators';

describe("World Camera", () => {
    it('has a position (initialised to (0,0))', () => {
        const camera = new WorldCamera();
        expect(camera).has.property('position')
        expect(camera.position.x).to.equal(0);
        expect(camera.position.y).to.equal(0);
    });

    it('can accept position coords', () => {
        const camera = new WorldCamera();
        camera.position.x = 5;
        camera.position.y = 6;
        expect(camera.position.x).to.equal(5);
        expect(camera.position.y).to.equal(6);
        camera.position = new Coords(10, 20);
        expect(camera.position.x).to.equal(10);
        expect(camera.position.y).to.equal(20); 
    });

    [
        [new Coords(0, 0), new Coords(5, 10), new Coords(5, 10)],
        [new Coords(5, 10), new Coords(0, 0), new Coords(-5, -10)],
        [new Coords(10, 20), new Coords(5, 30), new Coords(-5, 10)],
    ]
    .forEach(([cameraPos, loc, expectedProjectedLoc]) => {
        it(`can translate ${loc.toString()} to ${expectedProjectedLoc.toString()}`, () => {
            const camera = new WorldCamera();
            camera.position = cameraPos;
            const actualProjectedLoc = camera.project(loc);
            expect(actualProjectedLoc.x).to.equal(expectedProjectedLoc.x);
            expect(actualProjectedLoc.y).to.equal(expectedProjectedLoc.y);
        });
    });

    it('can follow a target', () => {
        const camera = new WorldCamera();
        camera.position.x = 10;
        camera.position.y = 20;
        const target: IPositioned = {
            position: new Coords(10, 10)
        };
        camera.follow(target);

        const projection1 = camera.project(new Coords(30, 30));
        expect(projection1.x).to.equal(10);
        expect(projection1.y).to.equal(0);

        target.position = new Coords(20,20);
        const projection2 = camera.project(new Coords(30, 30));
        expect(projection2.x).to.equal(0);
        expect(projection2.y).to.equal(-10);
    })
});