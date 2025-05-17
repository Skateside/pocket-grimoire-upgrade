import type {
    AnyFunction,
} from "../types/lib";

/**
 * Debounces a function so that it will only execute when it hasn't been called
 * for the number of milliseconds specified in `delay`.
 *
 * @param handler Function to debounce.
 * @param delay Optional delay time in milliseconds. Defaults to 500.
 * @returns Debounced function.
 */
export function debounce<T extends AnyFunction>(
    handler: T,
    delay = 500,
) {

    let timeoutId = 0;

    const debounced = (...args: Parameters<T>) => {

        window.clearTimeout(timeoutId);
        timeoutId = window.setTimeout(() => handler(...args), delay);

    };

    return debounced as T;

}

/**
 * A function that takes no arguments and returns nothing.
 */
export function noop(..._ignore: any[]) {
    return;
}
