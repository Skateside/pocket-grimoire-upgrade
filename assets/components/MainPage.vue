<template>

    <menu>
        <li><RouterLink to="/">Main</RouterLink></li>
        <li><RouterLink to="/kitchensink">Kitchen Sink</RouterLink></li>
    </menu>

    <RouterView />
</template>

<script setup lang="ts">
import { RouterView, RouterLink } from "vue-router";
</script>
