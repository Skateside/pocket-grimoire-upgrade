<template>
    <BaseForm @submit.prevent="handleSubmit">
        <StackLayout>
            <SetPlayerCount v-model="playerCount" />
            <AssignRoles />
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

const playerCount = defineModel<string>({
    default: String(EGameValues.DEFAULT_NEW_GAME),
});

const store = useGameStore();

const handleSubmit = () => {
    store.setPlayerCount(Number(playerCount.value));
};
</script>
