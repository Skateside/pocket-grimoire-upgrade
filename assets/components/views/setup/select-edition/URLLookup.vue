<template>
    <BaseForm memory="select-edition-url" @submit.prevent="handleSubmit">
        <StackLayout>
            <BaseLabel label="Enter a URL">
                <BaseInput
                    name="url"
                    type="url"
                    placeholder="https://www.example.com/script.json"
                    v-model="model"
                    :required="true"
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
        <div aria-live="polite">
            <p v-if="errorMessage">{{ errorMessage }}</p>
        </div>
    </BaseForm>
</template>

<script setup lang="ts">
import type { ISelectEditionEvents } from "~/scripts/types/components";
import { ref } from "vue";
import StackLayout from "~/components/layouts/StackLayout.vue";
import SidebarLayout from "~/components/layouts/SidebarLayout.vue";
import BaseForm from "~/components/base/BaseForm.vue";
import BaseLabel from "~/components/base/BaseLabel.vue";
import BaseInput from "~/components/base/BaseInput.vue";
import BaseSpinner from "~/components/base/BaseSpinner.vue";
import BaseButton from "~/components/base/BaseButton.vue";
import usePathsStore from "~/scripts/stores/paths";
import useRolesStore from "~/scripts/stores/roles";
import { isValidURL } from "~/scripts/utilities/strings";
import { performAjax } from "./helpers";

const emit = defineEmits<ISelectEditionEvents>();
const model = defineModel<string>({ default: "" });
const pathsStore = usePathsStore();
const rolesStore = useRolesStore();
const errorMessage = ref("");
const isLoading = ref(false);

const handleSubmit = () => {

    if (isLoading.value) {
        return; // Already loading, do nothing.
    }

    if (!model.value || !isValidURL(model.value)) {
        return emit("error", "Please enter a valid URL"); // TODO: i18n
    }

    isLoading.value = true;

    performAjax(pathsStore.get("apiGetUrl"), {
        url: model.value,
    }).promise.then(
        (value) => {
            if (rolesStore.checkImport(value)) {
                emit("success");
            } else {
                emit("invalid");
            }
        },
        (error) => emit("error", error),
    ).finally(() => isLoading.value = false);

};
</script>
