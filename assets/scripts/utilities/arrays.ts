import {
    randomInt,
} from "./numbers";

/**
 * Removes any duplicates from the given array.
 * 
 * @param array Array to reduce.
 * @returns Array with any duplicates removed.
 */
export function unique<T = any>(array: T[]) {
    return [...new Set(Array.from(array))];
};

/**
 * Removes the item at the given index from the given array. `true` is returned
 * if the item was removed, `false` is returned if it was not.
 * 
 * @param array Array whose item should be removed.
 * @param index Index of the item to remove.
 * @returns `true` if removed, `false` if not.
 */
export function removeAtIndex(array: any[], index: number) {

    if (index < 0 || index >= array.length) {
        return false;
    }

    array.splice(index, 1);

    return true;

}

/**
 * Removes the first occurrence of the given item from the given array. `true`
 * is returned if the item was removed, `false` is returned if it was not.
 * 
 * @param array Array whose item should be removed.
 * @param item Item to remove.
 * @returns `true` if removed, `false` if not.
 */
export function removeItem(array: any[], item: any) {
    return removeAtIndex(array, array.indexOf(item));
}

/**
 * Swaps the items in the array at `indexA` and `indexB`. If either `indexA` or
 * `indexB` are less than `0` or more-than-or-equal-to the length of `array` 
 * then no action is taken.
 * 
 * @param array Array whose items should be swapped.
 * @param indexA Index of one item to swap.
 * @param indexB Index of the other item to swap.
 * @private
 */
const swap = (array: any[], indexA: number, indexB: number) => {

    const { length }  = array;

    if (
        indexA === indexB
        || indexA < 0
        || indexA >= length
        || indexB < 0
        || indexB >= length
    ) {
        return;
    }

    [array[indexA], array[indexB]] = [array[indexB], array[indexA]];

};

/**
 * Shuffles the given array. The given array is not affected.
 * 
 * @param array Array to shuffle.
 * @returns Shuffled copy of the array.
 */
export function shuffle<T = any>(array: T[]) {

    // Fisher-Yates (aka Knuth) Shuffle.
    const shuffled = [...array];
    let index = shuffled.length;

    while (index > 1) {

        const randomIndex = randomInt(index);
        index -= 1;
        swap(shuffled, index, randomIndex);

    }

    return shuffled;

}
