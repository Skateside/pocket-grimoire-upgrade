<template>

    <form
        @submit.prevent="handleSubmit"
        @toggle.capture="toggleInputStates"
    >

        <div aria-live="assertive">
            <p v-if="errorMessage">{{ errorMessage }}</p>
        </div>

        <details name="select-edition" open>
            <summary>Official scripts</summary>
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
        </details>

        <details name="select-edition">
            <summary>Upload a custom script</summary>
            <div>
                <label :for="`upload-${inputId}`">Upload a custom script</label>
                <input type="file" name="upload" :id="`upload-${inputId}`" accept="application/json" disabled>
                <p v-if="isLoading">Please wait ...</p>
            </div>
        </details>

        <details name="select-edition">
            <summary>Enter a URL</summary>
            <div>
                <label :for="`url-${inputId}`">Enter a URL</label>
                <input type="url" name="url" :id="`script-${inputId}`" class="input" placeholder="https://www.example.com/script.json" disabled>
            </div>
            <p v-if="isLoading">Please wait ...</p>
        </details>

        <details name="select-edition">
            <summary>Paste from clipboard</summary>
            <div>
                <label :for="`paste-${inputId}`">Paste from clipboard</label>
                <textarea name="paste" :id="`paste-${inputId}`" placeholder='["washerwoman","investigator","librarian","chef"]' disabled></textarea>
            </div>
        </details>

        <details name="select-edition">
            <summary>Search BotC Scripts</summary>
            <div>
                <fieldset>
                    <legend>Script type</legend>
                    <ul>
                        <li>
                            <label :for="`botc-type-any-${inputId}`">Any</label>
                            <input type="radio" name="botc-type" value="" :id="`botc-type-any-${inputId}`" checked disabled>
                        </li>
                        <li>
                            <label :for="`botc-type-full-${inputId}`">Full</label>
                            <input type="radio" name="botc-type" value="Full" :id="`botc-type-full-${inputId}`" disabled>
                        </li>
                        <li>
                            <label :for="`botc-type-teensyville-${inputId}`">Teensyville</label>
                            <input type="radio" name="botc-type" value="Teensyville" :id="`botc-type-teensyville-${inputId}`" disabled>
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
            </div>
        </details>

        <p><button type="submit">Submit</button></p>

    </form>

</template>

<script setup lang="ts">
    import type {
        IBotcScriptResponse,
        IRoleScript,
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

    const store = useRoleStore();
    const inputId = useId();
    const isLoading = ref<boolean>(false);
    const errorMessage = ref<string>("");
    const botcScripts = ref<Record<string, IRoleScript>>({});
    const botcLookup = defineModel<string>();
    const datalist = computed<string[]>(() => Object.keys(botcScripts.value));

    const toggleInputStates = (event: ToggleEvent) => {

        const details = (event.target as HTMLDetailsElement);
        const { open } = details;

        details
            .querySelectorAll("input,select,textarea")
            .forEach((input) => (input as HTMLInputElement).disabled = !open);

    };

    const handleSubmit = (event: Event) => {

        if (isLoading.value) {
            return;
        }

        isLoading.value = true;
        
        const data = new FormData((event.target as HTMLFormElement));
        const promises: [string, (_value: any) => Promise<IRoleScript>][] = [
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
            .catch((error) => errorMessage.value = error)
            .then(() => isLoading.value = false);

    };

    const processScriptId = (id: string) => new Promise<IRoleScript>((resolve, reject) => {

        const script = store.getScriptById(id);

        if (script) {
            resolve(script);
        } else {
            reject(`Unrecognised script ID "${id}"`); // TODO: i18n
        }

    });

    const handleScript = (data: string): { script?: IRoleScript, error?: string } => {

        let script = [];

        try {
            script = JSON.parse(data);
        } catch (error) {
            return { error: "Unable to parse script." }  // TODO: i18n
        }

        if (!store.getIsValidScript(script)) {
            return { error: "Script is not valid." }  // TODO: i18n
        }

        return { script };

    };

    const processUploadedScript = (file: File) => new Promise<IRoleScript>((resolve, reject) => {

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

    const processPastedScript = (data: string) => new Promise<IRoleScript>((resolve, reject) => {

        const { script, error } = handleScript(data);

        if (script) {
            resolve(script);
        } else {
            reject(error);
        }

    });

    const handleAjax = <TResponse = IRoleScript>(url: string, data: Record<string, any>): Promise<TResponse> => fetch(url, {
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

    const processBotcScript = (name: string) => new Promise<IRoleScript>((resolve, reject) => {

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
            .then(({ results }) => {
                const { value } = botcScripts;
                Object.keys(value).forEach((key) => delete value[key]);
                results.forEach(({ content, name }) => value[name] = content);
            }, () => {})
            .then(() => isLoading.value = false);

    }, 150));
</script>
