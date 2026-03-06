<template>
    <StackLayout>
        <h1>Kitchen Sink</h1>

        <article>
            <h2>Buttons</h2>
            <p>Default: <BaseButton text="click me" /></p>
            <p>Different node (<code>&lt;a&gt;</code>): <BaseButton node="a" href="#a" text="click me" /></p>
            <p>Different node (<code>&lt;span&gt;</code>): <BaseButton node="span" text="click me" /></p>
            <p>Router Link: <BaseButton text="Main" to="/" /></p>
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

            <BaseLabel label="Basic input">
                <BaseInput v-model="basicString" />
            </BaseLabel>

            <BaseLabel label="Input number spinner">
                <BaseInputSpinner v-model="basicNumeric" />
            </BaseLabel>

            <BaseChoice label="Choice" v-model="basicString" :choices="choices" name="choice" empty-text="Please select" />
            <BaseChoice label="Choice (open)" v-model="basicString" :choices="choices" name="choice" :open="true" />
        </article>

    </StackLayout>
</template>

<script setup lang="ts">
import type { IBaseChoice } from "~/scripts/types/base";
import StackLayout from "./layouts/StackLayout.vue";
import BaseButton from "./base/BaseButton.vue";
import BaseLabel from "./base/BaseLabel.vue";
import BaseInput from "./base/BaseInput.vue";
import BaseInputSpinner from "./base/BaseInputSpinner.vue";
import BaseChoice from "./base/BaseChoice.vue";

const basicString = defineModel<string>("basic-string", { default: "" });
const basicNumeric = defineModel<string>("basic-numeric", { default: "" });
const choices: IBaseChoice[] = [
    { value: "a", text: "Alpha" },
    { value: "b", text: "Bravo" },
    { value: "c", text: "Charlie" },
];
</script>
