<template>
    <form ref="form" v-bind="attrs">
        <slot></slot>
    </form>
</template>

<script setup lang="ts">
import { computed, onMounted, useAttrs, useTemplateRef } from "vue";
import useFieldSaver from "~/composables/useFieldSaver";

defineOptions({
    inheritAttrs: false,
});

const props = defineProps<{
    memory?: string,
}>();
const rawAttrs = useAttrs();
const attrs = computed(() => {
    const attrs = { ...rawAttrs };

    if (props.memory) {
        attrs["data-memory"] = props.memory;
    }

    return attrs;
});
const form = useTemplateRef("form");

onMounted(() => {

    if (props.memory) {
        useFieldSaver(form, true)
    }

});
</script>
