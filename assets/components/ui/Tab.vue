<template>
    <div
        class="tabs__tab"
        :class="props.class"
        role="tabpanel"
        :tabindex="tabindex"
        :id="makeId(props.title)"
        :hidden="!isTabSelected(props.title)"
    >
        <slot v-if="!disabled"></slot>
    </div>
</template>

<script setup lang="ts">
import type {
    ITabsInterface,
    ITabProps,
} from './tabTypes';
import {
    computed,
    inject,
} from "vue";

const props = defineProps<ITabProps>();
const tabindex = computed(() => (
    props.disabled
    ? undefined
    : 0)
);
const {
    isTabSelected,
    makeId,
} = inject<ITabsInterface>("tabs")!;
</script>
