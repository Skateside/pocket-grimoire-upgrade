<template>
    <template v-if="props.nested">
        <component v-if="props.layout.endsWith('-inverse')" :is="node" class="label" v-bind="attrs">
            <slot />
            <span class="label__text">{{ text }}</span>
        </component>
        <component v-else :is="node" class="label" v-bind="attrs">
            <span class="label__text">{{ text }}</span>
            <slot />
        </component>
    </template>
    <template v-else>
        <component v-if="props.layout.endsWith('-inverse')" :is="node" class="label" v-bind="attrs">
            <slot />
            <label class="label__text" v-bind="labelAttrs">{{ text }}</label>
        </component>
        <component v-else :is="node" class="label" v-bind="attrs">
            <label class="label__text" v-bind="labelAttrs">{{ text }}</label>
            <slot />
        </component>
    </template>
</template>

<script setup lang="ts">
import { type SetupContext, computed, provide, reactive, useAttrs, useId } from "vue";
import type { IBaseLabelLayouts, IBaseLabelProvide } from "../../scripts/types/base";
import ClusterLayout from "../layouts/ClusterLayout.vue";
import SidebarLayout from "../layouts/SidebarLayout.vue";
import StackLayout from "../layouts/StackLayout.vue";

const props = withDefaults(defineProps<{
    layout?: IBaseLabelLayouts,
    nested?: boolean,
    text: string,
}>(), {
    layout: "cluster",
});

const node = computed(() => {

    switch (props.layout) {

    case "cluster":
    case "cluster-inverse":
        return ClusterLayout;

    case "sidebar":
    case "sidebar-inverse":
        return SidebarLayout;

    case "stack":
    case "stack-inverse":
        return StackLayout;

    }

});
const suffix = useId();
const rawAttrs = useAttrs();
const attrs = computed(() => {

    const attrs = { ...rawAttrs };

    if (props.nested && !Object.hasOwn(attrs, "node")) {
        attrs.node = "label";
    }

    if (props.nested && !Object.hasOwn(attrs, "for")) {
        attrs.for = `input-${suffix}`;
    }

    if (!Object.hasOwn(attrs, "gap")) {
        attrs.gap = "0.5em";
    }

    if (props.layout === "sidebar-inverse") {
        attrs.side = "end";
    }

    return attrs;

});
const labelAttrs = computed(() => {

    const labelAttrs: SetupContext["attrs"] = {};

    if (!props.nested) {
        labelAttrs.for = attrs.value.for ?? `input-${suffix}`;
    }

    return labelAttrs;

});

const provision = reactive<IBaseLabelProvide>({
    id: (attrs.value.for ?? labelAttrs.value.for ?? "") as string,
});

provide("label", provision);
</script>

<style lang="scss" scoped>
.label:where(.l-sidebar) {
    align-items: center;
}
</style>
