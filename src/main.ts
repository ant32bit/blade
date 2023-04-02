import { InputMapper } from "./abstractions";
import { EnvSettingsProvider, GameLoop, GameSettings, ISpriteLibrary, KeyInputBuffer, Logger, NullLogger, SpriteLibrary, Renderer2D, Renderer3D } from "./components";
import { PixelArtPipeline } from "./components/graphics";
import { testgirlSpritesheetMetadata } from "./data";
import { ImageLoader, sleep } from "./helpers";
import { ISpritesheet, LinkedSpritesheet, Spritesheet } from "./models";
import { TestRenderWorld, World } from "./objects";

async function initEngine() {
    const logger = new Logger(document);
    const nullLogger = new NullLogger();

    const searchParams = new URLSearchParams(window.location.search);
    
    const settingsProvider = new EnvSettingsProvider();
    settingsProvider.connectToWindow(window);
    settingsProvider.useSearchParams(searchParams);
    
    const gameSettings = new GameSettings(settingsProvider);
    
    const gameLoop = new GameLoop(window, gameSettings);

    // const renderer2d = new Renderer2D(document, window);
    // gameLoop.setRenderer2d(renderer2d);

    const renderPipeline = new PixelArtPipeline(gameSettings);
    await renderPipeline.init(document);

    const renderer3d = new Renderer3D(document, window, renderPipeline);
    gameLoop.setRenderer3d(renderer3d);

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

    // const world = new World(gameSettings, spriteLibrary, logger);
    // gameLoop.addUpdateable(world);
    // gameLoop.addDrawable(world);

    const testRenderWorld = new TestRenderWorld(gameSettings);
    await testRenderWorld.init(document, ['inkling']);
    gameLoop.addUpdateable(testRenderWorld);
    gameLoop.addRenderable(testRenderWorld);

    gameLoop.start();
    // await sleep(20000);
    // gameLoop.stop();
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