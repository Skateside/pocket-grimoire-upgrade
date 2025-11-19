<template>
    <div class="tabs" :class="props.class">
        <div ref="tablist">
            <ClusterLayout node="menu" role="tablist" class="no-list">
                <li v-for="{ disabled, title } in tabProps">
                    <button
                        type="button"
                        class="tabs__tab"
                        :class="props.tabClass"
                        role="tab"
                        :aria-selected="isTabSelected(title)"
                        :aria-controls="makeId(title)"
                        :tabindex="isTabSelected(title) ? 0 : -1"
                        :disabled="disabled"
                        @click="setTabByTitle(title)"
                        @keydown="moveTabByKey"
                    >
                        {{ title }}
                    </button>
                </li>
            </ClusterLayout>
        </div>
        <div class="tabs__contents" :class="props.contentsClass" ref="tabpanels">
            <slot></slot>
        </div>
    </div>
</template>

<script setup lang="ts">
import type {
    ITabsChange,
    ITabsInterface,
    ITabsProps,
    ITabProps,
} from "./tabTypes";
import {
    computed,
    nextTick,
    provide,
    ref,
    useId,
    useSlots,
    watch,
} from "vue";
import ClusterLayout from "../layouts/ClusterLayout.vue";
import { words } from "../../scripts/utilities/strings";
import { clamp } from "../../scripts/utilities/numbers";

const props = defineProps<ITabsProps>();
const emit = defineEmits<{
    (e: "tabchange", tab: ITabsChange): void,
}>();
const suffix = useId();
const slots = useSlots();
const tablist = ref<HTMLElement | null>(null);
const tabpanels = ref<HTMLElement | null>(null);
const tabProps = ref<ITabProps[]>(
    slots.default?.().map(({ props }) => ({
        title: props?.title || "",
        disabled: props?.disabled || false,
    })) || []
);
const selectedIndex = ref<number>(0);
const selectedTitle = computed(() => tabProps.value[selectedIndex.value]?.title || "");

const makeId: ITabsInterface["makeId"] = (title: string) => {
    return `tab-${words(title.replace(/\W/g, "").toLowerCase()).join("-")}-${suffix}`;
};

const isTabSelected: ITabsInterface["isTabSelected"] = (
    indexOrTitle: number | string,
) => (
    typeof indexOrTitle === "string"
    ? selectedTitle.value === indexOrTitle
    : selectedIndex.value === indexOrTitle
);

const setTabByIndex = (index: number) => {
    selectedIndex.value = clamp(0, index, tabProps.value.length - 1);
};

const setTabByTitle = (title: string) => {
    setTabByIndex(tabProps.value.findIndex(({ title: tabTitle }) => tabTitle === title));
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
        setTabByIndex(tabProps.value.length - 1);
    },
};

const moveTabByKey = (event: KeyboardEvent) => {

    const handler = keyHandlers[event.key];

    if (!handler) {
        return;
    }

    handler();
    event.preventDefault();
    event.stopPropagation();
    nextTick(focusOnSelectedTab);

};

const focusOnSelectedTab = () => {

    tablist
        .value
        ?.querySelectorAll<HTMLButtonElement>("[role=\"tab\"]")
        ?.[selectedIndex.value]
        ?.focus();

};

const tabsInterface: ITabsInterface = {
    isTabSelected,
    makeId,
};

provide("tabs", tabsInterface);

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
