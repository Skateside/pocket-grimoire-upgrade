<!--
Positions an icon so it can be put next to text.

https://every-layout.dev/layouts/icon/
-->

<template>
    <component
        :is="props.node"
        class="l-icon"
        :class="{
            'l-icon--lower': props.lower,
        }"
        :dataI="dataI"
        :role="typeof props.label === 'string' ? 'img' : undefined"
        :ariaLabel="props.label"
    >
        <slot></slot>
    </component>
</template>

<script setup lang="ts">
import type {
    ILayoutsNode,
    ILayoutsLength,
} from "../../scripts/types/layouts";
import { computed, onMounted } from "vue";

const props = withDefaults(defineProps<Partial<{
    node: ILayoutsNode,
    iconNode: ILayoutsNode,
    lower: boolean,
    gap: ILayoutsLength,
    label: string,
}>>(), {
    node: "span",
    iconNode: "svg",
});

const dataI = computed(() => {

    const base = "L-Icon--";
    const parts: string[] = [
        props.iconNode,
        JSON.stringify(props.lower ?? null),
        String(props.gap ?? null),
    ];

    return base + parts.join("-");

});

onMounted(() => {

    if (document.getElementById(dataI.value)) {
        return; // style already exists.
    }

    const style = document.createElement("style");

    style.id = dataI.value;

    style.textContent += `:where(.l-icon[data-i="${dataI.value}"])>${props.iconNode}{height:0.75em;height:1cap;width:0.75em;width:1cap}`;
    style.textContent += `:where(.l-icon--lower[data-i="${dataI.value}"])>${props.iconNode}{height:1ex;width:1ex}`;

    if (props.gap !== undefined) {
        style.textContent += `:where(.l-icon[data-i="${dataI.value}"]){display:inline-flex;align-items:baseline}`;
        style.textContent += `:where(.l-icon[data-i="${dataI.value}"])>${props.iconNode}{margin-inline-end:${props.gap}}`;
    }

    document.head.append(style);

});
</script>
