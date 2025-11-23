<template>
    <!-- <p>Demon bluffs</p> -->
    
    <ReelLayout :carousel="true">
        <DemonBluffGroup
            v-for="group in store.bluffs"
            :id="group.id"
        >
        </DemonBluffGroup>
    </ReelLayout>

    <p>
        <button
            type="button"
            @click="() => store.addGroup()"
        >
            Add bluff group
        </button>
    </p>

</template>

<script setup lang="ts">
import useBluffsStore from "../scripts/store/bluffs";
import ReelLayout from "./layouts/ReelLayout.vue";
import DemonBluffGroup from "./DemonBluffGroup.vue";

const store = useBluffsStore();
</script>
