export function randomHex(): string {
    return (
        '#' + ((Math.random() * 0xffffff) << 0).toString(16).padStart(6, '0')
    );
}
