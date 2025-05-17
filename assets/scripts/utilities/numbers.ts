/**
 * Generates a cryptographically random number between 0 and 1.
 *
 * @returns Random number.
 */
export function random() {
    return window.crypto.getRandomValues(new Uint32Array(1))[0] / (2**32);
}

/**
 * Returns `value` but clamps is so that it is at least `min` and at most `max`.
 *
 * @param min Minimum value.
 * @param value Value to clamp.
 * @param max Maximum value.
 * @returns Clamped value.
 */
export function clamp(min: number, value: number, max: number) {
    return Math.max(min, Math.min(value, max));
}
