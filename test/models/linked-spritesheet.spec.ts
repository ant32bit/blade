import { assert, expect } from 'chai';
import * as sinon from 'sinon';
import { JSDOM } from 'jsdom';
import { IAnimation, ISpritesheetMetadata, LinkedSpritesheet } from '../../src/models';
import { IImageLoader, sleep } from '../../src/helpers';

const assertObjectsAreTheSame = function (actualObj: any, expectedObj: any) {
    expect(typeof actualObj).to.equal(typeof expectedObj);
    if (typeof actualObj != 'object') {
        expect(actualObj).to.equal(expectedObj);
        return;
    }
    if(Array.isArray(actualObj)) {
        expect(Array.isArray(actualObj)).to.equal(Array.isArray(expectedObj));
        expect(actualObj.length).to.equal(expectedObj.length);
        for (let i = 0; i < actualObj.length; i++)
            assertObjectsAreTheSame(actualObj[i], expectedObj[i])
        return;
    }
    if (actualObj.constructor.name != 'Object') {
        console.log(actualObj.constructor.name, expectedObj.constructor.name)
        expect(actualObj.constructor).to.equal(expectedObj.constructor);
        return;
    }
    const actualKeys = Object.keys(actualObj);
    const expectedKeys = Object.keys(expectedObj);
    expect(actualKeys.length).to.equal(expectedKeys.length);
    for(const key of actualKeys) {
        assertObjectsAreTheSame(actualObj[key], expectedObj[key])
    }
}

describe("Linked Spritesheet", () => {
    it("loads a spritesheet from a link", async () => {
        const jsdom = new JSDOM('<link rel="spritesheet" title="test-sprite" type="image/png" href="test.png"/>');
        const document = jsdom.window.document;
        const image: any = {
            naturalWidth: 200
        }
        const imageLoader: IImageLoader = {
            load: function(uri: string) {
                expect(uri).to.equal("test.png");
                return Promise.resolve(image);
            }
        }
        const metadata: ISpritesheetMetadata = {
            title: 'test-sprite',
            sprites: {
                width: 50,
                height: 50,
                centreX: 25,
                centreY: 25
            },
            animations: [
                {
                    name: "test-animation-1",
                    nFrames: 5,
                    duration: 12
                },
                {
                    name: "test-animation-2",
                    nFrames: 7,
                    duration: 24
                }
            ]
        }
        const linkedSpritesheet = new LinkedSpritesheet(document, imageLoader, metadata);
        await linkedSpritesheet.load();
        const animation1 = linkedSpritesheet.getAnimation('test-animation-1');
        const expectedAnimation1: IAnimation = {
            name: 'test-animation-1',
            width: 50,
            height: 50,
            centreX: 25,
            centreY: 25,
            duration: 12,
            image: image,
            frames: [
                {x: 0, y: 0},
                {x: 50, y: 0},
                {x: 100, y: 0},
                {x: 150, y: 0},
                {x: 0, y: 50}
            ]
        };
        assertObjectsAreTheSame(animation1, expectedAnimation1);

        const animation2 = linkedSpritesheet.getAnimation('test-animation-2');
        const expectedAnimation2: IAnimation = {
            name: 'test-animation-2',
            width: 50,
            height: 50,
            centreX: 25,
            centreY: 25,
            duration: 24,
            image: image,
            frames: [
                {x: 50, y: 50},
                {x: 100, y: 50},
                {x: 150, y: 50},
                {x: 0, y: 100},
                {x: 50, y: 100},
                {x: 100, y: 100},
                {x: 150, y: 100}
            ]
        };
        assertObjectsAreTheSame(animation2, expectedAnimation2);
    });
});
