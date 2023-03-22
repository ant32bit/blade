
export interface IElementProvider {
    getElementById(id: string): HTMLElement;
    getElementsByTagName(type: 'link'): HTMLCollectionOf<HTMLLinkElement>;
    createElement(type: 'canvas'): HTMLCanvasElement;
    createElement(type: 'li'): HTMLLIElement;
    createElement(type: 'ul'): HTMLUListElement;
    createTextNode(text: string): Text;
}