<template>
    <BaseForm @submit.prevent="handleSubmit">
        <StackLayout>
            <SetPlayerCount v-model="playerCount" />
            <AssignRoles :count="Number(playerCount)" />
            <!-- <div>
                <BaseButton type="submit">Draw Characters</BaseButton>
            </div> -->
        </StackLayout>
    </BaseForm>
</template>

<script setup lang="ts">
import { EGameValues } from "~/scripts/enums/data";
import useGameStore from "~/scripts/store/game";
import StackLayout from "~/components/layouts/StackLayout.vue";
// import BaseButton from "~/components/base/BaseButton.vue";
import BaseForm from "~/components/base/BaseForm.vue";
import SetPlayerCount from "./set-players/SetPlayerCount.vue";
import AssignRoles from "./set-players/AssignRoles.vue";

const playerCount = defineModel<string>("player-count", {
    default: String(EGameValues.DEFAULT_NEW_GAME),
});
// const roleSelected = defineModel("

const gameStore = useGameStore();

const handleSubmit = () => {
    gameStore.setPlayerCount(Number(playerCount.value));
};
</script>
