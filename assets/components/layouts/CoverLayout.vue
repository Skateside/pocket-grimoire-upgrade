<!--
Creates a cover page.

https://every-layout.dev/layouts/cover/
-->

<template>
    <component
        :is="props.node"
        ref="cover"
        class="l-cover"
        :class="{
            'l-cover--no-padding': props.noPadding,
        }"
        :style="{
            '--l-cover-gap': props.gap,
            '--l-cover-min-height': props.minHeight,
        }"
        :data-i="dataI"
        :data-observe="props.observe"
        :data-visible="isVisible"
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
    computed,
    onMounted,
    onUnmounted,
    ref,
    useTemplateRef,
} from "vue";
import {
    type IIntersectionObserverResponse,
    intersectionObserver,
} from "../../scripts/utilities/elements";

const props = withDefaults(defineProps<Partial<{
    node: ILayoutsNode,
    gap: ILayoutsLength,
    minHeight: ILayoutsLength,
    noPadding: boolean,
    centred: string,
    observe: boolean,
}>>(), {
    node: "div",
    centred: "h1",
});

const dataI = computed(() => `L-Cover--${props.centred}`);
const isVisible = ref<boolean|void>(
    typeof props.observe === "boolean"
    ? false
    : undefined
);
const cover = useTemplateRef<HTMLElement>("cover");

const addStyleSheet = () => {

    if (document.getElementById(dataI.value)) {
        return;
    }

    const style = document.createElement("style");
    style.id = dataI.value;
    style.textContent += `:where(.l-cover[data-i="${dataI.value}"])>:first-child:where:(not(${props.centred})){margin-block-start:0}`;
    style.textContent += `:where(.l-cover[data-i="${dataI.value}"])>:last-child:where:(not(${props.centred})){margin-block-end:0}`;
    style.textContent += `:where(.l-cover[data-i="${dataI.value}"])>${props.centred}{margin-block:auto}`;
    document.head.append(style);

};

let intersector: IIntersectionObserverResponse | null = null;

onMounted(() => {

    addStyleSheet();

    if (props.observe && cover.value) {

        intersector = intersectionObserver(cover.value, ({ entry }) => {

            entry.target.setAttribute(
                "data-visible",
                String(entry.isIntersecting),
            );

        });

    }

});

onUnmounted(() => {
    intersector?.disconnect();
});
</script>

<style lang="scss">
@property --l-cover-gap { syntax: "<length>"; initial-value: 16px; inherits: true; }
@property --l-cover-min-height { syntax: "<length>"; initial-value: 0; inherits: true; }

:where(.l-cover) {
    --l-cover-gap: var(--base-spacing);
    --l-cover-min-height: 0;

    min-height: var(--l-cover-min-height);
    padding: var(--l-cover-gap);

    > * {
        margin-block: var(--l-cover-gap);
    }
}

:where(.l-cover--no-padding) {
    padding: 0;
}
</style>
