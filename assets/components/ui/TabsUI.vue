<template>
    <div class="tabs">
        <div ref="tablist">
            <component
                :is="props.scroll ? ReelLayout : ClusterLayout"
                node="menu"
                role="tablist"
                class="not-a-list tabs__list"
            >
                <li v-for="{ disabled, id, tab, title } in tabProps">
                    <!-- TODO: no-button class on <button> -->
                    <button
                        type="button"
                        class="tabs__tab"
                        :class="props.tabClass"
                        role="tab"
                        :aria-selected="isTabSelected(id)"
                        :aria-controls="makeId(id)"
                        :tabindex="isTabSelected(id) ? 0 : -1"
                        :disabled="disabled"
                        :data-tab-id="id"
                        @click="setTabById(id)"
                        @keydown="moveTabByKey"
                    >
                        <component v-if="tab" :is="tab" />
                        <template v-else>{{ title }}</template>
                    </button>
                </li>
            </component>
        </div>
        <div class="tabs__contents" :class="props.contentsClass" ref="tabpanels">
            <slot></slot>
        </div>
    </div>
</template>

<script setup lang="ts">
import type {
    ITabsUIChange,
    ITabsUIMounted,
    ITabsUIInterface,
    ITabsUIProps,
    ITabUIProps,
} from "./tabTypes";
import {
    type Slot,
    computed,
    nextTick,
    onMounted,
    provide,
    ref,
    useId,
    useSlots,
    useTemplateRef,
    watch,
} from "vue";
import useUiStore from "../../scripts/store/ui";
import ClusterLayout from "../layouts/ClusterLayout.vue";
import ReelLayout from "../layouts/ReelLayout.vue";
import { words } from "../../scripts/utilities/strings";
import { clamp } from "../../scripts/utilities/numbers";

const props = defineProps<ITabsUIProps>();
const emit = defineEmits<{
    (e: "tabchange", tab: ITabsUIChange): void,
    (e: "tabmounted", data: ITabsUIMounted): void,
}>();
const suffix = useId();
const slots = useSlots();
const store = useUiStore();
const tablist = useTemplateRef("tablist");
const tabpanels = useTemplateRef("tabpanels");
const tabProps = computed<ITabUIProps[]>(() => {

    return slots.default?.().map((slot, index) => ({
        disabled: slot.props?.disabled || false,
        id: slot.props?.id ?? `tab-${index}`,
        tab: (slot.children as Record<string, Slot>|null)?.tab,
        title: slot.props?.title ?? String(index),
    })) || [];

});
const selectedIndex = ref<number>(0);
const selectedId = computed(() => {
    return tabProps.value[selectedIndex.value]?.id || "";
});

const tabs = computed(() => {
    const element = tablist.value || document.createElement("div");
    return element.querySelectorAll<HTMLButtonElement>("[role=\"tab\"]");
});
const panels = computed(() => {
    const element = tabpanels.value || document.createElement("div");
    return element.querySelectorAll<HTMLElement>("[role=\"tabpanel\"]");
});

const makeId: ITabsUIInterface["makeId"] = (id: string) => {
    const modified = words(id.replace(/\W/g, "").toLowerCase()).join("-");
    return `tab-${modified}-${suffix}`;
};

const isTabSelected: ITabsUIInterface["isTabSelected"] = (
    indexOrId: number | string,
) => (
    typeof indexOrId === "string"
    ? selectedId.value === indexOrId
    : selectedIndex.value === indexOrId
);

const setTabByIndex = (index: number) => {

    const floor = Math.floor(index);
    const clamped = clamp(0, floor, tabProps.value.length - 1);

    if (tabProps.value[clamped].disabled) {
        return false;
    }

    selectedIndex.value = clamped;

    return clamped === floor;

};

const setTabById = (id: string) => setTabByIndex(
    tabProps.value.findIndex(({ id: tabId }) => tabId === id)
);

const setTab: ITabsUIInterface["setTab"] = (indexOrId: number | string) => (
    typeof indexOrId === "number"
    ? setTabByIndex(indexOrId)
    : setTabById(indexOrId)
);

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
keyHandlers.ArrowUp = keyHandlers.ArrowLeft;
keyHandlers.ArrowDown = keyHandlers.ArrowRight;

const moveTabByKey = (event: KeyboardEvent) => {

    const handler = keyHandlers[event.key];

    if (!handler) {
        return; // key isn't supposed to be captured.
    }

    handler();
    event.preventDefault();
    event.stopPropagation();
    nextTick(focusOnSelectedTab);

};

const focusOnSelectedTab = () => {
    tabs.value[selectedIndex.value]?.focus();
};

const tabsInterface: ITabsUIInterface = {
    isTabSelected,
    makeId,
    setTab,
};

provide("tabs", tabsInterface);
defineExpose(tabsInterface);

watch(selectedIndex, (index, oldIndex) => {

    if (index === oldIndex) {
        return; // no change in index, tab wasn't changed.
    }

    if (props.memory) {
        store.setTabIndex(props.memory, index);
    }

    emit("tabchange", {
        index,
        oldIndex,
        tab: panels.value[index] ?? null,
        oldTab: panels.value[oldIndex] ?? null,
    });

});

onMounted(() => {

    if (props.memory) {
        setTabByIndex(store.getTabIndex(props.memory));
    }

    emit("tabmounted", {
        tab: panels.value[selectedIndex.value] ?? null,
        index: selectedIndex.value,
        tabs: [...panels.value],
    });

});
</script>

<style lang="scss" scoped>
.tabs__list {
    margin-block: var(--base-sizing);

    > li {
        margin-block: 0;
    }
}

.tabs__tab[aria-selected="true"] {
    font-weight: bold;
}
</style>
