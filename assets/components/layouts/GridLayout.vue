<!--
Puts things into a grid of as many columns as possible (up to a max width for
each column). Any subsequent children go onto the next row.

https://every-layout.dev/layouts/grid/
-->

<template>
    <component
        :is="props.node"
        class="l-grid"
        :style="{
            '--l-grid-gap': props.gap,
            '--l-grid-max-width': props.maxWidth,
        }"
    >
        <slot></slot>
    </component>
</template>

<script setup lang="ts">
import type {
    ILayoutsNode,
    ILayoutsLength,
    ILayoutsLengthPercentage,
} from "../../scripts/types/layouts";

const props = withDefaults(defineProps<Partial<{
    node: ILayoutsNode,
    gap: ILayoutsLength,
    maxWidth: ILayoutsLengthPercentage,
}>>(), {
    node: "div",
});
</script>

<style lang="scss">
@property --l-grid-gap { syntax: "<length>"; initial-value: 16px; inherits: true; }
@property --l-grid-max-width { syntax: "<length-percentage>"; initial-value: 120px; inherits: true; }

.l-grid {
    --l-grid-gap: var(--base-sizing);
    --l-grid-max-width: 30ch;

    display: grid;
    grid-gap: var(--l-grid-gap);
    grid-template-columns: repeat(auto-fit, minmax(min(var(--l-grid-max-width), 100%), 1fr));
}
</style>
