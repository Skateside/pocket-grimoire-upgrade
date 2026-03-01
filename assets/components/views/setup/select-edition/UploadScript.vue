<template>
    <BaseForm ref="form" @submit.prevent="handleSubmit">
        <StackLayout>
            <BaseLabel text="Upload a custom script">
                <BaseInput
                    name="upload"
                    type="file"
                    accept="application/json"
                    :required="true"
                />
            </BaseLabel>
            <SidebarLayout>
                <div>
                    <button type="submit">Select</button>
                </div>
                <div>
                    <BaseSpinner v-if="isLoading" />
                </div>
            </SidebarLayout>
        </StackLayout>
        <div aria-live="polite">
            <p v-if="errorMessage">{{ errorMessage }}</p>
        </div>
    </BaseForm>
</template>

<script setup lang="ts">
import { ref, useTemplateRef } from "vue";
import StackLayout from "~/components/layouts/StackLayout.vue";
import SidebarLayout from "~/components/layouts/SidebarLayout.vue";
import BaseForm from "~/components/base/BaseForm.vue";
import BaseLabel from "~/components/base/BaseLabel.vue";
import BaseInput from "~/components/base/BaseInput.vue";
import BaseSpinner from "~/components/base/BaseSpinner.vue";
import useRolesStore from "~/scripts/store/roles";
import { parseScript } from "./helpers";

const emit = defineEmits<{
    (e: "success"): void,
}>();
const rolesStore = useRolesStore();
const form = useTemplateRef("form");
const errorMessage = ref("");
const isLoading = ref(false);

const handleSubmit = () => {

    if (isLoading.value) {
        return; // Already loading, do nothing.
    }

    if (!form.value) {
        errorMessage.value = "Unable to find the form - please reload and try again."; // TODO: i18n
        return;
    }

    const formData = form.value.getData();
    const file = formData.get("upload");

    if (!file) {
        errorMessage.value = "Please upload a script."; // TODO: i18n
        return;
    }

    const reader = new FileReader();

    reader.addEventListener("load", ({ target }) => {

        const { script, error } = parseScript(target!.result as string);

        if (script) {

            rolesStore.setScript(script);
            isLoading.value = false;
            emit("success");
            return;

        }
        
        errorMessage.value = error as string;
        isLoading.value = false;

    });

    isLoading.value = true;
    reader.readAsText(file as File);

};
</script>
