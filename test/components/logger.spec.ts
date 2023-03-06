import { assert, expect } from "chai";
import { initDOM } from "../setup";
import { Logger } from "../../src/components";

describe("Logger", () => {
    beforeEach(initDOM);

    it("should create a log container", () => {
        const logger = new Logger();
        
        assert.isNotNull(logger);

        const logsEl = document.getElementById("logs");
        const logsContainerEl = logsEl.firstElementChild;

        assert.isNotNull(logsContainerEl);
        expect(logsContainerEl.tagName).to.equal("UL");
        expect(logsContainerEl.id).to.equal("logs-container");
        assert.isFalse(logsContainerEl.hasChildNodes());
    });

    it("should use a log container if it exists", () => {
        const logsEl = document.getElementById("logs");
        const logsContainerEl = document.createElement("ul") as HTMLUListElement;
        logsContainerEl.id = 'logs-container';
        logsEl.appendChild(logsContainerEl);

        const logger = new Logger();

        assert.isNotNull(logsContainerEl);

        const logMessageText = "test";
        logger.log(logMessageText);
        
        const log = logsContainerEl.firstElementChild as HTMLLIElement;
        expect(log.innerHTML).to.equal(logMessageText);
    });

    it("should log a log", () => {
        const logger = new Logger();
        const logMessageText = "test";

        logger.log(logMessageText);

        const logsEl = document.getElementById("logs");
        const logsContainerEl = logsEl.firstElementChild;

        assert.isNotNull(logsContainerEl);

        const log = logsContainerEl.firstElementChild as HTMLLIElement;

        assert.isNotNull(log);
        expect(log.tagName).to.equal("LI");
        assert.isTrue(log.classList.contains("log"));
        expect(log.innerHTML).to.equal(logMessageText);
    });
});