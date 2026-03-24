<template>
    <BaseForm @submit.prevent="handleSubmit">
        <StackLayout>
            <SetPlayerCount v-model="playerCount" />
            <AssignRoles v-model="roleCounts" :count="Number(playerCount)" />
            <!-- <div>
                <BaseButton type="submit">Draw Characters</BaseButton>
            </div> -->
        </StackLayout>
    </BaseForm>
</template>

<script setup lang="ts">
import type { IRoleCounts } from "~/scripts/types/data";
import { EGameValues } from "~/scripts/enums/data";
// import { computed } from "vue";
import useGameStore from "~/scripts/store/game";
// import useRolesStore from "~/scripts/store/roles";
import StackLayout from "~/components/layouts/StackLayout.vue";
// import BaseButton from "~/components/base/BaseButton.vue";
import BaseForm from "~/components/base/BaseForm.vue";
import SetPlayerCount from "./set-players/SetPlayerCount.vue";
import AssignRoles from "./set-players/AssignRoles.vue";

const gameStore = useGameStore();
// const rolesStore = useRolesStore();

const playerCount = defineModel<string>("player-count", {
    default: String(EGameValues.DEFAULT_NEW_GAME),
});
const roleCounts = defineModel<IRoleCounts>("role-counts", {
    default: {},
});
// const rolesSelectedCount = computed(() => {

//     return Object
//         .values(roleCounts.value)
//         .reduce((subTotal, count) => subTotal + Number(count), 0);

// });

const handleSubmit = () => {
    // TODO: check that the correct number of roles have been selected, warn if not but allow after confirmation.
    // gameStore.setPlayerCount(Number(playerCount.value));
};
</script>
