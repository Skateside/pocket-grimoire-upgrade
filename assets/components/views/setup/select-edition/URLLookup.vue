<template>
    <BaseForm memory="select-edition-url" @submit.prevent="handleSubmit">
        <StackLayout>
            <BaseLabel text="Upload a custom script">
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
import { ref } from "vue";
import StackLayout from "~/components/layouts/StackLayout.vue";
import SidebarLayout from "~/components/layouts/SidebarLayout.vue";
import BaseForm from "~/components/base/BaseForm.vue";
import BaseLabel from "~/components/base/BaseLabel.vue";
import BaseInput from "~/components/base/BaseInput.vue";
import BaseSpinner from "~/components/base/BaseSpinner.vue";
import usePathsStore from "~/scripts/store/paths";
import useRoleStore from "~/scripts/store/role";
import { isValidURL } from "~/scripts/utilities/strings";
import { performAjax } from "./helpers";

const model = defineModel<string>({ default: "" });
const pathsStore = usePathsStore();
const roleStore = useRoleStore();
const errorMessage = ref("");
const isLoading = ref(false);

const handleSubmit = () => {

    if (isLoading.value) {
        return; // Already loading, do nothing.
    }

    if (!model.value || !isValidURL(model.value)) {
        errorMessage.value = "Please enter a valid URL"; // TODO: i18n
        return;
    }

    isLoading.value = true;

    performAjax(pathsStore.get("apiGetUrl"), {
        url: model.value,
    }).promise.then(
        (value) => roleStore.setScript(value),
        (error) => errorMessage.value = error,
    ).finally(() => isLoading.value = false);

};
</script>
