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
                    <input type="text" name="botc" id="script-botc" list="script-botc-list" disabled>
                    <datalist id="script-botc-list">
                        <option v-for="(value, key) in datalist" :value="key" :key="key">{{ value }}</option>
                    </datalist>
                </p>
            </div>
        </details>

        <p><button type="submit">Submit</button></p>

    </form>

</template>

<script setup lang="ts">
    import type { IRoleScript } from "../scripts/types/data";
    import { computed, ref, useId } from "vue";
    import useRoleStore from "../scripts/store/role";

    const store = useRoleStore();
    const inputId = useId();
    const isLoading = ref<boolean>(false);
    const errorMessage = ref<string>("");
    const botcScripts = ref<Record<string, { name: string, script: IRoleScript }>>({});
    const datalist = computed<Record<string, string>>(() => {
        return Object.fromEntries(
            Object
                .entries(botcScripts.value)
                .map(([id, { name }]) => [id, name])
        );
    });

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

    /*
    const processBotcScript = (term: string) => handleAjax("/get-url", {
        term,
        type: document
            .querySelector<HTMLInputElement>(`[name="botc-type"]:checked`)
            ?.value || "",
    });
    */
    // TODO: Make this happen on keyup so that selecting the name gets the script.
    const processBotcScript = (term: string) => new Promise<IRoleScript>((resolve, reject) => {
        handleAjax<IBotcScriptResponse>("/get-botc", {
            term,
            type: document
                .querySelector<HTMLInputElement>(`[name="botc-type"]:checked`)
                ?.value || "",
        })
        .then((body) => {
            console.log({ body, resolve });

            Object.keys(botcScripts.value).forEach((key) => delete botcScripts.value[key]);
            body.results.forEach(({ content, name, pk }) => {
                botcScripts.value[pk] = { name, script: content };
            });

        })
        .catch(reject);
    });

    type IBotcScriptResponse = {
        count: number,
        next: string | null,
        previous: string | null,
        results: {
            author: string,
            content: IRoleScript,
            name: string,
            pk: number,
            score: number,
            version: string,
        }[],
    };

</script>
