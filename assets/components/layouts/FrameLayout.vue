<template>
    <component
        :is="props.node"
        class="l-frame"
        :style="{
            '--l-frame-numerator': ratio.numerator,
            '--l-frame-denominator': ratio.denominator,
        }"
    >
        <slot></slot>
    </component>
</template>

<script setup lang="ts">
import type {
    ILayoutsNode,
} from "../../scripts/types/layouts";
import { computed } from "vue";

const props = withDefaults(defineProps<Partial<{
    node: ILayoutsNode,
    ratio: `${number}` | `${number}:${number}`,
}>>(), {
    node: "div",
    ratio: "16:9",
});

const ratio = computed(() => {
    const [
        numerator,
        denominator,
    ] = props.ratio.split(":");

    return {
        numerator,
        denominator,
    };
});
</script>

<style lang="scss">
@property --l-frame-numerator { syntax: '<number>'; initial-value: 16; inherits: true; }
@property --l-frame-denominator { syntax: '<number>'; initial-value: 9; inherits: true; }

:where(.l-frame) {
    --l-frame-numerator: 16;
    --l-frame-denominator: 9;

    aspect-ratio: var(--l-frame-numerator) / var(--l-frame-denominator);
    overflow: hidden;
    display: flex;
    justify-content: center;
    align-items: center;

    > :where(img, video) {
        inline-size: 100%;
        block-size: 100%;
        object-fit: cover;
    }
}
</style>
