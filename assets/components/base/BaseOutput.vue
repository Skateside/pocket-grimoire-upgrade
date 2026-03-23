<template>
    <output :value="props.value" :for="id"></output>
</template>

<script setup lang="ts">
import useLabel from '~/composables/useLabel';

const props = defineProps<{
    value: string,
}>();
const { id } = useLabel();
</script>
