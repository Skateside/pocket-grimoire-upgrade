<template>
    <BaseForm memory="select-edition-official" @submit.prevent="handleSubmit">
        <StackLayout>
            <BaseRadios
                name="official"
                label="Official scripts"
                v-model="model"
                :radios="officialScripts"
                :required="true"
            />
            <p>
                <button type="submit">Select</button>
            </p>
        </StackLayout>
        <div aria-live="polite">
            <p v-if="errorMessage">{{ errorMessage }}</p>
        </div>
    </BaseForm>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import StackLayout from "~/components/layouts/StackLayout.vue";
import BaseForm from "~/components/base/BaseForm.vue";
import BaseRadios from "~/components/base/BaseRadios.vue";
import { mapObject } from "~/scripts/utilities/objects";
import useRoleStore from "~/scripts/store/role";

const model = defineModel<string>({ default: "" });
const roleStore = useRoleStore();
const errorMessage = ref("");
const officialScripts = computed(() => mapObject(roleStore.scripts, ([id, script]) => [
    id,
    roleStore.getScriptMeta(script)?.name ?? id,
]));

const handleSubmit = () => {

    const script = roleStore.getScriptById(model.value);

    if (script) {
        return roleStore.setScript(script);
    }
     
    errorMessage.value = `Unrecognised script ID "${model.value}"`; // TODO: i18n

};
</script>
