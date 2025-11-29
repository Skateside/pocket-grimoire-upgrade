<template>
    <component
        :is="props.node"
        class="l-imposter"
        :class="{
            'l-imposter--contain': !props.breakout,
            'l-imposter--fixed': props.fixed,
        }"
        :style="{
            '--l-imposter-margin': props.margin,
        }"
    >
        <slot></slot>
    </component>
</template>

<script setup lang="ts">
import type {
    ILayoutsNode,
    ILayoutsLengthPercentage,
} from "../../scripts/types/layouts";

const props = withDefaults(defineProps<Partial<{
    node: ILayoutsNode,
    breakout: boolean,
    fixed: boolean,
    margin: ILayoutsLengthPercentage,
}>>(), {
    node: "div",
});
</script>

<style lang="scss">
@property --l-imposter-margin { syntax: "<length-percentage>"; initial-value: 16px; inherits: true; }

:where(.l-imposter) {
    position: absolute;
    inset-block-start: 50%;
    inset-inline-start: 50%;
    transform: translate(-50%, -50%);
}

:where(.l-imposter--contain) {
    --l-imposter-margin: var(--base-sizing);
    overflow: auto;    
    max-inline-size: calc(100% - var(--l-imposter-margin));
    max-block-size: calc(100% - var(--l-imposter-margin));
}

:where(.l-imposter--fixed) {
    position: fixed;
}
</style>
