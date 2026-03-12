<template>

    <ReelLayout node="menu" class="no-list">
        <li><RouterLink :to="{ name: 'select-edition-official' }">Official scripts</RouterLink></li>
        <li><RouterLink :to="{ name: 'select-edition-upload' }">Upload a custom script</RouterLink></li>
        <li><RouterLink :to="{ name: 'select-edition-url' }">Enter a URL</RouterLink></li>
        <li><RouterLink :to="{ name: 'select-edition-clipboard' }">Paste from clipboard</RouterLink></li>
        <li><RouterLink :to="{ name: 'select-edition-botc-scripts' }">Search BotC Scripts</RouterLink></li>
    </ReelLayout>

    <RouterView @success="handleSuccess" />

    <p v-if="isSuccess" style="color: green">Success</p>
    <InvalidRolesDialog />
</template>

<script setup lang="ts">
import { ref } from "vue";
import { RouterLink, RouterView } from "vue-router";
import ReelLayout from "~/components/layouts/ReelLayout.vue";
import InvalidRolesDialog from "./InvalidRolesDialog.vue";

const isSuccess = ref(false);

const handleSuccess = () => {
    isSuccess.value = true;
    window.setTimeout(() => isSuccess.value = false, 3500);
};
</script>