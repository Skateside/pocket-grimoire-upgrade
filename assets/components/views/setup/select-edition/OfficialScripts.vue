<template>
    <BaseForm memory="select-edition-official" @submit.prevent="handleSubmit">
        <StackLayout>
            <BaseChoice
                name="official"
                label="Official scripts"
                v-model="model"
                :required="true"
                :open="true"
                :choices="officialScripts"
            />
            <p>
                <BaseButton type="submit" text="Select" />
            </p>
        </StackLayout>
        <div aria-live="polite">
            <p v-if="errorMessage">{{ errorMessage }}</p>
        </div>
    </BaseForm>
</template>

<script setup lang="ts">
import type { ISelectEditionEvents } from "~/scripts/types/components";
import { computed, ref } from "vue";
import StackLayout from "~/components/layouts/StackLayout.vue";
import BaseForm from "~/components/base/BaseForm.vue";
import BaseChoice from "~/components/base/BaseChoice.vue";
import BaseButton from "~/components/base/BaseButton.vue";
import useRolesStore from "~/scripts/stores/roles";

const emit = defineEmits<ISelectEditionEvents>();
const model = defineModel<string>({ default: "" });
const rolesStore = useRolesStore();
const errorMessage = ref("");
const officialScripts = computed(() => {

    return Object.entries(rolesStore.scripts).map(([id, script]) => {

        return {
            value: id,
            text: rolesStore.getScriptMeta(script)?.name ?? id,
        };

    });

});

const handleSubmit = () => {

    const script = rolesStore.getScriptById(model.value);

    if (script && rolesStore.checkImport(script)) {
        emit("success");
    } else if (script) {
        emit("invalid");
    } else {
        emit("error", `Unrecognised script ID "${model.value}"`); // TODO: i18n
    }

};
</script>
