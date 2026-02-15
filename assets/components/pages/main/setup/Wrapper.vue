<template>

    <ReelLayout node="menu" class="no-list">
        <li><RouterLink :to="{ name: 'select-edition' }">Select edition</RouterLink></li>
        <li>Set players</li>
        <li>Assign roles</li>
        <li>Cache</li>
    </ReelLayout>

    <RouterView />
</template>

<script setup lang="ts">
import { RouterLink, RouterView } from "vue-router";
import ReelLayout from "~/components/layouts/ReelLayout.vue";
</script>