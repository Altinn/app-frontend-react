/**
 * Converts dot-notation to JsonPointer (including support for repeating groups)
 */
export function dotNotationToPointer(path: string): string {
  return `/${path.replace(/\./g, '/')}`.replace(/\[(\d+)]\//g, (...a) => `/${a[1]}/`);
}

/**
 * Converts JsonPointer to dot-notation (including support for repeating groups)
 */
export function pointerToDotNotation(path: string): string {
  return path
    .replace(/\/(\d+)\//g, (...a) => `[${a[1]}].`)
    .replace(/\//g, '.')
    .slice(1);
}
