import type {
    IRole,
    IToken,
} from "../types/data";
import type {
    IStorage,
} from "../classes/Storage";
import { ERoleAlignment } from "../types/data";
import {
    defineStore,
} from "pinia";
import {
    computed,
    inject,
    nextTick,
    ref,
    shallowReactive,
    watch,
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
        alignment?: ERoleAlignment,
    }>({});

    const storage = inject<IStorage>("storage")!;
    const STORAGE_KEY = "tabs";
    const tabs = shallowReactive<Record<string, number>>(
        Object.assign(Object.create(null), { ...storage.get(STORAGE_KEY, {}) })
    );

    watch(tabs, (value) => {
        storage.set(STORAGE_KEY, value);
    });

    const clear = () => {

        for (const key of Object.keys(tabs)) {
            delete tabs[key];
        }

    };

    const isPopoverOpen = computed(() => (id: string) => {

        if (!innerPopoverOpen[id]) {
            return false;
        }

        if (innerPopoverHandlers[id]?.isOpen) {
            return innerPopoverHandlers[id].isOpen();
        }

        return true;

    });

    const getTabIndex = computed(() => (identifier: string) => (
        tabs[identifier] ?? 0
    ));

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

    const hideAllPopovers = async () => {

        if (currentPopover) {
            hidePopover(...currentPopover);
            await nextTick();
        }

        for (let index = popoverList.length - 1; index >= 0; index -= 1) {
            hidePopover(...popoverList[index]);
            await nextTick();
        }

        clearPopoverList();

    };

    const clearPopoverList = () => {
        popoverList.length = 0;
    };

    const setTabIndex = (identifier: string, index: number) => {
        tabs[identifier] = index;
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
        tabs,
        // Getters.
        isPopoverOpen,
        getTabIndex,
        // Actions.
        clear,
        togglePopover,
        showPopover,
        hidePopover,
        nextPopover,
        previousPopover,
        hideAllPopovers,
        clearPopoverList,
        setTabIndex,
    };

});

export default useUiStore;