import * as fs from "fs";
import * as sinon from "sinon";
import { JSDOM } from "jsdom";

var indexHtml = fs.readFileSync('dist/www-root/index.html').toString();

export function initDOM(done: Mocha.Done = null) {
    const jsdom = new JSDOM(indexHtml);
    global.document = jsdom.window.document;
    global.window = global.document.defaultView;
    global.navigator = window.navigator;

    global.Event = window.Event;
    global.KeyboardEvent = window.KeyboardEvent;
    global.MouseEvent = window.MouseEvent;

    if (done) done();
}

export function setClientDimensions(element: HTMLElement, width: number, height: number) {
    sinon.stub(element, 'clientWidth').value(width);
    sinon.stub(element, 'clientHeight').value(height);
}

export function setClientPixelDensity(windRef: Window, density: number) {
    (windRef as any).devicePixelRatio = density;
}

export function setCanvasContext(element: HTMLCanvasElement) {
    const fakeContext: any = {};
    const getContextStub = sinon.stub(element, 'getContext');
    getContextStub.withArgs('2d').returns(fakeContext);
}
