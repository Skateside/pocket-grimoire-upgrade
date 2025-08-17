import type {
    IToken,
    // ITokenSeat,
    // ITokenRole,
    // ITokenReminder,
} from "../types/data";
import type { AnyFunction } from "../types/lib";
import {
    defineStore,
} from "pinia";
import {
    // computed,
    // nextTick,
    // reactive,
    ref,
    shallowReactive,
    // watch,
} from "vue";

const useUiStore = defineStore("ui", () => {

    
    const innerPopoverHandlers: Record<string, Partial<Record<"show" | "hide" | "isOpen", AnyFunction>>> = Object.create(null);
    
    const popoverOpen = shallowReactive<Record<string, boolean>>({});
    const seatMenuToken = ref<IToken["id"]>("");

    const togglePopover = (id: string, state?: boolean, ...args: any[]) => {

        if (state === undefined) {
            state = !popoverOpen[id];
        }

        if (state === Boolean(popoverOpen[id])) {
            return;
        }

        popoverOpen[id] = state;

        const method = state ? "show" : "hide";
        innerPopoverHandlers[id]?.[method]?.(...args);

    };

    const showPopover = (id: string, ...args: any[]) => {
        togglePopover(id, true, ...args);
    };

    const hidePopover = (id: string, ...args: any[]) => {
        togglePopover(id, false, ...args);
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

    return {
        // State.
        popoverOpen,
        seatMenuToken,
        // Getters.
        // Actions.
        togglePopover,
        showPopover,
        hidePopover,
    };

});

export default useUiStore;