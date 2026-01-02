<!--
Puts things in a box.

A box has equal padding on each side and a set border.

https://every-layout.dev/layouts/box/
-->

<template>
    <component
        :is="props.node"
        class="l-box"
        :style="{
            '--l-box-background-colour': props.backgroundColour,
            '--l-box-border-colour': props.borderColour,
            '--l-box-border-width': props.borderWidth,
            '--l-box-colour': props.colour,
            '--l-box-outline-width': props.outlineWidth,
            '--l-box-padding': props.padding,
        }"
    >
        <slot></slot>
    </component>
</template>

<script setup lang="ts">
import type {
    ILayoutsNode,
    ILayoutsColour,
    ILayoutsLengthPercentage,
} from "../../scripts/types/layouts";

const props = withDefaults(defineProps<Partial<{
    node: ILayoutsNode,
    backgroundColour: ILayoutsColour,
    borderColour: ILayoutsColour,
    borderWidth: ILayoutsLengthPercentage,
    colour: ILayoutsColour,
    outlineWidth: ILayoutsLengthPercentage,
    padding: ILayoutsLengthPercentage,
}>>(), {
    node: "div",
});
</script>

<style lang="scss">
@property --l-box-background-colour { syntax: "<color>"; initial-value: #0000; inherits: true; }
@property --l-box-border-colour { syntax: "<color>"; initial-value: #0000; inherits: true; }
@property --l-box-border-width { syntax: "<length-percentage>"; initial-value: 1px; inherits: true; }
@property --l-box-colour { syntax: "<color>"; initial-value: currentColor; inherits: true; }
@property --l-box-outline-width { syntax: "<length-percentage>"; initial-value: 1px; inherits: true; }
@property --l-box-padding { syntax: "<length-percentage>"; initial-value: 16px; inherits: true; }

// 1. Windows High Contrast Mode will work with `outline`.

:where(.l-box) {
    --l-box-background-colour: transparent;
    --l-box-border-colour: transparent;
    --l-box-border-width: var(--border-width);
    --l-box-colour: var(--font-colour);
    --l-box-outline-width: var(--border-width);
    --l-box-padding: var(--base-sizing);

    background-color: var(--l-box-background-colour);
    border: var(--l-box-border-colour) solid var(--l-box-border-width);
    color: var(--l-box-colour);
    outline: var(--l-box-outline-width) solid transparent; // [1]
    outline-offset: calc(var(--l-box-outline-width) * -1); // [1]
    padding: var(--l-box-padding);

    // * {
    // 	color: inherit;
    // }

    > :first-child {
        margin-block-start: 0;
    }

    > :last-child {
        margin-block-end: 0;
    }
}
</style>
