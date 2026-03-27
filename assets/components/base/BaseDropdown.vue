<template>
    <select @input="handleInput" :id="id">
        <option
            v-for="{ text, value, disabled } in choices"
            :key="value"
            :value="value"
            :selected="value === props.modelValue"
            :disabled="disabled"
        >
            {{ text }}
        </option>
    </select>
</template>

<script setup lang="ts">
import type { IBaseChoice } from "~/scripts/types/base";
import { computed } from "vue";
import useLabel from "~/composables/useLabel";

const props = defineProps<{
    choices: IBaseChoice[],
    name: string,
    modelValue: string,
    emptyText?: string,
}>();
const emit = defineEmits<{
    (e: "update:modelValue", value: string): void,
}>();
const { id } = useLabel();
const choices = computed(() => {
const choices = [...props.choices];

    if (props.emptyText) {
        choices.unshift({ text: props.emptyText, value: "", disabled: true });
    }

    return choices;

});

const handleInput = ({ target }: Event) => {
    emit("update:modelValue", (target as HTMLInputElement).value);
};
</script>
