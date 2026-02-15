<template>

    <h1>Pocket Grimoire</h1>

    <ReelLayout node="menu" class="no-list">
        <li><RouterLink :to="{ name: 'setup' }">Setup</RouterLink></li>
        <!-- <li><RouterLink :to="{ name: 'grimoire' }">Grimoire</RouterLink></li>
        <li><RouterLink :to="{ name: 'info-tokens' }">Info Tokens</RouterLink></li>
        <li><RouterLink :to="{ name: 'night-order' }">Night Order</RouterLink></li>
        <li><RouterLink :to="{ name: 'jinxes' }">Jinxes</RouterLink></li> -->

        <li><RouterLink :to="{ name: 'original' }">(Original)</RouterLink></li>
        <li><RouterLink :to="{ name: 'kitchen-sink' }">(Kitchen Sink)</RouterLink></li>
    </ReelLayout>

    <RouterView />
</template>

<script setup lang="ts">
import { RouterView, RouterLink } from "vue-router";
import ReelLayout from "../../layouts/ReelLayout.vue";
</script>
