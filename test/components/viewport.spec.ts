import { assert, expect } from "chai";
import * as setup from "../setup";
import { Renderer2D } from "../../src/components";

describe("Viewport", () => {
    beforeEach(setup.initDOM)

    it("connects to the canvas element", () => {
        const viewport = new Renderer2D(document, window);
        const canvas = viewport.canvas;

        assert.isNotNull(canvas);
        expect(canvas.tagName).to.equal("CANVAS");
        expect(canvas.id).to.equal("viewport");
    });

    it("can get the visible rectangle", () => {
        const viewport = new Renderer2D(document, window);
        setup.setClientDimensions(viewport.canvas, 1024, 768);
        setup.setClientPixelDensity(window, 1);
        
        var rect = viewport.getVisibleRect();

        assert.isNotNull(rect);
        expect(rect.x).to.equal(0);
        expect(rect.y).to.equal(0);
        expect(rect.width).to.equal(1024);
        expect(rect.height).to.equal(768);
    });

    it("can get a context", () => {
        const viewport = new Renderer2D(document, window);
        setup.setCanvasContext(viewport.canvas);
        setup.setClientDimensions(viewport.canvas, 1024, 768);
        setup.setClientPixelDensity(window, 1);

        var drawContext = viewport.getDrawContext();

        assert.isNotNull(drawContext);
        expect(drawContext.constructor.name).to.equal('DrawContext');
    });
});
