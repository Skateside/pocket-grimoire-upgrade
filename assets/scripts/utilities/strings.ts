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

        return String(
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
 * Splits the given string up into a collection of words.
 * 
 * @param words String to break up into words.
 * @returns Array of words.
 */
export function words<TWord = string>(words: string) {
    return String(words).trim().split(/\s+/) as TWord[];
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
