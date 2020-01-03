/* Prefer default export 如果只导出一个东西的话。你还不用default那么import的时候还要多加一层解构。不好看。而且效率不好 */
export default function common() {
    return 'common string';
}