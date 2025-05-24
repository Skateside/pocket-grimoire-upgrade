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
                    <input type="text" name="botc" id="script-botc" disabled>
                </p>
            </div>
        </details>

        <p><button type="submit">Submit</button></p>

    </form>

</template>

<script setup lang="ts">
    import type { IRoleScript } from "../scripts/types/data";
    import { ref, useId } from "vue";
    import useRoleStore from "../scripts/store/role";

    const store = useRoleStore();
    const inputId = useId();
    const isLoading = ref<boolean>(false);
    const errorMessage = ref<string>("");

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
        let promise: Promise<IRoleScript> = Promise.reject("Empty form");

        if (data.has("script")) {
            promise = processScriptId(data.get("script") as string)
        } else if (data.has("upload")) {
            promise = processUploadedScript(data.get("upload") as File);
        } else if (data.has("url")) {
            promise = processURLScript(data.get("url") as string);
        } else if (data.has("paste")) {
            promise = processPastedScript(data.get("paste") as string);
        } else if (data.has("botc")) {
            processBotcScript(data.get("botc") as string);
        }

        promise
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

    const processURLScript = (url: string) => new Promise<IRoleScript>((resolve, reject) => {
        // TODO
        console.log({ url, resolve, reject });
    });

    const processPastedScript = (data: string) => new Promise<IRoleScript>((resolve, reject) => {

        const { script, error } = handleScript(data);

        if (script) {
            resolve(script);
        } else {
            reject(error);
        }

    });

    const processBotcScript = (name: string) => new Promise<IRoleScript>((resolve, reject) => {
        // TODO
        console.log({ name, resolve, reject });
    });

</script>
