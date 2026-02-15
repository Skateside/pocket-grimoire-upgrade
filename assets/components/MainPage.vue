<template>

    <menu>
        <!-- <li><RouterLink :to="{ name: 'home' }">Main</RouterLink></li>
        <li><RouterLink :to="{ name: 'kitchen-sink' }">Kitchen Sink</RouterLink></li> -->
    </menu>

    <RouterView />
</template>

<script setup lang="ts">
import { RouterView/*, RouterLink*/ } from "vue-router";
</script>
