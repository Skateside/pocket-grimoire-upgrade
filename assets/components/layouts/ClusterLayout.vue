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

:where(.l-cluster) {
    --l-cluster-gap: var(--base-sizing);

    display: flex;
    flex-wrap: wrap;
    gap: var(--l-cluster-gap);
}
</style>
