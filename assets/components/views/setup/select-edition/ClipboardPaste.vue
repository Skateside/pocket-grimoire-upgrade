<template>
    <BaseForm memory="select-edition-clipboard" @submit.prevent="handleSubmit">
        <StackLayout>
            <BaseLabel text="Paste from clipboard">
                <BaseInput
                    name="clipboard"
                    type="textarea"
                    placeholder='["washerwoman","investigator","librarian","chef"]'
                    v-model="model"
                    :required="true"
                />
            </BaseLabel>
            <div>
                <button type="submit">Select</button>
            </div>
        </StackLayout>
        <div aria-live="polite">
            <p v-if="errorMessage">{{ errorMessage }}</p>
        </div>
    </BaseForm>
</template>

<script setup lang="ts">
import { ref } from "vue";
import StackLayout from "~/components/layouts/StackLayout.vue";
import BaseForm from "~/components/base/BaseForm.vue";
import BaseLabel from "~/components/base/BaseLabel.vue";
import BaseInput from "~/components/base/BaseInput.vue";
import useRolesStore from "~/scripts/store/roles";
import { parseScript } from "./helpers";

const emit = defineEmits<{
    (e: "success"): void,
}>();
const model = defineModel<string>({ default: "" });
const rolesStore = useRolesStore();
const errorMessage = ref("");

const handleSubmit = () => {

    if (!model.value) {
        errorMessage.value = "Please paste a script"; // TODO: i18n
    }

    const { script, error } = parseScript(model.value);

    if (script) {
        rolesStore.setScript(script);
        emit("success");
    }

    errorMessage.value = error as string;
    
};
</script>
