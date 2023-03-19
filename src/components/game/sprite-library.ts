import { IAnimation, ISpritesheet, ISpritesheetMetadata, LinkedSpritesheet } from "../../models";

export interface ISpriteLibrary {
    getAnimation(sheet: string, animationId: string): IAnimation;
}

export class SpriteLibrary implements ISpriteLibrary {
    private sprites: {[name: string]: ISpritesheet} = {};

    public addSpritesheet(sheet: ISpritesheet) {
        this.sprites[sheet.name] = sheet;
    }

    public getAnimation(sheet: string, animationName: string): IAnimation {
        return this.sprites[sheet] ? this.sprites[sheet].getAnimation(animationName) : null;
    }
}

