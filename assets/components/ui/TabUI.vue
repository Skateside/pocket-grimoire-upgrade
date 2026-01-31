<template>
    <div
        class="tabs__tab"
        role="tabpanel"
        :tabindex="tabindex"
        :id="makeId(props.name)"
        :hidden="!isTabSelected(props.name)"
    >
        <slot v-if="!disabled && isTabSelected(props.name)"></slot>
    </div>
</template>

<script setup lang="ts">
import type {
    ITabsUIInterface,
    ITabUIProps,
} from './tabTypes';
import {
    computed,
    inject,
} from "vue";

const props = defineProps<ITabUIProps>();
const tabindex = computed(() => (
    props.disabled
    ? undefined
    : 0
));
const {
    isTabSelected,
    makeId,
} = inject<ITabsUIInterface>("tabs")!;
</script>
