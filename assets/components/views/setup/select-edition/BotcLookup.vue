<template>
    <BaseForm memory="select-edition-botc-lookup" @submit.prevent="handleSubmit">
        <StackLayout>
            <BaseChoice
                name="botc-type"
                label="Script type"
                v-model="scriptType"
                empty-text="Any"
                :open="true"
                :choices="[
                    { text: 'Full', value: 'Full' },
                    { text: 'Teensyville', value: 'Teensyville' },
                ]"
            />
            <BaseLabel label="Search BotC Scripts">
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
import type { AnyFunction } from "~/scripts/types/lib";
import type { IBotcScriptResponse } from "~/scripts/types/data";
import type { ISelectEditionEvents } from "~/scripts/types/components";
import { ref } from "vue";
import SidebarLayout from "~/components/layouts/SidebarLayout.vue";
import StackLayout from "~/components/layouts/StackLayout.vue";
import BaseForm from "~/components/base/BaseForm.vue";
import BaseLabel from "~/components/base/BaseLabel.vue";
import BaseInput from "~/components/base/BaseInput.vue";
import BaseChoice from "~/components/base/BaseChoice.vue";
import BaseSpinner from "~/components/base/BaseSpinner.vue";
import BaseButton from "~/components/base/BaseButton.vue";
import usePathsStore from "~/scripts/stores/paths";
import useRolesStore from "~/scripts/stores/roles";
import { performAjax } from "./helpers";
import { debounce, noop } from "~/scripts/utilities/functions";

const emit = defineEmits<ISelectEditionEvents>();
const scriptType = defineModel<string>("script-type", { default: "" });
const term = defineModel<string>("term", { default: "" });
const pathsStore = usePathsStore();
const rolesStore = useRolesStore();
const previousTerm = ref("");
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

        isLoading.value = false;
        scripts.value = botcScripts;

    }).catch((error) => emit("error", error));

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
        emit(
            "error",
            "Unable to find script, please try a different one or lookup a different term.", // TODO: i18n
        );
    } else if (rolesStore.checkImport(botcScript.script)) {
        emit("success");
    } else {
        emit("invalid");
    }

};
</script>
