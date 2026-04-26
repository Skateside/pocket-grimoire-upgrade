<template>
    <component
        :is="props.node"
        class="spinner"
        :class="{
            'spinner--colour': props.colour,
        }"
        :style="{
            '--spinner-max-size': props.maxSize,
        }"
        role="status"
    >
        <span class="sr-only">{{ props.label }}</span>
    </component>
</template>

<script setup lang="ts">
import type {
    ILayoutsNode,
    ILayoutsLength,
    ILayoutsLengthPercentage,
} from "~/types/layouts";

const props = withDefaults(defineProps<{
    node?: ILayoutsNode,
    label?: string,
    borderSize?: ILayoutsLength,
    maxSize?: ILayoutsLengthPercentage,
    colour?: boolean,

}>(), {
    node: "div",
    label: "Loading", // TODO: i18n
});
</script>

<style lang="scss" scoped>
@property --spinner-border-size { syntax: "<length>"; initial-value: 4px; inherits: true; }
@property --spinner-max-size { syntax: "<length-percentage>"; initial-value: 32px; inherits: true; }
@property --spinner-rotation { syntax: "<number>"; initial-value: 0; inherits: true; }

@keyframes spinner-rotate {
    0% {
        --spinner-rotation: 0;
    }
    100% {
        --spinner-rotation: 360;
    }
}

.spinner {
    --spinner-border-size: calc(var(--spinner-max-size) / 8);

    animation: spinner-rotate 1s linear infinite forwards;
    width: 100%;
    max-width: var(--spinner-max-size);
    aspect-ratio: 1;
    color: inherit;
    position: relative;

    &::before,
    &::after {
        content: "";
        aspect-ratio: 1;
        border-width: var(--spinner-border-size);
        border-style: none;
        border-block-start-style: solid;
        border-color: transparent;
        border-block-start-color: currentColor;
        border-radius: 50%;
        position: absolute;
        inset-inline-start: 50%;
        inset-block-start: 50%;
        transform: translate(-50%, -50%) rotate(calc(var(--spinner-rotate) * 1deg));
    }

    &::before {
        --spinner-rotate: var(--spinner-rotation);

        border-block-start-color: currentColor;
        border-inline-end-style: solid;
        width: 100%;
    }

    &::after {
        --spinner-rotate: calc(var(--spinner-rotation) * -1);

        border-block-start-color: currentColor;
        border-inline-start-style: solid;
        width: calc(100% - var(--spinner-border-size) * 4);
    }
}

.spinner--colour {
    &::before {
        border-block-start-color: var(--colour-team-good);
    }

    &::after {
        border-block-start-color: var(--colour-team-evil);
    }
}
</style>
