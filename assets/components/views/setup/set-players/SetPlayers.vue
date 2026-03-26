<template>
    <BaseForm memory="set-players" @submit.prevent="handleSubmit">
        <StackLayout>
            <ol>
                <li>
                    <details :name="`set-players-${suffix}`" open>
                        <summary>Set player count</summary>
                        <SetPlayerCount v-model="playerCount" />
                    </details>
                </li>
                <li>
                    <details :name="`set-players-${suffix}`">
                        <summary>Name players (optional)</summary>
                        <NamePlayers v-model="playerNames" :count="Number(playerCount)" />
                    </details>
                </li>
                <li>
                    <details :name="`set-players-${suffix}`">
                        <summary>Choose roles</summary>
                        <AssignRoles v-model="roleCounts" :count="Number(playerCount)" />
                    </details>
                </li>
            </ol>
            <ClusterLayout>
                <BaseButton type="submit" data-action="draw-characters">Draw Characters</BaseButton>
                <BaseButton type="submit" data-action="add-all">Add All</BaseButton>
            </ClusterLayout>
        </StackLayout>
    </BaseForm>
    <BasePopup ref="popup" />
</template>

<script setup lang="ts">
import type { IRoleCounts } from "~/scripts/types/data";
import { EGameValues } from "~/scripts/enums/data";
import { computed, useId, useTemplateRef } from "vue";
// import useGameStore from "~/scripts/stores/game";
// import useRolesStore from "~/scripts/stores/roles";
// import useTokensStore from "~/scripts/stores/tokens";
import ClusterLayout from "~/components/layouts/ClusterLayout.vue";
import StackLayout from "~/components/layouts/StackLayout.vue";
import BaseButton from "~/components/base/BaseButton.vue";
import BaseForm from "~/components/base/BaseForm.vue";
import SetPlayerCount from "./SetPlayerCount.vue";
import NamePlayers from "./NamePlayers.vue";
import AssignRoles from "./AssignRoles.vue";
import BasePopup from "~/components/base/BasePopup.vue";

// const gameStore = useGameStore();
// const rolesStore = useRolesStore();
// const tokensStore = useTokensStore();

const suffix = useId();
const playerCount = defineModel<string>("player-count", {
    default: String(EGameValues.DEFAULT_NEW_GAME),
});
const roleCounts = defineModel<IRoleCounts>("role-counts", {
    default: {},
});
const playerNames = defineModel<string[]>("player-names", {
    default: [],
});
const rolesSelectedCount = computed(() => {

    return Object
        .values(roleCounts.value)
        .reduce((subTotal, count) => subTotal + Number(count), 0);

});

const popup = useTemplateRef("popup");

const handleSubmit = async ({ submitter }: SubmitEvent) => {
    
    if (!popup.value) {
        return console.warn("Popup hasn't been found");
    }

    const selected = rolesSelectedCount.value;
    const players = Number(playerCount.value);

    if (selected > players) {

        const message = `Too many roles - ${selected} roles for ${players} players - can't draw characters.`; // TODO: i18n
        popup.value.showAlert(message);

        return; // Validation error.

    } else if (selected < players) {

        const message = `You selected ${selected} role(s) for ${players} players - was that correct?`; // TODO: i18n

        if (!(await popup.value.showConfirm(message))) {
            return; // User-cancelled
        }

    }
    
    // set player count
    // gameStore.setPlayerCount(players);
    // create tokens
    // -> create any _extra_ tokens and remove any unwanted ones
    // add names to tokens
    console.log({ submitter });
    // if "draw characters" then show character selection popup
    // -> rolesStore.chosenIds = [...]
    // else add roles to tokens
    // -> shuffle roleIds, assign them to the tokens.

};
</script>
