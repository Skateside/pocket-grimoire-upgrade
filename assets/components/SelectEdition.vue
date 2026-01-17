<template>

    <form
        ref="form"
        data-memory="select-edition"
        @submit.prevent="handleSubmit"
    >

        <div aria-live="polite">
            <p v-if="errorMessage">{{ errorMessage }}</p>
        </div>

        <TabsUI memory="edition" @tabmounted="handleTabmounted" @tabchange="handleTabchange">
            <TabUI id="official" title="Official scripts">
                <fieldset>
                    <legend>Official scripts</legend>
                    <ul>
                        <li v-for="(script, id) in store.scripts" :key="id">
                            <label :for="`script-${id}-${suffix}`">
                                <input type="radio" name="script" :value="id" :id="`script-${id}-${suffix}`">
                                {{ store.getScriptMeta(script)?.name }}
                            </label>
                        </li>
                    </ul>
                </fieldset>
            </TabUI>

            <TabUI id="upload" title="Upload a custom script">
                <label :for="`upload-${suffix}`">Upload a custom script</label>
                <input type="file" name="upload" :id="`upload-${suffix}`" accept="application/json">
                <p v-if="isLoading">Please wait ...</p>
            </TabUI>

            <TabUI id="url" title="Enter a URL">
                <label :for="`url-${suffix}`">Enter a URL</label>
                <input type="url" name="url" :id="`script-${suffix}`" class="input" placeholder="https://www.example.com/script.json">
                <p v-if="isLoading">Please wait ...</p>
            </TabUI>

            <TabUI id="clipboard" title="Paste from clipboard">
                <label :for="`paste-${suffix}`">Paste from clipboard</label>
                <textarea name="paste" :id="`paste-${suffix}`" placeholder='["washerwoman","investigator","librarian","chef"]'></textarea>
            </TabUI>
    
            <TabUI id="botc-scripts" title="Search BotC Scripts">
                <fieldset>
                    <legend>Script type</legend>
                    <ul>
                        <li>
                            <label :for="`botc-type-any-${suffix}`">
                                <input type="radio" name="botc-type" value="" :id="`botc-type-any-${suffix}`" checked>
                                Any
                            </label>
                        </li>
                        <li>
                            <label :for="`botc-type-full-${suffix}`">
                                <input type="radio" name="botc-type" value="Full" :id="`botc-type-full-${suffix}`">
                                Full
                            </label>
                        </li>
                        <li>
                            <label :for="`botc-type-teensyville-${suffix}`">
                                <input type="radio" name="botc-type" value="Teensyville" :id="`botc-type-teensyville-${suffix}`">
                                Teensyville
                            </label>
                        </li>
                    </ul>
                </fieldset>
                <p>
<!-- TODO: improve this interface -->
                    <label :for="`script-botc-${suffix}`">Search BotC Scripts</label>
                    <!--
                    <input type="text" name="botc" :id="`script-botc-${suffix}`" :list="`script-botc-list-${suffix}`" v-model="botcLookup">
                    <datalist :id="`script-botc-list-${suffix}`">
                        <option v-for="value in datalist" :key="value">{{ value }}</option>
                    </datalist>
                    -->
                    <div>
                        <input
                            type="text"
                            name="botc"
                            :id="`script-botc-${suffix}`"
                            v-model="botcLookup"
                        >
                        <ul>
                            <template v-if="isLoading">
                                <li>Loading</li>
                            </template>
                            <template v-else-if="datalist.length">
                                <li v-for="value in datalist" :key="value">
                                    <button type="button" @click="botcLookup = value">
                                        {{ value }}
                                    </button>
                                </li>
                            </template>
                            <template v-else-if="botcLookup">
                                <li>No results found for "{{ botcLookup }}"</li>
                            </template>
                        </ul>
                    </div>
                </p>
                <!-- <p v-if="isLoading">Please wait ...</p> -->
            </TabUI>
        </TabsUI>

        <p><button type="submit">Submit</button></p>

    </form>

</template>

<script setup lang="ts">
import type {
    FieldElement,
} from "../scripts/types/lib";
import type {
    IBotcScriptResponse,
    IRoleScriptImport,
} from "../scripts/types/data";
import {
    computed,
    onMounted,
    ref,
    useId,
    useTemplateRef,
    watch,
} from "vue";
import useRoleStore from "../scripts/store/role";
import {
    fetchTimeout,
} from "../scripts/utilities/fetch";
import {
    debounce,
    memoise,
} from "../scripts/utilities/functions";
import {
    type ITabsUIChange,
    type ITabsUIMounted,
    TabsUI,
    TabUI,
} from "./ui/tabs";
import useFieldSaver from "../composables/useFieldSaver";

const emit = defineEmits<{
    (e: "edition-selected"): void,
}>();

const store = useRoleStore();
const suffix = useId();
const form = useTemplateRef("form");
const isLoading = ref<boolean>(false);
const errorMessage = ref<string>("");
const botcScripts = ref<Record<string, IRoleScriptImport>>({});
const botcLookup = defineModel<string>();
const datalist = computed<string[]>(() => Object.keys(botcScripts.value));

const handleTabmounted = ({ tabs, index }: ITabsUIMounted) => {

    tabs.forEach((tab, tabIndex) => {

        if (index === tabIndex) {
            return; // leave current tab's inputs enabled.
        }

        tab
            .querySelectorAll<FieldElement>("input,select,textarea")
            .forEach((input) => input.disabled = true);

    });

};

const handleTabchange = ({ tab, oldTab }: ITabsUIChange) => {

    tab
        ?.querySelectorAll<FieldElement>("input,select,textarea")
        .forEach((input) => input.disabled = false);

    oldTab
        ?.querySelectorAll<FieldElement>("input,select,textarea")
        .forEach((input) => input.disabled = true);

};

const handleSubmit = (event: Event) => {

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

};

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

onMounted(() => useFieldSaver(form, true));
</script>
