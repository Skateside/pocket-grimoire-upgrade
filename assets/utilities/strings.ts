import { intersect } from "./arrays";
import { memoise } from "./functions";

/**
 * Generates a random ID containing numbers and the full range of lowercase
 * latin letters. Use this function to create an ID that needs to be unique but
 * only read by machines - use {@link randomGameId} for a human-readable ID.
 *
 * @param prefix Optional prefix for the ID.
 * @returns A machine-readable random ID.
 */
export function randomId(prefix = "") {

    // If we just take the UUID and parse it as hex, JavaScript will convert it
    // into the form "1.23456e+83" and converting that into a string will create
    // an unwanted format - splitting the UUID into parts and converting each
    // one keeps it all as a number giving us a better return.
    const rand = window.crypto.randomUUID()
        .split("-")
        .map((hex) => Number.parseInt(hex, 16).toString(36))
        .join("");
    
    return `${prefix}${rand}`;

}

/**
 * Generates a random ID that is designed to be human-readable. It's a series
 * of random numbers and lowercase letters (range a-f). Each group is of length
 * `length` and there are `groups` number of groups. The string that joins them
 * into a single string is `glue`. For a function that generates IDs that are
 * more random (to be consumed by machines) use {@link randomId}.
 *
 * @param settings Optional settings to create the ID.
 * @param settings.groups Number of groups - defaults to `3`.
 * @param settings.length Length of each group - defaults to `3`.
 * @param settings.glue Glue to combine each group - defaults to `"-"`.
 * @returns A human-readable random ID.
 */
export function randomGameId({ groups = 3, length = 3, glue = "-" } = {}) {

    const random = window.crypto.randomUUID().replace(/\-/g, "");
    const totalLength = groups * length;
    const string = random.padEnd(totalLength, random).slice(0, totalLength);
    const regexp = new RegExp(`\\w{1,${length}}`, "g");

    return (string.match(regexp) || []).join(glue);

}

/**
 * Interprets the given object as a string. `null` or `undefined` will return an
 * empty string.
 *
 * @param object Object to interpret.
 * @returns Interpretted string.
 */
export function interpret(object: any) {

    return (
        (object === null || object === undefined)
        ? ''
        : String(object)
    );

}

/**
 * Takes a string containing placeholders (denoted between `{` and `}`) and
 * replaces them with the entries in `replacements`.
 *
 * @param template String containing placeholders.
 * @param replacements Replacements for those placeholders.
 * @returns A string with the placeholders replaced.
 *
 * @example
 * supplant("Hello {thing}", { thing: "world" }); // "Hello world"
 * supplany("Count: {0}", [1]); // "Count: 1"
 */
export function supplant(
    template: string,
    replacements: Record<string, number | string> | (number | string)[],
) {

    return template.replace(/\{([^{}]*)\}/g, (whole: string, index: string) => {

        return interpret(
            Object.hasOwn(replacements, index)
            ? (
                Array.isArray(replacements)
                ? replacements[Number(index)]
                : replacements[index]
            )
            : whole
        );

    });

}

/**
 * Splits the given string up into a collection of words. An empty string (or a
 * string that is empty after being trimmed) will return an empty array.
 *
 * @param words String to break up into words.
 * @returns Array of words.
 */
export function words<TWord = string>(sentence: string) {

    const words: TWord[] = [];
    const trimmed = interpret(sentence).trim();

    if (trimmed.length) {
        words.push(...trimmed.split(/\s+/) as TWord[]);
    }

    return words;

}

/**
 * Removes any markup from the string and returns it.
 *
 * @param string String containing potential markup.
 * @returns String without the markup.
 */
export function removeMarkup(string: string) {
    const doc = new DOMParser().parseFromString(string, "text/html");
    return doc.body.textContent;
};

/**
 * Checks to see if the given string is a valid URL.
 *
 * @param string String to test.
 * @returns `true` if the given string is a valid URL, `false` otherwise.
 */
export function isValidURL(string: string) {

    let url: URL | null = null;

    try {
        url = new URL(string);
    } catch (ignore) {
        return false;
    }

    return (/^https?:$/).test(url.protocol);

};

/**
 * Checks to see if the given string is a valid local URL.
 *
 * @param string String to check.
 * @returns `true` if the string is a valid local URL, `false` otherwise.
 */
export function isValidLocalURL(string: string) {

    try {
        const url = new URL(string, window.location.href);
        return url.href.includes(string);
    } catch (ignore) {
        return false;
    }

}

const fragment = document.createDocumentFragment();

/**
 * Checks to see if the given string is a valid CSS selector.
 *
 * @param string String to check.
 * @returns `true` if the given string is a valid CSS selector, `false`
 * otherwise.
 */
export function isValidCSSSelector(string: string) {

    try {
        fragment.querySelector(string);
        return true;
    } catch (ignore) {
        return false;
    }

}

// The Dice-Sørensen coefficient:
// https://en.wikipedia.org/wiki/Dice-S%C3%B8rensen_coefficient
// Based on "string-similarity"
// https://github.com/aceakash/string-similarity

/**
 * Makes bigrams (2-letter combinations).
 *
 * @param string String to split into bigrams.
 * @returns Bigrams made from the string.
 * @private
 * 
 * @example
 * makeBigrams("abcdefg"); // -> ["ab", "bc", "cd", "de", "ef", "fg"]
 */
function makeBigrams(string: string) {

    const bigrams: string[] = [];
    const length = string.length - 1;
    let index = 0;

    while (index < length) {
        bigrams.push(string.substring(index, index + 2));
        index += 1;
    }

    return bigrams;

}

/**
 * Generates the bigrams from the given string after removing all spaces,
 * memoising the results.
 *
 * @param string String to split into bigrams.
 * @returns Bigrams from the string or `null` if the string is too short.
 * @private
 */
const getBigrams = memoise((string: string) => {

    const simple = string
        .normalize("NFD")
        .replace(/[\p{Diacritic}\P{Letter}]/gu, "");

    if (simple.length < 2) {
        return null;
    }

    return makeBigrams(simple);

});

/**
 * Compares two strings, returning the coefficient that describes how similar
 * they are on a scale of `1` (identical) to `0` (no similarities).
 *
 * @param first First string to compare.
 * @param second Second string to compare.
 * @returns The coefficient.
 */
export function compareStrings(first: string, second: string) {

    if (first === second) {
        return 1;
    }

    const firstBigrams = getBigrams(first);
    const secondBigrams = getBigrams(second);

    if (!firstBigrams || !secondBigrams) {
        return 0;
    }

    const intersections = intersect(firstBigrams, secondBigrams);

    return (
        (2 * intersections.length)
        / (firstBigrams.length + secondBigrams.length)
    );

}

/**
 * Compares the string `main` to all the strings in `targets` and returns the
 * best match along with the coefficient describing how close a match it was.
 *
 * If two strings within `targets` are equally matched to `main` then the first
 * one alphabetically is returned.
 *
 * @param main Main string to compare.
 * @param targets All strings to compare against.
 * @returns Best matching target string and the coefficient of the match.
 */
export function findBestMatch(main: string, targets: string[]) {

    const matches: [string, number][] = targets.map((target) => [
        target,
        compareStrings(main, target),
    ]);
    const sorted = matches.toSorted((
        [targetA, compareA],
        [targetB, compareB],
    ) => {
        // Best match, or alphabetically (ascending) if equally matched.
        return (compareB - compareA) || targetA.localeCompare(targetB);
    });
    const [match, index] = sorted[0];

    return {
        index,
        match,
    };

}
