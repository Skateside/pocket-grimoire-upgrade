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
import { computed, onMounted, ref } from "vue";

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
const cover = ref<HTMLElement|null>(null);

const addStyleSheet = () => {

    if (document.getElementById(dataI.value)) {
        return;
    }

    const style = document.createElement("style");
    style.id = dataI.value;
    style.textContent += `:where(.l-cover[data-i="${dataI.value}"])>:where(:first-child:not(${props.centred})){margin-block-start:0}`;
    style.textContent += `:where(.l-cover[data-i="${dataI.value}"])>:where(:last-child:not(${props.centred})){margin-block-end:0}`;
    style.textContent += `:where(.l-cover[data-i="${dataI.value}"])>:where(${props.centred}){margin-block:auto}`;
    document.head.append(style);

};

const observeCover = (cover: HTMLElement) => {

    const observer = new IntersectionObserver(([entry]) => {
        entry.target.setAttribute("data-visible", String(entry.isIntersecting));
    });

    observer.observe(cover);

};

onMounted(() => {

    addStyleSheet();

    if (props.observe && cover.value) {
        observeCover(cover.value);
    }

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
