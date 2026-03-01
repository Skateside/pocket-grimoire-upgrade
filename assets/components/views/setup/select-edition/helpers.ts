import type { IScriptImport } from "~/scripts/types/data";
import useRolesStore from "~/scripts/store/roles";
import { abortableFetch } from "~/scripts/utilities/fetch";

type IParseScriptResponse = {
    script?: IScriptImport,
    error?: string,
};

const rolesStore = useRolesStore();

/**
 * Performs an AJAX lookup but provides both the promise (which resolves/rejects
 * based on the AJAX call) and an abort function that can cancel the lookup.
 *
 * @param url URL to which to post data.
 * @param data Data to post.
 * @returns AJAX promise and abort function.
 */
export const performAjax = <TResponse = IScriptImport>(
    url: string,
    data: Record<string, any>,
) => {

    const { abort, promise } = abortableFetch(url, {
        method: "POST",
        body: JSON.stringify(data),
        timeout: 10_000,
    });
    const then = promise
        .then((response) => response.json())
        .then(({ success, body }) => {
            if (success) {
                return body as TResponse;
            }
            throw body;
        });
    
    return {
        abort,
        promise: then,
    };

};

/**
 * Parses the given script, returning an object with either a `script` property
 * (if the parsing was successful) or an `error` property if something went 
 * wrong.
 *
 * @param data Stringified data to parse.
 * @returns Parse results.
 */
export const parseScript = (data: string): IParseScriptResponse => {

    let script: IScriptImport = [];

    try {
        script = JSON.parse(data);
    } catch (error) {
        return { error: "Unable to parse script." }; // TODO: i18n
    }

    if (!rolesStore.getIsValidScriptImport(script)) {
        return { error: "Script is not valid." }; // TODO: i18n
    }

    return { script };

};
