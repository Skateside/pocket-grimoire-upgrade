<template>
    <fieldset>
        <legend>{{ props.label }} ({{ props.modelValue }})</legend>
        <ul>
            <li v-for="(label, id) in props.radios" :key="id">
                <BaseLabel :text="label" :nested="true" layout="sidebar-inverse">
                    <BaseInput
                        v-model="modelValue[id]"
                        type="radio"
                        :name="name"
                        :checked="props.modelValue === id"
                        @input="() => emit('update:modelValue', id)"
                    />
                </BaseLabel>
            </li>
        </ul>
    </fieldset>
</template>

<script setup lang="ts">
import { computed, reactive } from "vue";
import BaseLabel from "./BaseLabel.vue";
import BaseInput from "./BaseInput.vue";
import { mapObject } from "~/scripts/utilities/objects";

const props = defineProps<{
    label: string,
    radios: Record<string, string>,
    modelValue: string,
}>();
const emit = defineEmits<{
    (e: "update:modelValue", value: string): void,
}>();
const modelValue = reactive(mapObject(props.radios, ([id]) => [id, id]));
const name = computed(() => props.label.toLowerCase().trim().replaceAll(/\s+/g, "-"));
</script>
