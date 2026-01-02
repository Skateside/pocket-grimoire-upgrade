<!--
Creates a CSS container that can be checked and referenced.

https://every-layout.dev/layouts/container/
-->

<template>
    <component
        :is="props.node"
        class="l-container"
        :style="{
            '--l-container-name': props.name,
        }"
    >
        <slot></slot>
    </component>
</template>

<script setup lang="ts">
import type {
    ILayoutsNode,
} from "../../scripts/types/layouts";

const props = withDefaults(defineProps<Partial<{
    node: ILayoutsNode,
    name: string,
}>>(), {
    node: "div",
});
</script>

<style lang="scss">
@property --l-container-name { syntax: "<custom-ident>"; initial-value: none; inherits: true; }

:where(.l-container) {
    display: block;
    container-type: inline-size;
    container-name: var(--l-container-name, none);
}
</style>
