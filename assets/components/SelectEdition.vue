<template>

    <form
        @submit.prevent="handleSubmit"
    >

        <div aria-live="polite">
            <p v-if="errorMessage">{{ errorMessage }}</p>
        </div>

        <TabsUI @tabchange="handleTabchange">
            <TabUI title="Official scripts">
                <fieldset>
                    <legend>Official scripts</legend>
                    <ul>
                        <li v-for="(script, id) in store.scripts" :key="id">
                            <label :for="`script-${id}-${inputId}`">
                                <input type="radio" name="script" :value="id" :id="`script-${id}-${inputId}`">
                                {{ store.getScriptMeta(script)?.name }}
                            </label>
                        </li>
                    </ul>
                </fieldset>
            </TabUI>

            <TabUI title="Upload a custom script">
                <label :for="`upload-${inputId}`">Upload a custom script</label>
                <input type="file" name="upload" :id="`upload-${inputId}`" accept="application/json" disabled>
                <p v-if="isLoading">Please wait ...</p>
            </TabUI>

            <TabUI title="Enter a URL">
                <label :for="`url-${inputId}`">Enter a URL</label>
                <input type="url" name="url" :id="`script-${inputId}`" class="input" placeholder="https://www.example.com/script.json" disabled>
                <p v-if="isLoading">Please wait ...</p>
            </TabUI>

            <TabUI title="Paste from clipboard">
                <label :for="`paste-${inputId}`">Paste from clipboard</label>
                <textarea name="paste" :id="`paste-${inputId}`" placeholder='["washerwoman","investigator","librarian","chef"]' disabled></textarea>
            </TabUI>
    
            <TabUI title="Search BotC Scripts">
                <fieldset>
                    <legend>Script type</legend>
                    <ul>
                        <li>
                            <label :for="`botc-type-any-${inputId}`">
                                <input type="radio" name="botc-type" value="" :id="`botc-type-any-${inputId}`" checked disabled>
                                Any
                            </label>
                        </li>
                        <li>
                            <label :for="`botc-type-full-${inputId}`">
                                <input type="radio" name="botc-type" value="Full" :id="`botc-type-full-${inputId}`" disabled>
                                Full
                            </label>
                        </li>
                        <li>
                            <label :for="`botc-type-teensyville-${inputId}`">
                                <input type="radio" name="botc-type" value="Teensyville" :id="`botc-type-teensyville-${inputId}`" disabled>
                                Teensyville
                            </label>
                        </li>
                    </ul>
                </fieldset>
                <p>
                    <label for="script-botc">Search BotC Scripts</label>
                    <input type="text" name="botc" id="script-botc" list="script-botc-list" v-model="botcLookup" disabled>
                    <datalist id="script-botc-list">
                        <option v-for="value in datalist" :key="value">{{ value }}</option>
                    </datalist>
                </p>
                <p v-if="isLoading">Please wait ...</p>
            </TabUI>
        </TabsUI>

        <p><button type="submit">Submit</button></p>

    </form>

</template>

<script setup lang="ts">
    import type {
        IBotcScriptResponse,
        IRoleScriptImport,
    } from "../scripts/types/data";
    import {
        computed,
        ref,
        useId,
        watch,
    } from "vue";
    import useRoleStore from "../scripts/store/role";
    import {
        debounce,
        memoise,
    } from "../scripts/utilities/functions";
    import {
        type ITabsUIChange,
        TabsUI,
        TabUI,
    } from "./ui/tabs";

    const store = useRoleStore();
    const inputId = useId();
    const isLoading = ref<boolean>(false);
    const errorMessage = ref<string>("");
    const botcScripts = ref<Record<string, IRoleScriptImport>>({});
    const botcLookup = defineModel<string>();
    const datalist = computed<string[]>(() => Object.keys(botcScripts.value));

    const handleTabchange = ({ tab, oldTab }: ITabsUIChange) => {

        tab
            ?.querySelectorAll<HTMLInputElement>("input,select,textarea")
            .forEach((input) => input.disabled = false);

        oldTab
            ?.querySelectorAll<HTMLInputElement>("input,select,textarea")
            .forEach((input) => input.disabled = true);

    };

    const handleSubmit = (event: Event) => {

        if (isLoading.value) {
            return;
        }

        isLoading.value = true;
        
        const data = new FormData((event.target as HTMLFormElement));
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
            .then((script) => store.setScript(script))
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

    const handleAjax = <TResponse = IRoleScriptImport>(url: string, data: Record<string, any>): Promise<TResponse> => fetch(url, {
            method: "POST",
            body: JSON.stringify(data),
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
            return;
        }

        const type = document
            .querySelector<HTMLInputElement>(`[name="botc-type"]:checked`)
            ?.value || "";

        getBotcScripts(value, type)
            .then((results) => {
                const { value } = botcScripts;
                Object.keys(value).forEach((key) => delete value[key]);
                Object.entries(results).forEach(([name, script]) => value[name] = script);
            }, () => {})
            .then(() => isLoading.value = false);

    }, 150));
</script>
