<template>
    <component
        :is="props.node"
        class="l-stack"
        :data-i="dataI"
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
    gap: ILayoutsLength,
}>>(), {
    node: "div",
});

// We can't set `props.gap` on `<component :style="...">` because that would
// affect the current element and we need to set the style on the children.
// Since we can't do that in Vue, we create a style tag that contains the
// styling that we need and add it to the DOM when this component is mounted.

const dataI = computed(() => `L-Stack--${props.gap}`);

onMounted(() => {

    if (document.getElementById(dataI.value)) {
        return;
    }

    const style = document.createElement("style");
    style.id = dataI.value;
    style.textContent += `:where(.l-stack[data-i="${dataI.value}"])>*{--l-stack-gap:${props.gap}}`;
    document.head.append(style);

});
</script>

<style lang="scss">
@property --l-stack-gap { syntax: '<length>'; initial-value: 16px; inherits: true; }

:where(.l-stack) {
    display: flex;
    flex-direction: column;
    justify-content: flex-start;

    > * {
        --l-stack-gap: inherit;
        margin-block: 0;

        + * {
            margin-block-start: var(--l-stack-gap, var(--base-sizing));
        }
    }
}
</style>
