<template>
    <ReelLayout node="menu" class="no-list">
        <li><RouterLink :to="{ name: 'main' }">New Layout</RouterLink></li>
        <li><RouterLink :to="{ name: 'kitchen-sink' }">Kitchen Sink</RouterLink></li>
    </ReelLayout>

    <RouterView />
</template>

<script setup lang="ts">
import { onErrorCaptured } from "vue";
import { RouterView, RouterLink } from "vue-router";
import ReelLayout from "../../layouts/ReelLayout.vue";

onErrorCaptured((error, instance, info) => {
    console.log({ error, instance, info });
});
</script>

<style>
.router-link-active {
    font-weight: bold;
}
</style>
