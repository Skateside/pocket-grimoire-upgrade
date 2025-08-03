import type { HTMLAttributes } from "vue";

export type ITabsChange = {
    tab: HTMLElement | null,
    oldTab: HTMLElement | null,
};

export type ITabsInterface = {
    isTabSelected: (indexOrTitle: number | string) => boolean,
    makeId: (title: string) => string,
};

export type ITabsProps = {
    class?: HTMLAttributes["class"],
    listClass?: HTMLAttributes["class"],
    tabClass?: HTMLAttributes["class"],
    contentsClass?: HTMLAttributes["class"],
};

export type ITabProps = {
    title: string,
    disabled?: boolean,
    class?: HTMLAttributes["class"],
};
