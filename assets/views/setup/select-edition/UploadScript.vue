<template>
    <BaseForm ref="form" @submit.prevent="handleSubmit">
        <StackLayout>
            <BaseLabel label="Upload a custom script">
                <BaseInput
                    name="upload"
                    type="file"
                    accept="application/json"
                    :required="true"
                    v-model="model"
                />
            </BaseLabel>
            <SidebarLayout>
                <div>
                    <BaseButton type="submit" text="Select" />
                </div>
                <div>
                    <BaseSpinner v-if="isLoading" />
                </div>
            </SidebarLayout>
        </StackLayout>
    </BaseForm>
</template>

<script setup lang="ts">
import type { ISelectEditionEvents } from "~/types/components";
import { ref, useTemplateRef } from "vue";
import StackLayout from "~/components/layouts/StackLayout.vue";
import SidebarLayout from "~/components/layouts/SidebarLayout.vue";
import BaseForm from "~/components/base/BaseForm.vue";
import BaseLabel from "~/components/base/BaseLabel.vue";
import BaseInput from "~/components/base/BaseInput.vue";
import BaseSpinner from "~/components/base/BaseSpinner.vue";
import BaseButton from "~/components/base/BaseButton.vue";
import useRolesStore from "~/stores/roles";
import { parseScript } from "./helpers";

const emit = defineEmits<ISelectEditionEvents>();
const rolesStore = useRolesStore();
const form = useTemplateRef("form");
const isLoading = ref(false);
const model = ref("");

const handleSubmit = () => {

    if (isLoading.value) {
        return; // Already loading, do nothing.
    }

    if (!form.value) {

        return emit(
            "error",
            "Unable to find the form - please reload and try again.", // TODO: i18n
        );

    }

    const formData = form.value.getData();
    const file = formData.get("upload");

    if (!file) {
        return emit("error", "Please upload a script"); // TODO: i18n
    }

    const reader = new FileReader();

    reader.addEventListener("load", ({ target }) => {

        const { script, error } = parseScript(target!.result as string);

        if (script && rolesStore.checkImport(script)) {
            emit("success");
        } else if (script) {
            emit("invalid");
        } else {
            emit("error", error ?? "File reading error. Plaese try again."); // TODO: i18n
        }
        
        isLoading.value = false;

    });

    isLoading.value = true;
    reader.readAsText(file as File);

};
</script>
