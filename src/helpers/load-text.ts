
export async function loadText(path: string): Promise<string> {
    const response = await fetch(path);
    if (response.status != 200) {
        throw new Error('not available');
    }
    return await response.text();
}