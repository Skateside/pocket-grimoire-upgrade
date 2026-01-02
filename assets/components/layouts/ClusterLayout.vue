<!--
Puts elements next to each other horizontally. If there are to many items to fit
on a single row, the next item is put onto the next row.

https://every-layout.dev/layouts/cluster/
-->

<template>
    <component
        :is="props.node"
        class="l-cluster"
        :style="{
            '--l-cluster-gap': props.gap,
        }"
    >
        <slot></slot>
    </component>
</template>

<script setup lang="ts">
import type {
    ILayoutsNode,
    ILayoutsLength,
} from "../../scripts/types/layouts";

const props = withDefaults(defineProps<Partial<{
    node: ILayoutsNode,
    gap: ILayoutsLength,
}>>(), {
    node: "div",
});
</script>

<style lang="scss">
@property --l-cluster-gap { syntax: "<length>"; initial-value: 16px; inherits: true; }

// We need to be able to set the `margin-inline` of the children, but
// `:where(.l-cluster) > *` has a selector strength of 0, so a selector like `p`
// would override it. Therefore, the `:where()` is not needed at the root.
.l-cluster {
    :where(&) {
        --l-cluster-gap: var(--base-sizing);

        display: flex;
        flex-wrap: wrap;
        gap: var(--l-cluster-gap);
    }

    > * {
        margin-inline: 0;
    }
}
</style>
