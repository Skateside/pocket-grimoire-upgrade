export type IFetchTimeoutSettings = RequestInit & {
    timeout?: number,
};

export function fetchTimeout(
    input: RequestInfo | URL,
    settingsOrTimeout: IFetchTimeoutSettings | number = 3000,
) {

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

    return fetch(input, settings).finally(() => {

        if (typeof identifier === "number") {
            window.clearTimeout(identifier);
        }

    });

}
