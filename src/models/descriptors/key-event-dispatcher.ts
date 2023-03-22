export interface IKeyEventDispatcher {
    addEventListener(type: 'keyup'|'keydown', listener: (event: KeyboardEvent) => void);
    removeEventListener(type: 'keyup'|'keydown', listener: (event: KeyboardEvent) => void);
}