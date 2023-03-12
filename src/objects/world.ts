import { IDrawable, IDrawContext, IUpdateable, IUpdateContext, Logger } from "../components";

export class World implements IUpdateable, IDrawable {

    private _logger: Logger;

    constructor() {
        this._logger = new Logger();
    }

    update(context: IUpdateContext): void {
        
    }

    draw(context: IDrawContext): void {
        this._logger.log(`time = ${Date.now()}`);
    }
}