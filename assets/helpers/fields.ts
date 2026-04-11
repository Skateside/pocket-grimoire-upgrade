import type { IFields } from "~/types/data";
import { isBoolean, isObject, isString } from "~/utilities/objects";
import { isValidCSSSelector } from "~/utilities/strings";

/**
 * Checks to see if the given `form` is a valid map of CSS selectors idntifying
 * the form fields to their value or checked state.
 *
 * @param form Form to check.
 * @returns `true` if the given form is a valid fields entry.
 */
export function isValidForm(form: unknown): form is IFields[string] {

    return (
        isObject(form)
        && Object.entries(form).every(([selector, value]) => {
            return (
                isValidCSSSelector(selector)
                && (isBoolean(value) || isString(value))
            );
        })
    );

}

/**
 * Checks to see if the given `fields` is a valid set of fields data.
 *
 * @param fields Fields to check.
 * @returns `true` if all the data is valid, `false` if it's not.
 */
export function isValidFields(fields: unknown): fields is IFields {
    return isObject(fields) && Object.values(fields).every(isValidForm);
}
