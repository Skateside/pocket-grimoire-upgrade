<template>

    <BaseForm ref="form" memory="select-edition" @submit.prevent="handleSubmit">

        <div aria-live="polite">
            <p v-if="errorMessage">{{ errorMessage }}</p>
        </div>

        <TabsUI
            memory="select-edition"
            @tab-mounted="handleTabMounted"
            @tab-change="handleTabChange"
        >
            <TabUI name="official" title="Official scripts">
                <BaseRadios
                    name="official"
                    label="Official scripts"
                    v-model="model.official"
                    :radios="officialScripts"
                />
            </TabUI>

            <TabUI name="upload" title="Upload a custom script">
                <BaseLabel text="Upload a custom script">
                    <BaseInput
                        name="upload"
                        type="file"
                        accept="application/json"
                        v-model="model.upload"
                    />
                </BaseLabel>
            </TabUI>

            <TabUI name="url" title="Enter a URL">
                <BaseLabel text="Enter a URL">
                    <BaseInput
                        name="url"
                        type="url"
                        placeholder="https://www.example.com/script.json"
                        v-model="model.url"
                    />
                </BaseLabel>
            </TabUI>

            <TabUI name="clipboard" title="Paste from clipboard">
                <BaseLabel text="Paste from clipboard">
                    <BaseInput
                        name="clipboard"
                        type="textarea"
                        placeholder='["washerwoman","investigator","librarian","chef"]'
                        v-model="model.clipboard"
                    />
                </BaseLabel>
            </TabUI>
    
            <TabUI name="botc-scripts" title="Search BotC Scripts">
                <BaseRadios
                    name="botc-type"
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
                        name="botc-scripts"
                        type="text"
                        v-model="model.botcLookup"
                        @input="handleBotcInput"
                    />
                </BaseLabel>

                <div aria-live="polite">
                    <p v-if="botcScriptsLoading">Loading</p>
                    <ul v-else-if="botcScripts.length">
                        <li v-for="{ id, name, author, version, type } in botcScripts">
                            <button type="button" @click="() => handleBotcClick(id)">
                                <strong>{{ name }}</strong> by {{ author }}
                                <small>{{ type }} v{{ version }}</small>
                            </button>
                        </li>
                    </ul>
                </div>
            </TabUI>
        </TabsUI>

        <SidebarLayout>
            <div>
                <button type="submit">Submit</button>
            </div>
            <div v-if="isSuccess">
                Success
            </div>
        </SidebarLayout>

        <div v-if="isLoading">
            Loading
        </div>

    </BaseForm>

</template>

<script setup lang="ts">
import type {
    IBotcScriptResponse,
    IRoleScriptImport,
} from "~/scripts/types/data";
import type {
    IBaseFormExpose,
} from "~/scripts/types/base";
import type { AnyFunction } from "~/scripts/types/lib";
import { computed, reactive, ref, useTemplateRef } from "vue";
import usePathsStore from "~/scripts/store/paths";
import useRoleStore from "~/scripts/store/role";
import { abortableFetch } from "~/scripts/utilities/fetch";
import {
    debounce,
    noop,
} from "~/scripts/utilities/functions";
import { mapObject } from "~/scripts/utilities/objects";
import { isValidURL } from "~/scripts/utilities/strings";
import {
    type ITabsUIChange,
    type ITabsUIMounted,
    TabsUI,
    TabUI,
} from "~/components/ui/tabs";
import BaseRadios from "~/components/base/BaseRadios.vue";
import BaseLabel from "~/components/base/BaseLabel.vue";
import BaseInput from "~/components/base/BaseInput.vue";
import BaseForm from "~/components/base/BaseForm.vue";
import SidebarLayout from "~/components/layouts/SidebarLayout.vue";

const pathsStore = usePathsStore();
const roleStore = useRoleStore();
const formInterface = useTemplateRef<IBaseFormExpose>("form");
const model = reactive({
    official: "",
    upload: "",
    url: "",
    clipboard: "",
    scriptsType: "",
    botcLookup: "",
});
const errorMessage = ref("");
const isLoading = ref(false);
const isSuccess = ref(false);
const tabId = ref("official");
const officialScripts = computed(() => mapObject(roleStore.scripts, ([id, script]) => [
    id,
    roleStore.getScriptMeta(script)?.name ?? id,
]));
const abortPrevious = ref<AnyFunction>(noop);
const botcScriptsLoading = ref(false);
const botcScripts = ref<IBotcScriptResponse[]>([]);
const UNRECOGNISED_TAB_ID = Symbol("unrecognised-tab-id");

const setTabId = (tab: HTMLElement | null) => {

    const tabName = tab?.dataset.tabName;

    if (!tabName) {
        return console.warn("can't identify the tab");
    }

    tabId.value = tab.dataset.tabName!;

};

const parseScript = (data: string): { script?: IRoleScriptImport, error?: string } => {

    let script = [];

    try {
        script = JSON.parse(data);
    } catch (error) {
        return { error: "Unable to parse script." }; // TODO: i18n
    }

    if (!roleStore.getIsValidImport(script)) {
        return { error: "Script is not valid." }; // TODO: i18n
    }

    return { script };

};

const performAjax = <TResponse = IRoleScriptImport>(
    url: string,
    data: Record<string, any>,
) => {

    const { abort, promise } = abortableFetch(url, {
        method: "POST",
        body: JSON.stringify(data),
        timeout: 10_000,
    });
    const then = promise
        .then((response) => response.json())
        .then(({ success, body }) => {
            if (success) {
                return body as TResponse;
            }
            throw body;
        });
    
    return {
        abort,
        promise: then,
    };

};

const lookupBotcScript = () => {

    abortPrevious.value("Replaced with new lookup");

    // Don't look anything up if there's nothing to look up or the user is
    // looking at a different tab - useFieldSaver() might have re-populated the
    // lookup but we might not need to look anything up.
    if (!model.botcLookup || tabId.value !== "botc-scripts") {
        return; // Don't do a lookup.
    }

    const data: { term: string, type?: string } = {
        term: model.botcLookup,
    };

    if (model.scriptsType) {
        data.type = model.scriptsType;
    }

    const { abort, promise } = performAjax<IBotcScriptResponse[]>(
        pathsStore.get("apiGetBotc"),
        data,
    );
    abortPrevious.value = abort;
    botcScriptsLoading.value = true;
    botcScripts.value = [];

    promise.then((scripts) => {
        botcScriptsLoading.value = false;
        botcScripts.value = scripts;
    });

};

const processOfficial = () => new Promise<IRoleScriptImport>((resolve, reject) => {

    if (!model.official) {
        return reject("Please select a script");
    }

    const script = roleStore.getScriptById(model.official);

    if (script) {
        return resolve(script);
    }
     
    reject(`Unrecognised script ID "${model.official}"`); // TODO: i18n

});

const processUpload = () => new Promise<IRoleScriptImport>((resolve, reject) => {

    if (!formInterface.value) {
        return reject("Unable to detect form. Please reload and try again."); // TODO: i18n
    }

    const formData = formInterface.value.getData();
    const file = formData.get("upload");

    if (!model.upload || !file) {
        return reject("Please upload a script"); // TODO: i18n
    }

    const reader = new FileReader();

    reader.addEventListener("load", ({ target }) => {

        const { script, error } = parseScript(target!.result as string);

        if (script) {
            return resolve(script);
        }
        
        reject(error);

    });

    reader.readAsText(file as File);

});

const processURL = () => new Promise<IRoleScriptImport>((resolve, reject) => {

    if (!model.url || !isValidURL(model.url)) {
        return reject("Please enter a valid URL"); // TODO: i18n
    }

    performAjax(pathsStore.get("apiGetUrl"), {
        url: model.url,
    }).promise.then((value) => resolve(value), (error) => reject(error));

});

const processClipboard = () => new Promise<IRoleScriptImport>((resolve, reject) => {

    if (!model.clipboard) {
        reject("Please paste a script"); // TODO: i18n
    }

    const { script, error } = parseScript(model.clipboard);

    if (script) {
        return resolve(script);
    }

    reject(error);

});

const processBotcScripts = (event: Event) => new Promise<IRoleScriptImport>((resolve) => {

    event?.preventDefault();
    lookupBotcScript();
    resolve([]);

});

const processes: Record<string | symbol, (event: Event) => Promise<IRoleScriptImport>> = {
    [UNRECOGNISED_TAB_ID]: () => Promise.reject("The tab wasn't recognised. Please try again."), // TODO: i18n
    "official": processOfficial,
    "upload": processUpload,
    "url": processURL,
    "clipboard": processClipboard,
    "botc-scripts": processBotcScripts,
};

const handleSubmit = (event: Event) => {

    if (isLoading.value) {
        return; // Can't submit, form still loading
    }

    const process = processes[tabId.value] || processes[UNRECOGNISED_TAB_ID];

    isLoading.value = true;

    process(event)
        .then((scriptImport) => {

            if (!scriptImport.length) {
                return; // No script, but this might be intentional (BotC Scripts).
            }

            roleStore.setScript(scriptImport);
            isSuccess.value = true;
            window.setTimeout(() => isSuccess.value = false, 5000);

        })
        .catch((error) => {
            errorMessage.value = error;
        })
        .finally(() => {
            isLoading.value = false;
        });

};

const handleBotcInput = debounce(lookupBotcScript, 150);

const handleBotcClick = (id: number) => {

    const botcScript = botcScripts.value.find(({ id: scriptId }) => scriptId === id);

    if (!botcScript) {
        errorMessage.value = "Unable to find script, please try again."; // TODO: i18n
        return;
    }

    roleStore.setScript(botcScript.script);
    isSuccess.value = true;
    window.setTimeout(() => isSuccess.value = false, 5000);

};

const handleTabMounted = ({ tabs, index }: ITabsUIMounted) => setTabId(tabs[index]);
const handleTabChange = ({ tab }: ITabsUIChange) => setTabId(tab);
</script>
