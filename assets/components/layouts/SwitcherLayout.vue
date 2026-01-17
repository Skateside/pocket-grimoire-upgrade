<!--
Puts items next to one another horizontally, but where there are more than N
items, the items stack vertically.

https://every-layout.dev/layouts/switcher/
-->

<template>
    <component
        :is="props.node"
        :class="['l-switcher', `l-switcher--${toPosInt(props.limit)}`]"
        :data-i="dataI"
        :style="{
            '--l-switcher-gap': props.gap,
            '--l-switcher-threshold': props.threshold,
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
import { computed, onMounted } from "vue";
import { toPosInt } from "../../scripts/utilities/numbers";

const props = withDefaults(defineProps<Partial<{
    node: ILayoutsNode,
    gap: ILayoutsLength,
    threshold: ILayoutsLength,
    limit: number,
}>>(), {
    node: "div",
    limit: 4,
});

// Create the styles for the switcher based on the given limit. Without doing
// this, we would have to generate a list and hope that the limit will be one of
// the options.

const dataI = computed(() => `L-Switcher--${toPosInt(props.limit)}`);

onMounted(() => {

    if (document.getElementById(dataI.value)) {
        return; // style already exists.
    }

    const limit = toPosInt(props.limit);
    const style = document.createElement("style");
    style.id = dataI.value;
    style.textContent += `:where(.l-switcher--${limit})>:where(:nth-last-child(n+${limit})),`;
    style.textContent += `:where(.l-switcher--${limit})>:where(:nth-last-child(n+${limit})~*){flex-basis: 100%}`;
    document.head.append(style);

});
</script>

<style lang="scss">
@property --l-switcher-gap { syntax: "<length>"; initial-value: 16px; inherits: true;  }
@property --l-switcher-threshold { syntax: "<length>"; initial-value: 480px; inherits: true;  }

:where(.l-switcher) {
    --l-switcher-gap: var(--base-sizing);
    --l-switcher-threshold: 30rem;

    display: flex;
    flex-wrap: wrap;
    gap: var(--l-switcher-gap);

    > * {
        flex-grow: 1;
        flex-basis: calc((var(--l-switcher-threshold) - 100%) * 999);
    }
}
</style>
