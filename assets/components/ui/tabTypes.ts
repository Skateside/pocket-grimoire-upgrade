import type { HTMLAttributes, Slot } from "vue";

export type ITabsUIChange = {
    tab: HTMLElement | null,
    index: number,
    oldTab: HTMLElement | null,
    oldIndex: number,
};

export type ITabsUIInterface = {
    isTabSelected: (indexOrTitle: number | string) => boolean,
    makeId: (title: string) => string,
    setTab: (indexOrTitle: number | string) => boolean,
};

export type ITabsUIProps = {
    tabClass?: HTMLAttributes["class"],
    contentsClass?: HTMLAttributes["class"],
    identifier?: string,
};

export type ITabUIProps = {
    title: string,
    tab?: Slot,
    disabled?: boolean,
};
