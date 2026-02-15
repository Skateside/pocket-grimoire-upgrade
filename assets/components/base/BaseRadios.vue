<template>
    <fieldset>
        <legend>{{ props.label }}</legend>
        <ul>
            <li v-for="(label, id) in props.radios" :key="id">
                <BaseLabel :text="label" :nested="true" layout="sidebar-inverse">
                    <BaseInput v-model="props.modelValue" type="radio" :name="name" />
                </BaseLabel>
            </li>
        </ul>
    </fieldset>
</template>

<script setup lang="ts">
import { computed } from "vue";
import BaseLabel from "./BaseLabel.vue";
import BaseInput from "./BaseInput.vue";

const props = defineProps<{
    label: string,
    radios: Record<string, string>,
    modelValue: string,
}>();

const name = computed(() => props.label.toLowerCase().trim().split(/\s+/).join("-"));
</script>
