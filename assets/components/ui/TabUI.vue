<template>
    <div
        class="tabs__tab"
        role="tabpanel"
        :tabindex="tabindex"
        :id="makeId(props.id)"
        :hidden="!isTabSelected(props.id)"
    >
        <slot v-if="!disabled"></slot>
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
