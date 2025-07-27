<template>
    <div
        class="tabs__tab"
        role="tabpanel"
        tabindex="0"
        :id="makeId(props.title)"
        :hidden="!isTabSelected(props.title)"
    >
        <slot></slot>
    </div>
</template>

<script setup lang="ts">
import { inject } from "vue";

const props = defineProps<{
    title: string,
}>();
const {
    isTabSelected,
    makeId,
} = inject<{
    isTabSelected: (indexOrTitle: number | string) => boolean,
    makeId: (title: string) => string,
}>("tabs")!;
</script>
