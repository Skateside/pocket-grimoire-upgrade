<template>
    <fieldset v-if="props.open">
        <legend>{{ props.label }}</legend>
        <ul>
            <li v-for="{ text, value }, index in props.choices" :key="value">
                <BaseLabel :label="text" :nested="true">
                    <BaseInput
                        v-model="model"
                        v-bind="attrs"
                        type="radio"
                        :name="props.name"
                        :value="value"
                        :checked="value === props.modelValue"
                        :required="index === 0 ? props.required : undefined"
                        @input="() => handleInput(value)"
                    />
                </BaseLabel>
            </li>
        </ul>
    </fieldset>
    <BaseLabel v-else :label="props.label">
        <BaseDropdown
            v-model="model"
            v-bind="attrs"
            :choices="props.choices"
            :name="props.name"
            :empty-text="props.emptyText"
            @update:model-value="handleInput"
        />
    </BaseLabel>
</template>

<script setup lang="ts">
import type { IBaseChoice } from "~/scripts/types/base";
import { ref, useAttrs, watch } from "vue";
import BaseLabel from "./BaseLabel.vue";
import BaseInput from "./BaseInput.vue";
import BaseDropdown from "./BaseDropdown.vue";

defineOptions({
    inheritAttrs: false,
});
const props = defineProps<{
    name: string,
    choices: IBaseChoice[],
    label: string,
    modelValue: string,
    open?: boolean,
    emptyText?: string,
    required?: boolean,
}>();
const emit = defineEmits<{
    (e: "update:modelValue", value: string): void,
}>();
const attrs = useAttrs();
const model = ref(props.modelValue);

const handleInput = (value: string) => {
    emit("update:modelValue", value);
};

watch(props, (value) => {
    model.value = value.modelValue;
});
</script>
