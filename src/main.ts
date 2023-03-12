import { EnvSettingsProvider, GameLoop, GameSettings, KeyInputBuffer, Viewport } from "./components";
import { sleep } from "./helpers";
import { World } from "./objects";

async function initEngine() {
    var searchParams = new URLSearchParams(window.location.search);
    
    var settingsProvider = new EnvSettingsProvider();
    settingsProvider.ConnectToWindow(window);
    settingsProvider.UseSearchParams(searchParams);
    
    var gameSettings = new GameSettings(settingsProvider)
    
    var gameLoop = new GameLoop(window, gameSettings);

    var viewport = new Viewport(document, window);
    gameLoop.setRenderer(viewport);

    var keyboardBuffer = new KeyInputBuffer(viewport.canvas);
    gameLoop.addInputBuffer(keyboardBuffer);

    var world = new World();
    gameLoop.addUpdateable(world);
    gameLoop.addDrawable(world);

    gameLoop.start();
    await sleep(20000);
    gameLoop.stop();
}

document.addEventListener("DOMContentLoaded", initEngine);