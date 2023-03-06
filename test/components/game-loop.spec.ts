import { assert, expect } from "chai";
import * as sinon from 'sinon';
import { initDOM } from "../setup";
import { sleep } from "../../src/helpers";
import { DrawListener, GameLoop, IDrawContext, IGameSettings, IInputBuffer, InputState, IRenderer, IUpdateContext, UpdateListener } from "../../src/components";


describe("Game Loop", () => {
    beforeEach(initDOM);

    [[8, 100], [16, 100], [30,100], [60,500]]
    .forEach(([fps, runLength]) => {
        it(`can run a game loop at ${fps}FPS for ${runLength}ms`, async () => {        
            const expectedCount = Math.round((fps * runLength / 1000) - 1);
            const gameSettingsMock: IGameSettings = { fps: fps, debug: false }        

            let updateCount = 0;

            const gl = new GameLoop(window, gameSettingsMock);
            gl.addUpdateListener(_ => { updateCount++; });

            gl.start();
            await sleep(runLength);
            gl.stop();

            expect(updateCount).to.equal(expectedCount);
        });
    });

    it("uses input buffers", async () => {
        const gameSettingsMock: IGameSettings = { fps: 8, debug: false }
        const fakeState: InputState = {
            Test: [
                {
                    code: 'Test',
                    active: true,
                    activeDurationMs: 100,
                    msSinceLastUpdate: 50
                }
            ]
        }

        const getStateSpy = sinon.spy((timestamp: number) => fakeState);
        const inputBuffer: IInputBuffer = {
            start: sinon.stub(),
            stop: sinon.stub(),
            clear: sinon.stub(),
            getState: getStateSpy
        }

        const updateListener: UpdateListener = (ctx: IUpdateContext) => {
            expect(ctx.inputs['Test']).to.not.equal(undefined);
            expect(ctx.inputs['Test'].length).to.equal(1);
            expect(ctx.inputs['Test'][0].code).to.equal('Test');
            expect(ctx.inputs['Test'][0].active).to.equal(true);
            expect(ctx.inputs['Test'][0].activeDurationMs).to.equal(100);
            expect(ctx.inputs['Test'][0].msSinceLastUpdate).to.equal(50);
        }
        
        const gl = new GameLoop(window, gameSettingsMock);
        gl.addInputBuffer(inputBuffer);
        gl.addUpdateListener(updateListener);
        
        gl.start();
        await sleep(125);
        gl.stop();

        assert.isTrue(getStateSpy.calledOnce)
    });

    it("merges input buffers to create an update context", async () => {
        const gameSettingsMock: IGameSettings = { fps: 8, debug: false }
        const fakeState1: InputState = {
            Test: [
                {
                    code: 'Test',
                    active: true,
                    activeDurationMs: 100,
                    msSinceLastUpdate: 50
                }
            ]
        }

        const fakeState2: InputState = {
            Test: [
                {
                    code: 'Test',
                    active: false,
                    activeDurationMs: 200,
                    msSinceLastUpdate: 75
                }
            ],
            Test2: [
                {
                    code: 'Test2',
                    active: true,
                    activeDurationMs: 300,
                    msSinceLastUpdate: 80
                }
            ]
        }

        const inputBuffer1: IInputBuffer = {
            start: sinon.stub(),
            stop: sinon.stub(),
            clear: sinon.stub(),
            getState: sinon.stub().returns(fakeState1)
        }

        const inputBuffer2: IInputBuffer = {
            start: sinon.stub(),
            stop: sinon.stub(),
            clear: sinon.stub(),
            getState: sinon.stub().returns(fakeState2)
        }

        const updateListener: UpdateListener = (ctx: IUpdateContext) => {
            expect(ctx.inputs['Test']).to.not.equal(undefined);
            expect(ctx.inputs['Test'].length).to.equal(2);
            expect(ctx.inputs['Test'][0].code).to.equal('Test');
            expect(ctx.inputs['Test'][0].active).to.equal(true);
            expect(ctx.inputs['Test'][0].activeDurationMs).to.equal(100);
            expect(ctx.inputs['Test'][0].msSinceLastUpdate).to.equal(50);
            expect(ctx.inputs['Test'][1].code).to.equal('Test');
            expect(ctx.inputs['Test'][1].active).to.equal(false);
            expect(ctx.inputs['Test'][1].activeDurationMs).to.equal(200);
            expect(ctx.inputs['Test'][1].msSinceLastUpdate).to.equal(75);

            expect(ctx.inputs['Test2']).to.not.equal(undefined);
            expect(ctx.inputs['Test2'].length).to.equal(1);
            expect(ctx.inputs['Test2'][0].code).to.equal('Test2');
            expect(ctx.inputs['Test2'][0].active).to.equal(true);
            expect(ctx.inputs['Test2'][0].activeDurationMs).to.equal(300);
            expect(ctx.inputs['Test2'][0].msSinceLastUpdate).to.equal(80);
        }
        
        const gl = new GameLoop(window, gameSettingsMock);
        gl.addInputBuffer(inputBuffer1);
        gl.addInputBuffer(inputBuffer2);
        gl.addUpdateListener(updateListener);
        
        gl.start();
        await sleep(125);
        gl.stop();
    });

    it("uses renderer to create a draw context", async () => {
        const gameSettingsMock: IGameSettings = { fps: 8, debug: false }
        const fakeDrawContext: IDrawContext = {
            context: null,
            isVisible: (rect) => true,
            translate: (loc) => loc
        };
        const getDrawContextSpy = sinon.spy(() => fakeDrawContext);
        const renderer: IRenderer = { getDrawContext: getDrawContextSpy };

        const drawListener: DrawListener = (ctx: IDrawContext) => {
            expect(ctx).to.equal(fakeDrawContext);
        };
        
        const gl = new GameLoop(window, gameSettingsMock);
        gl.setRenderer(renderer);
        gl.addDrawListener(drawListener);
        
        gl.start();
        await sleep(125);
        gl.stop();

        assert.isTrue(getDrawContextSpy.calledOnce);
    });
});