<!--
Puts a smaller item next to a larger one. If there is not enough space for both,
the children stack.

https://every-layout.dev/layouts/sidebar/
-->

<template>
    <component
        :is="props.node"
        class="l-sidebar"
        :class="{
            'l-sidebar--start': props.side === 'start',
            'l-sidebar--end': props.side === 'end',
        }"
        :style="{
            '--l-sidebar-gap': props.gap,
            '--l-sidebar-content-size': props.contentSize,
            '--l-sidebar-side-size': props.sideSize,
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
    side: "start" | "end",
    gap: ILayoutsLength,
    contentSize: ILayoutsLengthPercentage,
    sideSize: ILayoutsLengthPercentage,
}>>(), {
    node: "div",
    side: "start",
});
</script>

<style lang="scss">
@property --l-sidebar-gap { syntax: '<length>'; initial-value: 16px; inherits: true; }
@property --l-sidebar-content-size { syntax: '<length-percentage>'; initial-value: 50%; inherits: true; }
@property --l-sidebar-side-size { syntax: '<length-percentage>'; initial-value: 240px; inherits: true; }

:where(.l-sidebar) {
    --l-sidebar-gap: var(--base-sizing);
    --l-sidebar-content-size: 50%;
    --l-sidebar-side-size: 30ch;

    display: flex;
    flex-wrap: wrap;
    gap: var(--l-sidebar-gap);

    > * {
        flex-grow: 1;
        flex-basis: var(--l-sidebar-side-size);
    }
}

:where(.l-sidebar--start) > :first-child,
:where(.l-sidebar--end) > :last-child {
    flex-basis: 0;
    flex-grow: 999;
    min-inline-size: var(--l-sidebar-content-size);
}
</style>
