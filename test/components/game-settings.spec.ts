import { assert, expect } from "chai";
import * as sinon from "sinon";
import { ISettingsProvider, GameSettings } from "../../src/components";

describe("Game Settings", () => {
    it("provides debug setting from settings provider", () => {
        
        const expectedValue = true;
        const providerGetStub = sinon.stub().withArgs('debug').returns(expectedValue);
        const settingsProviderStub: ISettingsProvider = { get: providerGetStub };
        
        const gameSettings = new GameSettings(settingsProviderStub);

        expect(gameSettings.debug).to.equal(expectedValue);
        expect(providerGetStub.withArgs('debug').callCount).to.equal(1);
        expect(providerGetStub.withArgs('fps').callCount).to.equal(0);
    });

    it("provides fps setting from settings provider", () => {
        
        const expectedValue = 10;
        const providerGetStub = sinon.stub().withArgs('fps').returns(expectedValue);
        const settingsProviderStub: ISettingsProvider = { get: providerGetStub };
        
        const gameSettings = new GameSettings(settingsProviderStub);

        expect(gameSettings.fps).to.equal(expectedValue);
        expect(providerGetStub.withArgs('debug').callCount).to.equal(0);
        expect(providerGetStub.withArgs('fps').callCount).to.equal(1);
    });
});