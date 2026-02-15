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
                <BaseLabel text="Cluster">
                    <BaseInput v-model="basicString" />
                </BaseLabel>
                <BaseLabel text="Cluster Inverse" layout="cluster-inverse">
                    <BaseInput v-model="basicString" />
                </BaseLabel>
                <BaseLabel text="Sidebar" layout="sidebar">
                    <BaseInput v-model="basicString" />
                </BaseLabel>
                <BaseLabel text="Sidebar Inverse" layout="sidebar-inverse">
                    <BaseInput v-model="basicString" />
                </BaseLabel>
                <BaseLabel text="Stack" layout="stack">
                    <BaseInput v-model="basicString" />
                </BaseLabel>
                <BaseLabel text="Stack Inverse" layout="stack-inverse">
                    <BaseInput v-model="basicString" />
                </BaseLabel>
            </StackLayout>

            <h3>Nested</h3>
            <StackLayout gap="0.5em">
                <BaseLabel text="Cluster" :nested="true">
                    <BaseInput v-model="basicString" />
                </BaseLabel>
                <BaseLabel text="Cluster Inverse" layout="cluster-inverse" :nested="true">
                    <BaseInput v-model="basicString" />
                </BaseLabel>
                <BaseLabel text="Sidebar" layout="sidebar" :nested="true">
                    <BaseInput v-model="basicString" />
                </BaseLabel>
                <BaseLabel text="Sidebar Inverse" layout="sidebar-inverse" :nested="true">
                    <BaseInput v-model="basicString" />
                </BaseLabel>
                <BaseLabel text="Stack" layout="stack" :nested="true">
                    <BaseInput v-model="basicString" />
                </BaseLabel>
                <BaseLabel text="Stack Inverse" layout="stack-inverse" :nested="true">
                    <BaseInput v-model="basicString" />
                </BaseLabel>
            </StackLayout>
        </article>

        <article>
            <h2>Inputs</h2>
            
            <h3>Stand-alone inputs</h3>

            <BaseLabel text="Basic input">
                <BaseInput v-model="basicString" />
            </BaseLabel>

            <BaseLabel text="Input number spinner">
                <BaseInputSpinner v-model="basicNumeric" />
            </BaseLabel>
        </article>

    </StackLayout>
</template>

<script setup lang="ts">
import StackLayout from "./layouts/StackLayout.vue";
import BaseButton from "./base/BaseButton.vue";
import BaseLabel from "./base/BaseLabel.vue";
import BaseInput from "./base/BaseInput.vue";
import BaseInputSpinner from "./base/BaseInputSpinner.vue";

const basicString = defineModel<string>("basic-string", { default: "" });
const basicNumeric = defineModel<string>("basic-numeric", { default: "" });
</script>
