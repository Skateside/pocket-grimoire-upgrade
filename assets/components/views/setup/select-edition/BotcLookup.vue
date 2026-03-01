<template>
    <BaseForm memory="select-edition-botc-lookup" @submit.prevent="handleSubmit">
        <StackLayout>
            <BaseRadios
                name="botc-type"
                label="Script type"
                v-model="scriptType"
                :radios="{
                    '': 'Any',
                    'Full': 'Full',
                    'Teensyville': 'Teensyville',
                }"
            />
            <BaseLabel text="Search BotC Scripts">
                <BaseInput
                    name="botc-scripts"
                    type="text"
                    v-model="term"
                    @input="handleInput"
                    :required="true"
                />
            </BaseLabel>
            <div aria-live="polite">
                <ul v-if="scripts.length">
                    <li v-for="{ id, name, author, version, type } in scripts">
                        <button type="button" @click="() => handleClick(id)">
                            <strong>{{ name }}</strong> by {{ author }}
                            <small>{{ type }} v{{ version }}</small>
                        </button>
                    </li>
                </ul>
            </div>
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
import type { AnyFunction } from "~/scripts/types/lib";
import type { IBotcScriptResponse } from "~/scripts/types/data";
import { ref } from "vue";
import SidebarLayout from "~/components/layouts/SidebarLayout.vue";
import StackLayout from "~/components/layouts/StackLayout.vue";
import BaseForm from "~/components/base/BaseForm.vue";
import BaseLabel from "~/components/base/BaseLabel.vue";
import BaseInput from "~/components/base/BaseInput.vue";
import BaseRadios from "~/components/base/BaseRadios.vue";
import BaseSpinner from "~/components/base/BaseSpinner.vue";
import usePathsStore from "~/scripts/store/paths";
import useRolesStore from "~/scripts/store/roles";
import { performAjax } from "./helpers";
import { debounce, noop } from "~/scripts/utilities/functions";

const emit = defineEmits<{
    (e: "success"): void,
}>();
const scriptType = defineModel<string>("script-type", { default: "" });
const term = defineModel<string>("term", { default: "" });
const pathsStore = usePathsStore();
const rolesStore = useRolesStore();
const previousTerm = ref("");
const errorMessage = ref("");
const isLoading = ref(false);
const scripts = ref<IBotcScriptResponse[]>([]);
const abortPrevious = ref<AnyFunction>(noop);

const lookupScript = () => {

    abortPrevious.value("Replaced with new lookup");

    const currentTerm = `${scriptType.value}|${term.value}`;

    if (!term.value || previousTerm.value === currentTerm) {
        return; // No term or no change, nothing to lookup.
    }

    const data: { term: string, type?: string } = {
        term: term.value,
    };

    if (scriptType.value) {
        data.type = scriptType.value;
    }

    previousTerm.value = currentTerm;

    const { abort, promise } = performAjax<IBotcScriptResponse[]>(
        pathsStore.get("apiGetBotc"),
        data,
    );
    abortPrevious.value = abort;
    isLoading.value = true;
    scripts.value = [];

    promise.then((botcScripts) => {

        errorMessage.value = "";
        isLoading.value = false;
        scripts.value = botcScripts;

    }).catch((error) => errorMessage.value = error);

};

const handleSubmit = () => {

    if (isLoading.value) {
        return; // Already loading, do nothing.
    }

    lookupScript();

};


const handleInput = debounce(lookupScript, 150);

const handleClick = (id: number) => {

    const botcScript = scripts.value.find(({ id: scriptId }) => scriptId === id);

    if (!botcScript) {
        errorMessage.value = "Unable to find script, please try a different one or lookup a different term."; // TODO: i18n
        return;
    }

    rolesStore.setScript(botcScript.script);
    emit("success");

};
</script>
