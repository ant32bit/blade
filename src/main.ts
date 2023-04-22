import { InputMapper } from "./abstractions";
import { EnvSettingsProvider, GameLoop, GameSettings, KeyInputBuffer, Logger, NullLogger, SpriteLibrary, Viewport } from "./components";
import { testgirlSpritesheetMetadata, worldBGSpritesheetMetadata } from "./data";
import { ImageLoader, sleep } from "./helpers";
import { LinkedSpritesheet } from "./models";
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

    const inputMapper = new InputMapper({
        'KeyA':       { action: 'left' },
        'ArrowLeft':  { action: 'left' },
        'KeyD':       { action: 'right' },
        'ArrowRight': { action: 'right' },
        'ShiftLeft':  { action: 'run' },
        'KeyQ':       { action: 'punch', falloff: 700 },
        'KeyE':       { action: 'kick', falloff: 700 }
    });
    gameLoop.inputMapper = inputMapper;
    
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

    type spriteop = { sheet: LinkedSpritesheet, mirror: boolean };
    const originalSpritesheets: spriteop[] = [
        { sheet: new LinkedSpritesheet(document, imageLoader, testgirlSpritesheetMetadata), mirror: true },
        { sheet: new LinkedSpritesheet(document, imageLoader, worldBGSpritesheetMetadata), mirror: false }
    ];

    const loadPromises = originalSpritesheets
        .map((s: spriteop) => s.sheet.load());
    await Promise.all(loadPromises);

    const mirrorPromises = originalSpritesheets
        .filter((s: spriteop) => s.mirror)
        .map((s: spriteop) => s.sheet.createMirror());
    const mirroredSpritesheets = await Promise.all(mirrorPromises);

    const addSpritesheet = spriteLibrary.addSpritesheet.bind(spriteLibrary);
    originalSpritesheets.map((s: spriteop) => s.sheet).forEach(addSpritesheet);
    mirroredSpritesheets.forEach(addSpritesheet);
}

document.addEventListener("DOMContentLoaded", initEngine);