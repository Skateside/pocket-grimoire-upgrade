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
import {
    onMounted,
    onUnmounted,
    ref,
    useTemplateRef,
} from "vue";
import {
    type IMutationObserverResponse,
    type IResizeObserverResponse,
    mutationObserver,
    resizeObserver,
} from "../../scripts/utilities/elements";

const props = withDefaults(defineProps<Partial<{
    node: ILayoutsNode,
    gap: ILayoutsLength,
    overflowingGap: ILayoutsLength,
    shadows: boolean,
    carousel: boolean,
}>>(), {
    node: "div",
});
const reel = useTemplateRef<HTMLElement>("reel");
const isOverflowing = ref(false);

let mutator: IMutationObserverResponse | null = null;
let resizor: IResizeObserverResponse | null = null;

const updateIsOverflowing = (element: HTMLElement | null) => {

    if (!element) {
        return;
    }

    isOverflowing.value = element.scrollWidth > element.clientWidth

};

onMounted(() => {

    const element = reel.value;

    if (!element) {
        return;
    }

    mutator = mutationObserver(element, {
        callback() {
            updateIsOverflowing(element);
        },
        childList: true,
    });

    resizor = resizeObserver(element, () => updateIsOverflowing(element));

});

onUnmounted(() => {
    mutator?.disconnect();
    resizor?.disconnect();
});
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
