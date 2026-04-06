<template>
    <!-- TODO: make this work and replace existing calls to <BaseLabel><BaseInput /></BaseLabel> -->
    <!-- BUG: parent setting model to "" doesn't update this model -->
    <BaseLabel :label="props.label">
        <BaseInput v-model="value" v-bind="attrs" @input="handleInput" />
    </BaseLabel>
</template>

<script setup lang="ts">
import { ref, useAttrs, } from "vue";
import BaseLabel from "./BaseLabel.vue";
import BaseInput from "./BaseInput.vue";

defineOptions({
    inheritAttrs: false,
});
const props = defineProps<{
    label: string,
    modelValue: string,
}>();
const emit = defineEmits<{
    (e: "update:modelValue", value: string): void,
}>();
const attrs = useAttrs();
const value = ref(props.modelValue);

const handleInput = () => emit("update:modelValue", value.value);
</script>
