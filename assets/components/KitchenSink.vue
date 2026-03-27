<template>
    <StackLayout>
        <h1>Kitchen Sink</h1>

        <article>
            <h2>Buttons</h2>
            <p>Default: <BaseButton text="click me" /></p>
            <p>Different node (<code>&lt;a&gt;</code>): <BaseButton node="a" href="#a" text="click me" /></p>
            <p>Different node (<code>&lt;span&gt;</code>): <BaseButton node="span" text="click me" /></p>
            <p>Router Link: <BaseButton text="Main (path)" to="/" /></p>
            <p>Router Link: <BaseButton text="Main (name)" :to="{ name: 'main' }" /></p>
            <p>
                Optional slot:
                <BaseButton>
                    <strong>Bold!</strong>
                </BaseButton>
            </p>
        </article>

        <article>
            <h2>Labels</h2>
            <h3>Unnested (default)</h3>
            <StackLayout gap="0.5em">
                <BaseLabel label="Cluster">
                    <BaseInput v-model="basicString" />
                </BaseLabel>
                <BaseLabel label="Cluster Reverse" layout="cluster-reverse">
                    <BaseInput v-model="basicString" />
                </BaseLabel>
                <BaseLabel label="Sidebar" layout="sidebar">
                    <BaseInput v-model="basicString" />
                </BaseLabel>
                <BaseLabel label="Sidebar Reverse" layout="sidebar-reverse">
                    <BaseInput v-model="basicString" />
                </BaseLabel>
                <BaseLabel label="Sidebar Inverse" layout="sidebar-inverse">
                    <BaseInput v-model="basicString" />
                </BaseLabel>
                <BaseLabel label="Stack" layout="stack">
                    <BaseInput v-model="basicString" />
                </BaseLabel>
                <BaseLabel label="Stack Reverse" layout="stack-reverse">
                    <BaseInput v-model="basicString" />
                </BaseLabel>
            </StackLayout>

            <h3>Nested</h3>
            <StackLayout gap="0.5em">
                <BaseLabel label="Cluster" :nested="true">
                    <BaseInput v-model="basicString" />
                </BaseLabel>
                <BaseLabel label="Cluster Reverse" layout="cluster-reverse" :nested="true">
                    <BaseInput v-model="basicString" />
                </BaseLabel>
                <BaseLabel label="Sidebar" layout="sidebar" :nested="true">
                    <BaseInput v-model="basicString" />
                </BaseLabel>
                <BaseLabel label="Sidebar Reverse" layout="sidebar-reverse" :nested="true">
                    <BaseInput v-model="basicString" />
                </BaseLabel>
                <BaseLabel label="Sidebar Inverse" layout="sidebar-inverse" :nested="true">
                    <BaseInput v-model="basicString" />
                </BaseLabel>
                <BaseLabel label="Stack" layout="stack" :nested="true">
                    <BaseInput v-model="basicString" />
                </BaseLabel>
                <BaseLabel label="Stack Reverse" layout="stack-reverse" :nested="true">
                    <BaseInput v-model="basicString" />
                </BaseLabel>
            </StackLayout>
        </article>

        <article>
            <h2>Inputs</h2>
            
            <h3>Stand-alone inputs</h3>

            <StackLayout gap="0.5em">
                <BaseLabel label="Basic input">
                    <BaseInput v-model="basicString" />
                </BaseLabel>

                <BaseLabel label="Input number spinner">
                    <BaseInputSpinner v-model="basicNumeric" />
                </BaseLabel>

                <BaseChoice label="Choice" v-model="basicString" :choices="choices" name="choice" empty-text="Please select" />
                <BaseChoice label="Choice (open)" v-model="basicString" :choices="choices" name="choice" :open="true" />
            </StackLayout>

            <h3>Input with output</h3>
            <BaseLabel label="Range">
                <BaseInput v-model="basicNumeric" type="range" min="0" max="100" step="1" />
                <BaseOutput :value="basicNumeric" />
            </BaseLabel>
        </article>

        <article>
            <h2>Popups</h2>
            <p>A popup is used to draw the user's attention to something specific, or to confirm a user's action.</p>
            <p><button type="button" @click="showPopup('alert')">Alert</button></p>
            <p><button type="button" @click="showPopup('confirm')">Confirm</button></p>
            <p>Result: {{ result }}</p>

            <BasePopup ref="popup" />
        </article>

        <article>
            <h2>Modals</h2>
            <p>A modal is used to show content to the user.</p>
            <p>The background can be hidden with then <code>:cover="true"</code> property. This also prevents the "click off" functionality.</p>
            <StackLayout>
                <BaseLabel label="Cover">
                    <BaseCheckbox v-model="isModalCover" />
                </BaseLabel>
                <BaseLabel label="No heading">
                    <BaseCheckbox v-model="isModalNoHeading" />
                </BaseLabel>
            </StackLayout>
            <p><button id="modal-trigger" type="button" @click="modal?.show()">Show modal</button></p>

            <BaseModal ref="modal" :cover="isModalCover" :no-heading="isModalNoHeading" title="Test Modal">
                <p>We can remove the heading with the <code>:no-heading="true"</code> property and we can modify it with the <code>&lt;template #heading&gt;</code> template (although this will get rid of the default "close" button). We can create custom "close" buttons.</p>
                <p><button type="button" @click="() => modal?.hide()">Close me</button></p>
            </BaseModal>
        </article>

    </StackLayout>
</template>

<script setup lang="ts">
import type { IBaseChoice } from "~/scripts/types/base";
import { ref, useTemplateRef } from "vue";
import StackLayout from "./layouts/StackLayout.vue";
import BaseButton from "./base/BaseButton.vue";
import BaseLabel from "./base/BaseLabel.vue";
import BaseInput from "./base/BaseInput.vue";
import BaseInputSpinner from "./base/BaseInputSpinner.vue";
import BaseCheckbox from "./base/BaseCheckbox.vue";
import BaseChoice from "./base/BaseChoice.vue";
import BaseOutput from "./base/BaseOutput.vue";
import BasePopup from "./base/BasePopup.vue";
import BaseModal from "./base/BaseModal.vue";

const basicString = defineModel<string>("basic-string", { default: "" });
const basicNumeric = defineModel<string>("basic-numeric", { default: "0" });
const choices: IBaseChoice[] = [
    { value: "a", text: "Alpha" },
    { value: "b", text: "Bravo" },
    { value: "c", text: "Charlie" },
];

const result = ref<boolean | null>(null);
const popup = useTemplateRef("popup");

const showPopup = async (type: "alert" | "confirm") => {

    const message = (
        type === "alert"
        ? "An alert only has an \"OK\" option"
        : "A confirm has a \"yes\" and a \"no\" option"
    );
    
    result.value = null;
    result.value = await popup.value?.showPopup(message, type) ?? null;
    // NOTE: `.showAlert(message)` and `.showConfirm(message)` helpers.

};

const modal = useTemplateRef("modal");
const isModalCover = defineModel<boolean>("modal-cover", { default: false });
const isModalNoHeading = defineModel<boolean>("modal-heading", { default: false });
</script>
