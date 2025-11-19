<template>
    <component
        :is="props.node"
        ref="reel"
        class="l-reel"
        :class="{
            'p-scroll-shadow-h': props.shadows,
            'l-reel--shadows': props.shadows,
            'l-reel--carousel': props.carousel,
            'is-overflowing': isOverflowing,
        }"
        :style="{
            '--l-reel-gap': props.gap,
            '--l-reel-overflowing-gap': props.overflowingGap,
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
import { onMounted, onUnmounted, ref } from "vue";
import useElementWatcher from "../../composables/useElementWatcher";

const props = withDefaults(defineProps<Partial<{
    node: ILayoutsNode,
    gap: ILayoutsLength,
    overflowingGap: ILayoutsLength,
    shadows: boolean,
    carousel: boolean,
}>>(), {
    node: "div",
});
const reel = ref<HTMLElement | null>(null);
const isOverflowing = ref(false);

const {
    watch,
    unwatch,
} = useElementWatcher((element) => {
    isOverflowing.value = element.scrollWidth > element.clientWidth;
});

onMounted(() => watch(reel));
onUnmounted(() => unwatch(reel));
</script>

<style lang="scss">
@property --l-reel-gap { syntax: "<length>"; initial-value: 16px; inherits: true; }
@property --l-reel-overflowing-gap { syntax: "<length>"; initial-value: 16px; inherits: true; }

:where(.l-reel) {
    --l-reel-gap: var(--base-sizing);
    --l-reel-overflowing-gap: var(--l-reel-gap);

    display: flex;
    block-size: auto;
    overflow-x: auto;
    overflow-y: hidden;

    > * {
        flex: 0 0 auto;

        + * {
            margin-inline-start: var(--l-reel-gap);
        }
    }

    &:where(.is-overflowing) {
        padding-block-end: var(--l-reel-overflowing-gap);
    }
}

:where(.l-reel--shadows) {
    --p-scroll-shadow-colour: rgb(from currentColor r g b / 20%);
}

:where(.l-reel--carousel) {
    scroll-snap-type: x mandatory;
    scroll-behavior: smooth;

    > * {
        width: 100%;
        flex-shrink: 0;
        scroll-snap-align: start;
    }
}
</style>
