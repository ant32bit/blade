import { assert, expect } from "chai";
import { EnvSettingsProvider } from "../../src/components";

describe("Env Settings Provider", () => {
    it ("initialises settings", () => {
        const envSettingsProvider = new EnvSettingsProvider();

        assert.isNotNull(envSettingsProvider);
        expect(envSettingsProvider.get('debug')).to.equal(false);
        expect(envSettingsProvider.get('fps')).to.equal(8);
    });

    it("reads settings from search params", () => {
        const searchParams = new URLSearchParams("debug=true&fps=16");
        const envSettingsProvider = new EnvSettingsProvider();
        envSettingsProvider.useSearchParams(searchParams);

        expect(envSettingsProvider.get('debug')).to.equal(true);
        expect(envSettingsProvider.get('fps')).to.equal(16);
    });

    it("can synchronsize to a window object", () => {
        const window: any = {};
        const envSettingsProvider = new EnvSettingsProvider();
        envSettingsProvider.connectToWindow(window);

        expect(window.settings.debug).to.equal(false);
        expect(window.settings.fps).to.equal(8);

        window.settings.debug = true;
        window.settings.fps = 16;

        expect(envSettingsProvider.get('debug')).to.equal(true);
        expect(envSettingsProvider.get('fps')).to.equal(16);
    });

    [
        ["true", true], ["false", false],
        ["True", true], ["False", false],
        ["TRUE", true], ["FALSE", false],
        [1, true], [0, false],
        [true, true], [false, false]
    ]
    .forEach(([value, expected]) => {
        it(`can translate ${value} to ${expected} for debug`, () => {
            const window: any = {};
            const envSettingsProvider = new EnvSettingsProvider();
            envSettingsProvider.connectToWindow(window);
    
            window.settings.debug = value;
            expect(envSettingsProvider.get('debug')).to.equal(expected);
        });
    });

    [
        ["10", 10], ["2", 4], ["100", 60],
        [12, 12], [-1, 4], [1000, 60],
        [NaN, 8], [null, 8], ["dog", 8], [true, 8]
    ]
    .forEach(([value, expected]) => {
        it(`can translate ${value} to ${expected} for fps`, () => {
            const window: any = {};
            const envSettingsProvider = new EnvSettingsProvider();
            envSettingsProvider.connectToWindow(window);
    
            window.settings.fps = value;
            expect(envSettingsProvider.get('fps')).to.equal(expected);
        });
    });
})