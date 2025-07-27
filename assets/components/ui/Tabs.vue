<template>
    <div class="tabs">
        <menu class="tabs__tablist" role="tablist" ref="tablist">
            <li v-for="title in titles">
                <button
                    type="button"
                    class="tabs__tab"
                    role="tab"
                    :aria-selected="isTabSelected(title)"
                    :aria-controls="makeId(title)"
                    :tabindex="isTabSelected(title) ? 0 : -1"
                    @click="setTabByTitle(title)"
                    @keydown="moveTabByKey"
                >
                    {{ title }}
                </button>
            </li>
        </menu>
        <div class="tabs__contents" ref="tabpanels">
            <slot></slot>
        </div>
    </div>
</template>

<script setup lang="ts">
import type { ITabsChange } from "./tabs";
import {
    computed,
    nextTick,
    provide,
    ref,
    useId,
    useSlots,
    watch,
} from "vue";
import { words } from "../../scripts/utilities/strings";
import { clamp } from "../../scripts/utilities/numbers";

const emit = defineEmits<{
    (e: "tabchange", tab: ITabsChange): void,
}>();
const prefix = useId();
const slots = useSlots();
const tablist = ref<HTMLElement | null>(null);
const tabpanels = ref<HTMLElement | null>(null);
const titles = ref<string[]>(slots.default?.().map(({ props }) => props?.title || "") || []);
const selectedIndex = ref<number>(0);
const selectedTitle = computed(() => titles.value[selectedIndex.value] || "");

function isTabSelected(index: number): boolean;
function isTabSelected(title: string): boolean;
function isTabSelected(indexOrTitle: number | string) {

    return (
        typeof indexOrTitle === "string"
        ? selectedTitle.value === indexOrTitle
        : selectedIndex.value === indexOrTitle
    );

};

const setTabByIndex = (index: number) => {
    selectedIndex.value = clamp(0, index, titles.value.length - 1);
};

const setTabByTitle = (title: string) => {
    setTabByIndex(titles.value.findIndex((tabTitle) => tabTitle === title));
};

const keyHandlers: Record<string, () => void> = {
    ArrowLeft() {
        setTabByIndex(selectedIndex.value - 1);
    },
    ArrowRight() {
        setTabByIndex(selectedIndex.value + 1);
    },
    Home() {
        setTabByIndex(0);
    },
    End() {
        setTabByIndex(titles.value.length - 1);
    },
};

const moveTabByKey = (event: KeyboardEvent) => {

    const handler = keyHandlers[event.key];

    if (!handler) {
        return;
    }

    handler();
    event.stopPropagation();
    event.preventDefault();
    nextTick(focusOnSelectedTab);

};

const focusOnSelectedTab = () => {

    tablist
        .value
        ?.querySelectorAll<HTMLButtonElement>("[role=\"tab\"]")
        ?.[selectedIndex.value]
        ?.focus();

};

const makeId = (title: string) => {
    return `${prefix}-${words(title.replace(/\W/g, "").toLowerCase()).join("-")}`;
};

provide("tabs", {
    isTabSelected,
    makeId,
});

watch(selectedIndex, (index, oldIndex) => {

    if (index === oldIndex) {
        return;
    }

    const panels = tabpanels.value?.querySelectorAll<HTMLElement>("[role=\"tabpanel\"]") || [];

    emit("tabchange", {
        tab: panels[index] ?? null,
        oldTab: panels[oldIndex] ?? null,
    });

});
</script>

<style lang="scss" scoped>
.tabs__tablist {
    list-style-type: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-flow: row wrap;
    gap: 0.5em;
}

.tabs__tab[aria-selected="true"] {
    font-weight: bold;
}
</style>