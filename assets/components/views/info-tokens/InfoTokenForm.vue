<template>
    <BaseForm @submit.prevent="handleSubmit">
        <StackLayout>
            <h2 v-if="props.heading">{{ props.heading }}</h2>
            <BaseLabel label="Info token text">
                <BaseInput v-model="text" name="text" required />
            </BaseLabel>
            <div>
                <BaseButton type="submit">{{ props.button }}</BaseButton>
            </div>
        </StackLayout>
    </BaseForm>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import BaseForm from "~/components/base/BaseForm.vue";
import BaseLabel from "~/components/base/BaseLabel.vue";
import BaseInput from "~/components/base/BaseInput.vue";
import BaseButton from "~/components/base/BaseButton.vue";
import StackLayout from "~/components/layouts/StackLayout.vue";

const emit = defineEmits<{
    (e: "text-change", text: string): void,
}>();
const props = defineProps<{
    heading?: string,
    button: string,
    value?: string,
}>();
const text = defineModel<string>({ default: "" });

const handleSubmit = () => {
    emit("text-change", text.value);
    text.value = "";
};

onMounted(() => {
    if (props.value) {
        text.value = props.value;
    }
});
</script>
