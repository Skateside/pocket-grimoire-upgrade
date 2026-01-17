import type { HTMLAttributes, Slot } from "vue";

export type ITabsUIChange = {
    tab: HTMLElement | null,
    index: number,
    oldTab: HTMLElement | null,
    oldIndex: number,
};

export type ITabsUIMounted = {
    tab: HTMLElement | null,
    index: number,
    tabs: HTMLElement[],
};

export type ITabsUIInterface = {
    isTabSelected: (indexOrId: number | string) => boolean,
    makeId: (title: string) => string,
    setTab: (indexOrId: number | string) => boolean,
};

export type ITabsUIProps = {
    tabClass?: HTMLAttributes["class"],
    contentsClass?: HTMLAttributes["class"],
    memory?: string,
    scroll?: boolean,
};

export type ITabUIProps = {
    id: string,
    title: string,
    tab?: Slot,
    disabled?: boolean,
};
