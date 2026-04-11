<template>
    <form ref="form" v-bind="attrs">
        <slot></slot>
    </form>
</template>

<script setup lang="ts">
import type { IBaseFormExpose } from "~/types/base";
import { computed, onMounted, useAttrs, useTemplateRef } from "vue";
import useFieldSaver from "~/composables/useFieldSaver";

defineOptions({
    inheritAttrs: false,
});

const props = defineProps<{
    memory?: string,
}>();
const attrs = computed(() => {
    const attrs = { ...useAttrs() };

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

defineExpose({
    getData() {

        if (!form.value) {
            throw new ReferenceError("Form not mounted");
        }

        return new FormData(form.value);

    },
    // TODO: isValid()
} satisfies IBaseFormExpose);
</script>
