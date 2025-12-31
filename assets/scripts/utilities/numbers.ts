/**
 * Converts the given number into a positive integer, by removing the sign and
 * any decimal.
 * 
 * @param number Number to convert into a positive integer.
 * @returns Positive integer.
 */
export function toPosInt(number: number|`${number}`) {
    return Math.floor(Math.abs(number as number));
}

/**
 * Generates a cryptographically random number between 0 and 1.
 *
 * @returns Random number.
 */
export function random() {
    return window.crypto.getRandomValues(new Uint32Array(1))[0] / (2**32);
}

/**
 * Generates a cryptographically random number between min and max. If only a
 * single parameter is provided, that parameter is treated as `max` with `min`
 * being set to `0`. The returned value will be more-than-or-equal-to `min` and
 * less-than `max`.
 * 
 * @param min Minimum value
 * @param max Maximum value
 * @returns A random number between `min` and `max`.
 */
export function randomInt(min: number, max = 0) {

    if (min > max) {
        [min, max] = [max, min];
    }

    return Math.trunc(min + (random() * (max - min)));

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

/**
 * Executes the given function a set number of times. The results of each
 * handler's execution are returned.
 * 
 * @param count Number of times to execute the handler.
 * @param handler Handler to execute.
 * @returns Results from each handler's execution.
 */
export function times<T = any>(count: number, handler: (index: number) => T) {
    return Array.from({ length: count }, (_ignore, index) => handler(index));
}
