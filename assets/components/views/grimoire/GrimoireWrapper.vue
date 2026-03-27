<template>
    <button type="button" @click="showModal">Show modal</button>
    <GrimoirePad />
    <BaseModal ref="modal" title="Testing">
        <p>Hello world</p>
        <p><button type="button" @click="() => modal?.hide()">Close me</button></p>
    </BaseModal>
</template>

<script setup lang="ts">
import { useTemplateRef } from "vue";
import GrimoirePad from "./GrimoirePad.vue";
import BaseModal from "~/components/base/BaseModal.vue";

const modal = useTemplateRef("modal");

const showModal = () => {
    modal.value?.show();
};
</script>
