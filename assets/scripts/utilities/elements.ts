/**
 * Inspects the given parameter and gets the options and callback from it.
 * 
 * @param optionsOrCallback Either the callback, options, or nothing.
 * @returns Options and callback.
 * @private
 */
const interpretOptionsOrCallback = <
    TOptions extends (
        MutationObserverInit
        | IntersectionObserverInit
        | ResizeObserverOptions
    ),
    TCallback extends (
        IMutationObserverCallback
        | IIntersectionObserverCallback
        | IResizeObserverCallback
    ),
>(
    optionsOrCallback?: (TOptions & { callback?: TCallback }) | TCallback,
) => {

    const settings = (
        typeof optionsOrCallback === "function"
        ? { callback: optionsOrCallback }
        : optionsOrCallback
    );

    const { callback, ...options } = settings || {};

    return {
        callback,
        options,
    };

};

/**
 * Creates the handler that will process the entries for an observer.
 * 
 * @param settings Settings for the handler.
 * @returns Handler that will process the entries.
 * @private
 */
const createObserverHandler = <TEntry = any>({ callback, element, eventName }: {
    callback?: ({ entry, entries }: { entry: TEntry, entries: TEntry[] }) => void,
    element: Element,
    eventName: string,
}) => (entries: TEntry[]) => {

    entries.forEach((entry) => {

        const detail = { entry, entries };

        if (callback) {
            callback(detail);
        } else {
            element.dispatchEvent(new CustomEvent(eventName, {
                detail,
                bubbles: true,
                cancelable: false,
            }));
        }

    });

};

export type IMutationObserverCallback = (
    { entry, entries }: {
        entry: MutationRecord,
        entries: MutationRecord[],
    },
) => void;
export type IMutationObserverOptions = MutationObserverInit & {
    callback?: IMutationObserverCallback,
};
export type IMutationObserverResponse = {
    disconnect(): void,
    takeRecords(): MutationRecord[],
};

export function mutationObserver(element: Element): IMutationObserverResponse;
export function mutationObserver(
    element: Element,
    callback: IMutationObserverCallback,
): IMutationObserverResponse;
export function mutationObserver(
    element: Element,
    options: IMutationObserverOptions,
): IMutationObserverResponse;
export function mutationObserver(
    element: Element,
    optionsOrCallback?: IMutationObserverOptions | IMutationObserverCallback,
) {

    const { callback, options } = interpretOptionsOrCallback<
        MutationObserverInit,
        IMutationObserverCallback
    >(optionsOrCallback);
    const handleMutation = createObserverHandler({
        callback,
        element,
        eventName: "element-mutate",
    });
    const observer = new MutationObserver(handleMutation);

    observer.observe(element, options);

    return {
        disconnect() {

            const records = observer.takeRecords();

            observer.disconnect();

            if (records.length) {
                handleMutation(records);
            }

        },
        takeRecords() {
            return observer.takeRecords();
        },
    };

}

export type IIntersectionObserverCallback = (
    { entry, entries }: {
        entry: IntersectionObserverEntry,
        entries: IntersectionObserverEntry[],
    }
) => void;
export type IIntersectionObserverOptions = IntersectionObserverInit & {
    callback?: IIntersectionObserverCallback,
};
export type IIntersectionObserverResponse = {
    unobserve(): void,
    disconnect(): void,
    takeRecords(): IntersectionObserverEntry[],
};

export function intersectionObserver(element: Element): IIntersectionObserverResponse;
export function intersectionObserver(
    element: Element,
    callback: IIntersectionObserverCallback,
): IIntersectionObserverResponse;
export function intersectionObserver(
    element: Element,
    options: IIntersectionObserverOptions,
): IIntersectionObserverResponse;
export function intersectionObserver(
    element: Element,
    optionsOrCallback?: IIntersectionObserverOptions | IIntersectionObserverCallback,
) {

    const { callback, options } = interpretOptionsOrCallback<
        IntersectionObserverInit,
        IIntersectionObserverCallback
    >(optionsOrCallback);
    const handleIntersection = createObserverHandler({
        callback,
        element,
        eventName: "element-intersect",
    });
    const observer = new IntersectionObserver(handleIntersection, options);
    observer.observe(element);

    return {
        unobserve() {
            observer.unobserve(element);
        },
        disconnect() {

            const records = observer.takeRecords();

            observer.disconnect();

            if (records.length) {
                handleIntersection(records);
            }

        },
        takeRecords() {
            return observer.takeRecords();
        },
    };

}

export type IResizeObserverCallback = (
    { entry, entries }: {
        entry: ResizeObserverEntry,
        entries: ResizeObserverEntry[],
    }
) => void;
export type IResizeObserverOptions = ResizeObserverOptions & {
    callback?: IResizeObserverCallback,
};
export type IResizeObserverResponse = {
    unobserve(): void,
    disconnect(): void,
};

export function resizeObserver(element: Element): IResizeObserverResponse;
export function resizeObserver(
    element: Element,
    callback: IResizeObserverCallback,
): IResizeObserverResponse;
export function resizeObserver(
    element: Element,
    options: IResizeObserverOptions,
): IResizeObserverResponse;
export function resizeObserver(
    element: Element,
    optionsOrCallback?: IResizeObserverOptions | IResizeObserverCallback,
) {

    const { callback, options } = interpretOptionsOrCallback<
        ResizeObserverOptions,
        IResizeObserverCallback
    >(optionsOrCallback);
    const handleResize = createObserverHandler({
        callback,
        element,
        eventName: "element-resize",
    });
    const observer = new ResizeObserver(handleResize);

    observer.observe(element, options);

    return {
        unobserve() {
            observer.unobserve(element);
        },
        disconnect() {
            observer.disconnect();
        },
    }

}
