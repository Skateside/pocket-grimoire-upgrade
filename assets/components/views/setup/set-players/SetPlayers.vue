<template>
    <BaseForm memory="set-players" @submit.prevent="handleSubmit">
        <StackLayout>
            <SetPlayerCount v-model="playerCount" />
            <!-- TODO: Optionally name the players -->
            <AssignRoles v-model="roleCounts" :count="Number(playerCount)" />
            <div>
                <BaseButton type="submit">Draw Characters</BaseButton>
            </div>
        </StackLayout>
    </BaseForm>
    <BasePopup ref="popup" />
</template>

<script setup lang="ts">
import type { IRoleCounts } from "~/scripts/types/data";
import { EGameValues } from "~/scripts/enums/data";
import {
    computed,
    useTemplateRef,
} from "vue";
// import useGameStore from "~/scripts/store/game";
// import useRolesStore from "~/scripts/store/roles";
import StackLayout from "~/components/layouts/StackLayout.vue";
import BaseButton from "~/components/base/BaseButton.vue";
import BaseForm from "~/components/base/BaseForm.vue";
import SetPlayerCount from "./SetPlayerCount.vue";
import AssignRoles from "./AssignRoles.vue";
import BasePopup from "~/components/base/BasePopup.vue";

// const gameStore = useGameStore();
// const rolesStore = useRolesStore();

const playerCount = defineModel<string>("player-count", {
    default: String(EGameValues.DEFAULT_NEW_GAME),
});
const roleCounts = defineModel<IRoleCounts>("role-counts", {
    default: {},
});
const rolesSelectedCount = computed(() => {

    return Object
        .values(roleCounts.value)
        .reduce((subTotal, count) => subTotal + Number(count), 0);

});

const popup = useTemplateRef("popup");

const handleSubmit = async () => {
    
    if (!popup.value) {
        return console.warn("Popup hasn't been found");
    }

    const selected = rolesSelectedCount.value;
    const players = Number(playerCount.value);

    if (selected > players) {
        const message = `Too many roles - ${selected} roles for ${players} players - can't draw characters.`;
        popup.value.showAlert(message);
        return; // Validation error.
    } else if (selected < players) {
        const message = `You selected ${rolesSelectedCount.value} role(s) for ${playerCount.value} players - was that correct?`; // TODO: i18n
        if (!(await popup.value.showConfirm(message))) {
            return; // User-cancelled
        }
    }
    
    // set player count
    // gameStore.setPlayerCount(Number(playerCount.value));
    // add roles to tokens

};
</script>
