<template>
    <fieldset>
        <legend>Names</legend>
        <ol>
            <li v-for="(number, index) in props.count" :key="number">
                <BaseLabel :label="`Name player ${number}`">
                    <BaseInput
                        v-model="names[index]"
                        :name="`name[${index}]`"
                        @input="updateNames"
                    />
                </BaseLabel>
            </li>
        </ol>
    </fieldset>
</template>

<script setup lang="ts">
import { reactive } from "vue";
import BaseLabel from "~/components/base/BaseLabel.vue";
import BaseInput from "~/components/base/BaseInput.vue";

const props = defineProps<{
    count: number,
    modelValue: string[],
}>();
const emit = defineEmits<{
    (e: "update:modelValue", value: string[]): void,
}>();
const names = reactive<string[]>(new Array(props.count).fill(""));

const updateNames = () => {
    emit("update:modelValue", names);
};
</script>
