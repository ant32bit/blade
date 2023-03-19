import { EnvSettingsProvider, GameLoop, GameSettings, ISpriteLibrary, KeyInputBuffer, Logger, NullLogger, SpriteLibrary, Viewport } from "./components";
import { testgirlSpritesheetMetadata } from "./data";
import { ImageLoader, sleep } from "./helpers";
import { ISpritesheet, LinkedSpritesheet, Spritesheet } from "./models";
import { World } from "./objects";

async function initEngine() {
    const logger = new Logger(document);
    const nullLogger = new NullLogger();

    const searchParams = new URLSearchParams(window.location.search);
    
    const settingsProvider = new EnvSettingsProvider();
    settingsProvider.ConnectToWindow(window);
    settingsProvider.UseSearchParams(searchParams);
    
    const gameSettings = new GameSettings(settingsProvider);
    
    const gameLoop = new GameLoop(window, gameSettings);

    const viewport = new Viewport(document, window);
    gameLoop.setRenderer(viewport);

    const keyboardBuffer = new KeyInputBuffer(window, nullLogger);
    gameLoop.addInputBuffer(keyboardBuffer);

    
    const spriteLibrary = new SpriteLibrary();
    await loadSpritesheets(spriteLibrary)

    const world = new World(gameSettings, spriteLibrary, logger);
    gameLoop.addUpdateable(world);
    gameLoop.addDrawable(world);

    gameLoop.start();
    await sleep(20000);
    gameLoop.stop();
}

async function loadSpritesheets(spriteLibrary: SpriteLibrary): Promise<void> {
    const imageLoader = new ImageLoader();

    const originalSpritesheets = [
        new LinkedSpritesheet(document, imageLoader, testgirlSpritesheetMetadata),
    ];

    const loadPromises = originalSpritesheets.map((spritesheet: LinkedSpritesheet) => spritesheet.load());
    await Promise.all(loadPromises);

    const mirrorPromises = originalSpritesheets.map((spritesheet: LinkedSpritesheet) => spritesheet.createMirror());
    const mirroredSpritesheets = await Promise.all(mirrorPromises);

    const addSpritesheet = spriteLibrary.addSpritesheet.bind(spriteLibrary);
    originalSpritesheets.forEach(addSpritesheet);
    mirroredSpritesheets.forEach(addSpritesheet);
}

document.addEventListener("DOMContentLoaded", initEngine);