<template>

    <BaseForm memory="select-edition" @submit.prevent="handleSubmit">

        <div aria-live="polite">
            <p v-if="errorMessage">{{ errorMessage }}</p>
        </div>

        <TabsUI memory="edition" @tab-mounted="handleTabMounted" @tab-change="handleTabChange">
            <TabUI name="official" title="Official scripts">
                <BaseRadios
                    label="Official scripts"
                    v-model="model.official"
                    :radios="officialScripts"
                />
            </TabUI>

            <TabUI name="upload" title="Upload a custom script">
                <BaseLabel text="Upload a custom script">
                    <BaseInput
                        type="file"
                        accept="application/json"
                        v-model="model.upload"
                    />
                </BaseLabel>
                <p v-if="isLoading">Please wait ...</p>
            </TabUI>

            <TabUI name="url" title="Enter a URL">
                <BaseLabel text="Enter a URL">
                    <BaseInput
                        type="url"
                        placeholder="https://www.example.com/script.json"
                        v-model="model.url"
                    />
                </BaseLabel>
                <p v-if="isLoading">Please wait ...</p>
            </TabUI>

            <TabUI name="clipboard" title="Paste from clipboard">
                <BaseLabel text="Paste from clipboard">
                    <BaseInput
                        type="textarea"
                        placeholder='["washerwoman","investigator","librarian","chef"]'
                        v-model="model.clipboard"
                    />
                </BaseLabel>
            </TabUI>
    
            <TabUI name="botc-scripts" title="Search BotC Scripts">
                <BaseRadios
                    label="Script type"
                    v-model="model.scriptsType"
                    :radios="{
                        '': 'Any',
                        'Full': 'Full',
                        'Teensyville': 'Teensyville',
                    }"
                />
                <BaseLabel text="Search BotC Scripts">
                    <BaseInput
                        type="text"
                        v-model="model.botcLookup"
                    />
                </BaseLabel>
                
            </TabUI>
        </TabsUI>

        <p><button type="submit">Submit</button></p>
        <p><code>tabId = "{{ tabId }}"</code></p>
        <p><code>model = "{{ model }}"</code></p>

    </BaseForm>

</template>

<script setup lang="ts">
// import type {
//     // IBotcScriptResponse,
//     IRoleScriptImport,
// } from "~/scripts/types/data";
import {
    computed,
    // onMounted,
    reactive,
    ref,
    // useId,
    // useTemplateRef,
    // watch,
} from "vue";
import useRoleStore from "~/scripts/store/role";
// import {
//     fetchTimeout,
// } from "~/scripts/utilities/fetch";
// import {
//     debounce,
//     memoise,
// } from "~/scripts/utilities/functions";
import { mapObject } from "~/scripts/utilities/objects";
import {
    type ITabsUIChange,
    type ITabsUIMounted,
    TabsUI,
    TabUI,
} from "~/components/ui/tabs";
// import useFieldSaver from "~/composables/useFieldSaver";
import BaseRadios from "~/components/base/BaseRadios.vue";
import BaseLabel from "~/components/base/BaseLabel.vue";
import BaseInput from "~/components/base/BaseInput.vue";
import BaseForm from "~/components/base/BaseForm.vue";

const emit = defineEmits<{
    (e: "edition-selected"): void,
}>();

const store = useRoleStore();

const officialScripts = computed(() => mapObject(store.scripts, ([id, script]) => [
    id,
    store.getScriptMeta(script)?.name ?? id,
]));

const model = reactive({
    official: "",
    upload: "",
    url: "",
    clipboard: "",
    scriptsType: "",
    botcLookup: "",
});


// const form = useTemplateRef("form");
const isLoading = ref(false);
const errorMessage = ref("");

const tabId = ref("official");

const setTabId = (tab: HTMLElement | null) => {

    const tabName = tab?.dataset.tabName;

    if (!tabName) {
        return console.warn("can't identify the tab");
    }

    tabId.value = tab.dataset.tabName!;

};

const handleTabMounted = ({ tabs, index }: ITabsUIMounted) => setTabId(tabs[index]);
const handleTabChange = ({ tab }: ITabsUIChange) => setTabId(tab);

const handleSubmit = (event: Event) => {
    console.log({ event });

    /*
    if (isLoading.value) {
        return; // can't submit, still loading.
    }

    isLoading.value = true;
    
    const data = new FormData(event.target as HTMLFormElement);
    const promises: [string, (_value: any) => Promise<IRoleScriptImport>][] = [
        ["", () => Promise.reject("Empty form")], // TODO: i18n
        ["script", processScriptId],
        ["upload", processUploadedScript],
        ["url", processURLScript],
        ["paste", processPastedScript],
        ["botc", processBotcScript],
    ];
    const [
        name,
        promiseMaker,
    ] = promises.find(([name]) => data.has(name)) || promises[0];

    promiseMaker(data.get(name))
        .then((script) => {
            store.setScript(script);
            emit("edition-selected");
        })
        .catch((error) => {
            console.error(error);
            errorMessage.value = error;
        })
        .then(() => isLoading.value = false);
    */

};
/*
const processScriptId = (id: string) => new Promise<IRoleScriptImport>((resolve, reject) => {

    const script = store.getScriptById(id);

    if (script) {
        resolve(script);
    } else {
        reject(`Unrecognised script ID "${id}"`); // TODO: i18n
    }

});

const handleScript = (data: string): { script?: IRoleScriptImport, error?: string } => {

    let script = [];

    try {
        script = JSON.parse(data);
    } catch (error) {
        return { error: "Unable to parse script." }  // TODO: i18n
    }

    if (!store.getIsValidImport(script)) {
        return { error: "Script is not valid." }  // TODO: i18n
    }

    return { script };

};

const processUploadedScript = (file: File) => new Promise<IRoleScriptImport>((resolve, reject) => {

    const reader = new FileReader();

    reader.addEventListener("load", ({ target }) => {

        const { script, error } = handleScript(target!.result as string);

        if (script) {
            resolve(script);
        } else {
            reject(error);
        }

    });

    reader.readAsText(file);

});

const processPastedScript = (data: string) => new Promise<IRoleScriptImport>((resolve, reject) => {

    const { script, error } = handleScript(data);

    if (script) {
        resolve(script);
    } else {
        reject(error);
    }

});

const handleAjax = <TResponse = IRoleScriptImport>(url: string, data: Record<string, any>): Promise<TResponse> => fetchTimeout(url, {
        method: "POST",
        body: JSON.stringify(data),
        timeout: 10000,
    })
    .then((response) => response.json())
    .then(({ success, body }) => {
        if (success) {
            return body;
        }
        throw body;
    });

const processURLScript = (url: string) => handleAjax("/get-url", { url });

const processBotcScript = (name: string) => new Promise<IRoleScriptImport>((resolve, reject) => {

    if (!Object.hasOwn(botcScripts.value, name)) {
        return reject(`Unrecognised script "${name}"`); // TODO: i18n
    }

    resolve(botcScripts.value[name]);

});

const getBotcScripts = memoise(
    (term: string, type: string) => handleAjax<IBotcScriptResponse>("/get-botc", {
        term,
        type,
    }),
    (term, type) => `${term}|${type}`,
);

watch(botcLookup, () => isLoading.value = true);
watch(botcLookup, debounce((value) => {

    if (!value?.trim()) {
        isLoading.value = false;
        return; // nothing to look up.
    }

    const type = document
        .querySelector<HTMLInputElement>(`[name="botc-type"][id$="-${suffix}"]:checked`)
        ?.value || "";

    getBotcScripts(value, type)
        .then((results) => {
            const { value } = botcScripts;
            Object.keys(value).forEach((key) => delete value[key]);
            Object.entries(results).forEach(([name, script]) => value[name] = script);
        }, () => {})
        .then(() => isLoading.value = false);

}, 150));
*/

// onMounted(() => useFieldSaver(form, true));
</script>
