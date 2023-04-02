import { IElementProvider } from "../models/descriptors/element-provider";

export function getLink(elementProvider: IElementProvider, rel: string, title: string): string {
    let href: string;
    const links = elementProvider.getElementsByTagName('link');
    for (const link of links) {
        if (link.rel === rel && link.title === title)
            return link.href;
    }
    return undefined;
}