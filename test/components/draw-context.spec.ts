import { assert, expect } from 'chai';
import * as sinon from 'sinon';
import { DrawContext } from '../../src/components';
import { Coords } from '../../src/locators';
import { IAnimation } from '../../src/models';

describe("Draw Context", () => {
    it ("sets the canvas dimensions to client dimensions on creation", () => {
        const fakeWindow: any = {
            devicePixelRatio: 2
        };
        const fakeHTMLCanvasElement: any = {
            clientWidth: 400,
            clientHeight: 300,
            width: 100,
            height: 100,
            getContext: (s: string) => null
        };
        const drawContext = new DrawContext(fakeWindow, fakeHTMLCanvasElement);
        expect(fakeHTMLCanvasElement.width).to.equal(200);
        expect(fakeHTMLCanvasElement.height).to.equal(150); // 100 + (300 / 2)
    });

    it ("can translate camera coordinates to screen space", () => {
        const fakeWindow: any = {
            devicePixelRatio: 1
        };
        const fakeHTMLCanvasElement: any = {
            clientWidth: 400,
            clientHeight: 300,
            width: 100,
            height: 100,
            getContext: (s: string) => null
        };
        const drawContext = new DrawContext(fakeWindow, fakeHTMLCanvasElement);
        const result = drawContext.translate(new Coords(150, 100));
        expect(result.x).to.equal(350); // 150 + (400 / 2)
        expect(result.y).to.equal(250); // 100 + (300 / 2)
    });

    it ("can fill a canvas with a single colour", () => {
        const fakeWindow: any = {
            devicePixelRatio: 2
        };
        const contextRectSpy = sinon.spy();
        const contextFillSpy = sinon.spy();
        const fakeCanvasRenderingContext2D: any = {
            rect: contextRectSpy,
            fill: contextFillSpy,
            fillStyle: null
        }
        const fakeHTMLCanvasElement: any = {
            clientWidth: 400,
            clientHeight: 300,
            width: 100,
            height: 100,
            getContext: (s: string) => fakeCanvasRenderingContext2D
        };

        const expectedRectArgs = [0,0,200,150];
        const fillColour = "test colour";
        const drawContext = new DrawContext(fakeWindow, fakeHTMLCanvasElement);
        drawContext.fill(fillColour);
        for (let i = 0; i < expectedRectArgs.length; i++)
            expect(contextRectSpy.lastCall.args[i]).to.equal(expectedRectArgs[i]);
        expect(contextFillSpy.lastCall.args.length).to.equal(0);
        expect(fakeCanvasRenderingContext2D.fillStyle).to.equal(fillColour);
    });

    it ("can draw an animation frame", () => {
        const fakeWindow: any = {
            devicePixelRatio: 2
        };
        const contextDrawImageSpy = sinon.spy();
        const fakeCanvasRenderingContext2D: any = {
            drawImage: contextDrawImageSpy
        }
        const fakeHTMLCanvasElement: any = {
            clientWidth: 400,
            clientHeight: 300,
            width: 100,
            height: 100,
            getContext: (s: string) => fakeCanvasRenderingContext2D
        };

        const animation: any = {
            image: "test-image",
            width: 250,
            height: 300,
            centreX: 50,
            centreY: 100,
            frames: [{
                x: 150,
                y: 200
            }]
        }
        const loc = new Coords(350, 400);
        const expectedDrawImageArgs = ["test-image",150,200,250,300,300,300,250,300];
        const drawContext = new DrawContext(fakeWindow, fakeHTMLCanvasElement);
        drawContext.drawAnimationFrame(loc, animation, 0);
        for (let i = 0; i < expectedDrawImageArgs.length; i++)
            expect(contextDrawImageSpy.lastCall.args[i]).to.equal(expectedDrawImageArgs[i]);
    });
});
