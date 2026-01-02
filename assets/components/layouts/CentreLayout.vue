<!--
Centres contents and/or centres itself.

https://every-layout.dev/layouts/center/
-->

<template>
    <component
        :is="props.node"
        :class="{
            'l-centre': props.type === 'self' || props.type === 'both',
            'l-centre-contents': props.type === 'contents' || props.type === 'both',
        }"
        :style="{
            '--l-centre-gap': props.gap,
            '--l-centre-max-size': props.maxSize,
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
    gap: ILayoutsLengthPercentage,
    maxSize: ILayoutsLength,
    type: "self" | "contents" | "both",
}>>(), {
    node: "div",
    type: "self",
});
</script>

<style lang="scss">
@property --l-centre-gap { syntax: "<length-percentage>"; initial-value: 16px; inherits: true; }
@property --l-centre-max-size { syntax: "<length>"; initial-value: 520px; inherits: true; }

:where(.l-centre) {
    --l-centre-max-size: 65ch;
    --l-centre-gap: var(--base-sizing);

    box-sizing: content-box;
    max-inline-size: var(--l-centre-max-size);
    margin-inline: auto;
    padding-inline: var(--l-centre-gap);
}

:where(.l-centre-contents) {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
}
</style>
