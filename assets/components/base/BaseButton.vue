<template>
    <component
        :is="node"
        class="button"
        :class="className"
        v-bind="attrs"
    >
        <template v-if="slots.default">
            <slot />
        </template>
        <template v-else>
            {{ text }}
        </template>
    </component>
</template>

<script setup lang="ts">
import type { ILayoutsNode } from "../../scripts/types/layouts";
import { type Component, computed, useAttrs, useSlots } from "vue";
import { RouterLink } from "vue-router";
import { interpret, words } from "~/scripts/utilities/strings";

defineOptions({
    inheritAttrs: false,
});
const props = withDefaults(defineProps<{
    node?: ILayoutsNode,
    text?: string,
    variant?: string,
}>(), {
    node: "button",
});
const slots = useSlots();
const attrs = computed(() => {

    const attrs = { ...useAttrs() };

    if (
        props.node === "button"
        && !Object.hasOwn(attrs, "type")
        && !Object.hasOwn(attrs, "to")
    ) {
        attrs.type = "button";
    }

    if (
        props.node === "a"
        && (!Object.hasOwn(attrs, "href") || attrs.href === "#")
    ) {
        console.warn("<a> or <a href=\"#\"> is probably a mistake - did you want a button?")
    }

    return attrs;

});
const node = computed(() => {

    let node: string | Component = props.node;

    if (Object.hasOwn(attrs.value, "to")) {
        node = RouterLink;
    }

    return node;

});
const className = computed(() => {
    return words(interpret(props.variant)).map((word) => `button--${word}`);
});
</script>
