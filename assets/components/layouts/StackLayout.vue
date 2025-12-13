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

:where(.l-stack) {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;
    gap: var(--l-stack-gap, var(--base-sizing));

    > * {
        margin-block: 0;
    }
}
</style>
