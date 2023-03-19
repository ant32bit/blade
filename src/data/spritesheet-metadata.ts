import { ISpritesheetMetadata } from "../models";

export const testgirlSpritesheetMetadata: ISpritesheetMetadata = {
    title: 'testgirl',
    sprites: {
        width: 128,
        height: 128,
        centreX: 64,
        centreY: 128
    },
    animations: [
        { name: 'attack-cresentkick', duration: 1200, nFrames: 12 }, 
        { name: 'attack-jumpknee', duration: 700, nFrames: 7 }, 
        { name: 'attack-kick', duration: 800, nFrames: 8 }, 
        { name: 'attack-tornadokick-start', duration: 300, nFrames: 3 }, 
        { name: 'attack-tornadokick-end', duration: 400, nFrames: 4 }, 
        { name: 'attack-tornadokick-loop', duration: 400, nFrames: 4 }, 
        { name: 'block', duration: 300, nFrames: 3 }, 
        { name: 'hit-blownback', duration: 2400, nFrames: 24 },
        { name: 'hit-head', duration: 300, nFrames: 3 },
        { name: 'hit-stomach', duration: 300, nFrames: 3 },
        { name: 'hit-stumble', duration: 300, nFrames: 3 },
        { name: 'recover', duration: 800, nFrames: 8 },
        { name: 'idle', duration: 1000, nFrames: 10 },
        { name: 'attack-punch', duration: 700, nFrames: 7 },
        { name: 'jump', duration: 300, nFrames: 3 },
        { name: 'hit-knockout', duration: 2400, nFrames: 24 },
        { name: 'run', duration: 1000, nFrames: 10 },
        { name: 'idle-long', duration: 2600, nFrames: 26 },
        { name: 'walk', duration: 1200, nFrames: 12 },
        { name: 'hit-wall', duration: 200, nFrames: 2 }
    ]
};