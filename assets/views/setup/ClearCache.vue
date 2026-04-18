<template>

    <p>
        <button type="button" @click="clearCache">Clear cache</button>
    </p>

</template>

<script setup lang="ts">
import { useGlobalStorage } from "~/composables/useStorage";

const storage = useGlobalStorage();

const clearCache = () => {

    if (!window.confirm("Are you sure you want to clear the cache?")) {
        return; // user choice.
    }

    storage.clear();
    window.location.reload();

};
</script>
