export type IFetchTimeoutSettings = RequestInit & {
    timeout?: number,
};

/**
 * @deprecated use {@link abortableFetch} instead.
 */
export function fetchTimeout(
    input: RequestInfo | URL,
    settingsOrTimeout: IFetchTimeoutSettings | number = 3000,
) {
    return abortableFetch(input, settingsOrTimeout).promise;
}

type IAbortableFetch<TResponse = any> = {
    abort: AbortController['abort'],
    promise: Promise<TResponse>,
};

export function abortableFetch<TResponse = any>(
    input: RequestInfo | URL,
    settingsOrTimeout: IFetchTimeoutSettings | number = 3000,
): IAbortableFetch<TResponse> {

    if (typeof settingsOrTimeout === "number") {
        settingsOrTimeout = { timeout: settingsOrTimeout };
    }

    const {
        timeout,
        ...settings
    } = settingsOrTimeout;
    const controller = new AbortController();
    let identifier: number | null = null;

    if (typeof timeout === "number") {

        identifier = window.setTimeout(() => {
            controller.abort("error.timeout");
        }, timeout);
        settings.signal = controller.signal;

    }

    const abort: AbortController['abort'] = (reason?: any) => {
        return controller.abort(reason);
    };

    const promise = fetch(input, settings).finally(() => {

        if (typeof identifier === "number") {
            window.clearTimeout(identifier);
        }

    }) as Promise<TResponse>;

    return {
        abort,
        promise,
    };

}
