export type ITabsChange = {
    tab: HTMLElement | null,
    oldTab: HTMLElement | null,
};

export type ITabsInterface = {
    isTabSelected: (indexOrTitle: number | string) => boolean,
    makeId: (title: string) => string,
};

export type ITabProps = {
    title: string,
    disabled?: boolean,
};
