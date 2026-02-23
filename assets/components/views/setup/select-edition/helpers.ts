import type { IRoleScriptImport } from "~/scripts/types/data";
import useRoleStore from "~/scripts/store/role";
import { abortableFetch } from "~/scripts/utilities/fetch";

type IParseScriptResponse = {
    script?: IRoleScriptImport,
    error?: string,
};

const roleStore = useRoleStore();

export const performAjax = <TResponse = IRoleScriptImport>(
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

export const parseScript = (data: string): IParseScriptResponse => {

    let script = [];

    try {
        script = JSON.parse(data);
    } catch (error) {
        return { error: "Unable to parse script." }; // TODO: i18n
    }

    if (!roleStore.getIsValidImport(script)) {
        return { error: "Script is not valid." }; // TODO: i18n
    }

    return { script };

};
