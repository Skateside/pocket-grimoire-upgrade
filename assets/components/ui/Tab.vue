<template>
    <div
        class="tabs__tab"
        role="tabpanel"
        tabindex="0"
        :id="makeId(props.title)"
        :hidden="disabled || !isTabSelected(props.title)"
    >
        <slot></slot>
    </div>
</template>

<script setup lang="ts">
import type {
    ITabsInterface,
    ITabProps,
} from './tabTypes';
import { inject } from "vue";

const props = defineProps<ITabProps>();
const {
    isTabSelected,
    makeId,
} = inject<ITabsInterface>("tabs")!;
</script>
