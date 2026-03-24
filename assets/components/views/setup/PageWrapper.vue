<template>

    <ReelLayout node="menu" class="no-list">
        <li><RouterLink :to="{ name: 'select-edition' }">Select edition</RouterLink></li>
        <li><RouterLink :to="{ name: 'set-players' }">Set players</RouterLink></li>
        <li><RouterLink :to="{ name: 'cache' }">Cache</RouterLink></li>
    </ReelLayout>

    <RouterView />
</template>

<script setup lang="ts">
import { RouterLink, RouterView } from "vue-router";
import ReelLayout from "~/components/layouts/ReelLayout.vue";
</script>