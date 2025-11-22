import type { HTMLAttributes } from "vue";

export type ITabsUIChange = {
    tab: HTMLElement | null,
    oldTab: HTMLElement | null,
};

export type ITabsUIInterface = {
    isTabSelected: (indexOrTitle: number | string) => boolean,
    makeId: (title: string) => string,
};

export type ITabsUIProps = {
    class?: HTMLAttributes["class"],
    listClass?: HTMLAttributes["class"],
    tabClass?: HTMLAttributes["class"],
    contentsClass?: HTMLAttributes["class"],
};

export type ITabUIProps = {
    title: string,
    disabled?: boolean,
    class?: HTMLAttributes["class"],
};
