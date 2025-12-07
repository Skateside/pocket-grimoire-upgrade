<template>

    <!-- NOTE: This is a temporary file to manage the localStorage -->

    <p>
        <button type="button" @click="clearCache">Clear cache</button>
    </p>
    <p>
        <button type="button" @click="removeCache">Remove cache</button>
    </p>

</template>

<script setup lang="ts">
import type { IStorage } from "../scripts/classes/Storage";
import { inject } from "vue";
// import useBluffsStore from "../scripts/store/bluffs";
// import useFieldsStore from "../scripts/store/fields";
// import useGameStore from "../scripts/store/game";
// import useInfoTokenStore from "../scripts/store/infoToken";
// import useRoleStore from "../scripts/store/role";
// import useTokenStore from "../scripts/store/token";
// import useUiStore from "../scripts/store/ui";

const storage = inject<IStorage>("storage")!;
// const stores = [
//     useBluffsStore(),
//     useFieldsStore(),
//     useGameStore(),
//     useInfoTokenStore(),
//     useRoleStore(),
//     useTokenStore(),
//     useUiStore(),
// ];

const clearCache = () => {

    if (!window.confirm("Are you sure you want to CLEAR the cache?")) {
        return;
    }

    // stores.forEach((store) => store.clear());
    storage.reset();
    window.location.reload();

};

const removeCache = () => {

    if (!window.confirm("Are you sure you want to REMOVE the cache")) {
        return;
    }

    storage.kill();
    window.location.reload();

};
</script>
