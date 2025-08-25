import type {
    IRole,
    IRoleAlignment,
    IToken,
    // ITokenSeat,
    // ITokenRole,
    // ITokenReminder,
} from "../types/data";
// import type { AnyFunction } from "../types/lib";
import {
    defineStore,
} from "pinia";
import {
    computed,
    nextTick,
    // reactive,
    ref,
    shallowReactive,
    // watch,
} from "vue";

const useUiStore = defineStore("ui", () => {

    const innerPopoverHandlers: Record<
        string,
        Partial<{
            show: (...args: any[]) => void,
            hide: (...args: any[]) => void,
            isOpen: () => boolean,
        }>
    > = Object.create(null);
    const innerPopoverOpen = shallowReactive<Record<string, boolean>>({});

    const seatMenuToken = ref<IToken["id"]>("");
    const roleDialog = shallowReactive<{
        role?: IRole,
        alignment?: IRoleAlignment,
    }>({});

    const isPopoverOpen = computed(() => (id: string) => {

        if (!innerPopoverOpen[id]) {
            return false;
        }

        if (innerPopoverHandlers[id]?.isOpen) {
            return innerPopoverHandlers[id].isOpen();
        }

        return true;

    });

    let currentPopover: [string, ...any[]] | null = null;
    const popoverList: [string, ...any[]][] = [];

    const togglePopover = (id: string, state?: boolean, ...args: any[]) => {

        if (state === undefined) {
            state = !innerPopoverOpen[id];
        }

        if (state === Boolean(innerPopoverOpen[id])) {
            return;
        }

        innerPopoverOpen[id] = state;
        innerPopoverHandlers[id]?.[state ? "show" : "hide"]?.(...args);

        if (state) {
            currentPopover = [id, ...args];
        } else {
            currentPopover = null;
        }

    };

    const showPopover = (id: string, ...args: any[]) => {
        togglePopover(id, true, ...args);
    };

    const hidePopover = (id: string, ...args: any[]) => {
        togglePopover(id, false, ...args);
    };

    const nextPopover = (id: string, ...args: any[]) => {

        if (currentPopover) {

            popoverList.push([...currentPopover]);
            hidePopover(currentPopover[0]);

        }

        nextTick(() => showPopover(id, ...args));

    };

    const previousPopover = () => {

        if (currentPopover) {
            hidePopover(currentPopover[0]);
        }

        nextTick(() => {

            const params = popoverList.pop();

            if (params) {
                showPopover(...params);
            }

        });

    };

    const clearPopoverList = () => {
        popoverList.length = 0;
    };

    // Register extra functionality for specific popovers.

    innerPopoverHandlers["seat-menu"] = {
        show(tokenId?: IToken["id"]) {
            if (tokenId) {
                seatMenuToken.value = tokenId;
            }
        },
        hide(resetTokenId: boolean = false) {
            if (resetTokenId) {
                seatMenuToken.value = "";
            }
        },
        isOpen() {
            return seatMenuToken.value !== "";
        },
    };

    innerPopoverHandlers["role-dialog"] = {
        isOpen() {
            return Boolean(roleDialog.role);
        },
    };

    return {
        // State.
        seatMenuToken,
        roleDialog,
        // Getters.
        isPopoverOpen,
        // Actions.
        togglePopover,
        showPopover,
        hidePopover,
        nextPopover,
        previousPopover,
        clearPopoverList,
    };

});

export default useUiStore;