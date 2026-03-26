<template>
    <BaseForm memory="select-edition-clipboard" @submit.prevent="handleSubmit">
        <StackLayout>
            <BaseLabel label="Paste from clipboard">
                <BaseInput
                    name="clipboard"
                    type="textarea"
                    placeholder='["washerwoman","investigator","librarian","chef"]'
                    v-model="model"
                    :required="true"
                />
            </BaseLabel>
            <div>
                <BaseButton type="submit" text="Select" />
            </div>
        </StackLayout>
    </BaseForm>
</template>

<script setup lang="ts">
import type { ISelectEditionEvents } from "~/scripts/types/components";
import StackLayout from "~/components/layouts/StackLayout.vue";
import BaseForm from "~/components/base/BaseForm.vue";
import BaseLabel from "~/components/base/BaseLabel.vue";
import BaseInput from "~/components/base/BaseInput.vue";
import BaseButton from "~/components/base/BaseButton.vue";
import useRolesStore from "~/scripts/stores/roles";
import { parseScript } from "./helpers";

const emit = defineEmits<ISelectEditionEvents>();
const model = defineModel<string>({ default: "" });
const rolesStore = useRolesStore();

const handleSubmit = () => {

    if (!model.value) {
        return emit("error", "Please paste a script."); // TODO: i18n
    }

    const { script, error } = parseScript(model.value);

    if (error) {
        emit("error", error);
    } else if (script && rolesStore.checkImport(script)) {
        emit("success");
    } else if (script) {
        emit("invalid");
    } else {
        emit("error", "Parsing of pasted script failed. Please try again."); // TODO: i18n
    }

};
</script>
