<!--
Stacks item on top of one another, putting an equally-sized gap between each of
them.

https://every-layout.dev/layouts/stack/
-->

<template>
    <component
        :is="props.node"
        class="l-stack"
        :style="{
            '--l-stack-gap': props.gap,
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

<!-- NOTE: replaced the "owl" with a `gap` - see if it causes any problems -->
<style lang="scss">
@property --l-stack-gap { syntax: "<length>"; initial-value: 16px; inherits: true; }

// We need to be able to set the `margin-block` of the children, but
// `:where(.l-stack) > *` has a selector strength of 0, so a selector like `p`
// would override it. Therefore, the `:where()` is not needed at the root.
.l-stack {
    :where(&) {
        display: flex;
        flex-direction: column;
        justify-content: flex-start;
        gap: var(--l-stack-gap, var(--base-sizing));
    }

    > * {
        margin-block: 0;
    }
}
</style>
