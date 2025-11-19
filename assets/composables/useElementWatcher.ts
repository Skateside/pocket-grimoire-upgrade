import {
    type Ref,
    isRef,
    onMounted,
    onUnmounted,
} from "vue";

/**
 * Either the element or a Vue ref() for that element.
 */
export type IElementOrRef = Ref<HTMLElement | null> | HTMLElement | null;

/**
 * The processor for each element.
 */
export type IElementProcessor = (element: HTMLElement) => void;

/**
 * The object returned from {@link useElementWatcher}.
 */
export type IElementWatcherResponse = {
	watch: (elementOrRef: IElementOrRef) => void,
	unwatch: (elementOrRef: IElementOrRef) => void,
	watchAll: (selector: string) => void,
};

/**
 * Creates an element watcher. Elements can be watched so that key functionality
 * happens on resize and mutation.
 * 
 * @param settings Settings for the  
 * @returns 
 */
export default function useElementWatcher(
    processor: IElementProcessor,
): IElementWatcherResponse {

	/**
	 * A map storing ResizeObserver instances, preventing the same element being
	 * observed multiple times.
	 * 
	 * @private
	 */
	const resizeMap = new WeakMap<HTMLElement, ResizeObserver>();

	/**
	 * A map storing ResizeObserver instances, preventing the same element being
	 * observed multiple times.
	 * 
	 * @private
	 */
	const mutationMap = new WeakMap<HTMLElement, MutationObserver>();

	/**
	 * Get the element from the given element/reference.
	 * 
	 * @param element Either the element or a ref with the element as its value.
	 * @returns Element, which might be `null`.
	 * @private
	 */
	const getElement = (elementOrRef: IElementOrRef): HTMLElement | null => (
        isRef(elementOrRef)
        ? elementOrRef.value
        : elementOrRef
    );

	/**
	 * Process the element.
	 * 
	 * @param element Element to process.
	 * @private
	 */
	const processElement = (elementOrRef: IElementOrRef) => {

		const element = getElement(elementOrRef);
		if (!element) return;

		processor(element);

		if (!resizeMap.has(element)) {

            const resize = new ResizeObserver(([{ target }]) => {
				processor(target as HTMLElement);
			});

            resize.observe(element);
			resizeMap.set(element, resize);

        }

		if (!mutationMap.has(element)) {

            const mutation = new MutationObserver(([{ target }]) => {
				processor(target as HTMLElement);
			});

            mutation.observe(element, { childList: true });
			mutationMap.set(element, mutation);

        }

    };

	/**
	 * Stops processing the element.
	 * 
	 * @param element Either the element or a reference to it.
	 * @private
	 */
	const unprocessElement = (elementOrRef: IElementOrRef) => {

		const element = getElement(elementOrRef);

        if (!element) {
            return;
        }

		const resize = resizeMap.get(element);
		const mutation = mutationMap.get(element);

		if (resize) {
			resize.disconnect();
			resizeMap.delete(element);
		}

		if (mutation) {
			mutation.disconnect();
			mutationMap.delete(element);
		}
	};

	/**
	 * Watch an element, processing it when possible.
	 * 
	 * This function uses `onMounted` internally so it **should not** be called
	 * within another `onMounted`.
	 * 
	 * @param element Either the element or a reference to it.
	 */
	const watch = (elementOrRef: IElementOrRef) => {

        onMounted(() => processElement(elementOrRef));
		onUnmounted(() => unprocessElement(elementOrRef));

    };

	/**
	 * Stop watching an element.
	 * 
	 * @param element Either the element or a reference to it.
	 */
	const unwatch = (elementOrRef: IElementOrRef) => {
		unprocessElement(elementOrRef);
	};

	/**
	 * Watch all elements identified by the selector passed to
	 * {@link useElementWatcher}.
	 * 
	 * This function uses `onMounted` internally so it **should not** be called
	 * within another `onMounted`.
	 * 
	 * @param selector CSS selector identifying elements to watch.
	 */
	const watchAll = (selector: string) => {

        let elements: HTMLElement[] = [];

        onMounted(() => {
			elements = [...document.querySelectorAll<HTMLElement>(selector)];
			elements.forEach((element) => processElement(element));
		});
		onUnmounted(() => elements.forEach((element) => {
			unprocessElement(element);
		}));

    };

	return {
		watch,
		unwatch,
		watchAll,
	};

}
