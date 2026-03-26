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
                <!-- TODO: Manually assign (Gardener, Revolutionary etc.) -->
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
import type { IRole, IRoleCounts } from "~/scripts/types/data";
import { EGameValues } from "~/scripts/enums/data";
import { computed, onMounted, useId, useTemplateRef } from "vue";
import { useRouter } from "vue-router";
import useGameStore from "~/scripts/stores/game";
// import useRolesStore from "~/scripts/stores/roles";
import useTokensStore from "~/scripts/stores/tokens";
import ClusterLayout from "~/components/layouts/ClusterLayout.vue";
import StackLayout from "~/components/layouts/StackLayout.vue";
import BaseButton from "~/components/base/BaseButton.vue";
import BaseForm from "~/components/base/BaseForm.vue";
import SetPlayerCount from "./SetPlayerCount.vue";
import NamePlayers from "./NamePlayers.vue";
import AssignRoles from "./AssignRoles.vue";
import BasePopup from "~/components/base/BasePopup.vue";
import { shuffle } from "~/scripts/utilities/arrays";
import { times } from "~/scripts/utilities/numbers";

const router = useRouter();
const gameStore = useGameStore();
// const rolesStore = useRolesStore();
const tokensStore = useTokensStore();

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

onMounted(() => {

    const numberOfPlayers = tokensStore.seats.length;

    if (!numberOfPlayers) {
        return;
    }

    playerCount.value = String(numberOfPlayers);

    tokensStore.seats.forEach((seat, index) => {

        if (seat.roleId) {
            if (!roleCounts.value[seat.roleId]) {
                roleCounts.value[seat.roleId] = 0;
            }
            roleCounts.value[seat.roleId] += 1;
        }

        if (seat.name) {
            playerNames.value[index] = seat.name;
        }

    });

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
    
    gameStore.setPlayerCount(players);

    // NOTE: if `existingTokens` > 0 then don't reposition automatically.
    // const existingTokens = tokensStore.tokens.length;

    tokensStore.roles.forEach((token) => {

        if (!tokensStore.destroy(token)) {
            console.warn("Unable to destroy role token %o", token);
        }

    });
    tokensStore.reminders.forEach((token) => {

        if (!tokensStore.destroy(token)) {
            console.warn("Unable to destroy reminder token %o", token);
        }

    });
    tokensStore.seats.slice(players).forEach((token) => {

        if (!tokensStore.destroy(token)) {
            console.warn("Unable to destroy seat token %o", token);
        }

    });
    times(players - tokensStore.seats.length, () => {
        tokensStore.createSeat();
    });
    tokensStore.seats.forEach((seat) => {

        if (!tokensStore.setSeatRoleId(seat, undefined)) {
            console.warn("Unable to remove roleId from seat %o", seat);
        }

    });

    playerNames.value.forEach((name, index) => {

        const seat = tokensStore.seats[index];
        const playerName = name.trim() || undefined; // Coerce `""` into `undefined`.

        if (seat && !tokensStore.setSeatName(seat, playerName)) {

            console.warn(
                "Unable to set name of seat %o (index %o) to %o",
                seat,
                index,
                playerName,
            );

        }

    });

    const roleIds: IRole["id"][] = shuffle(
        Object.entries(roleCounts.value)
            .map(([roleId, count]) => (new Array(count).fill(roleId)))
            .flat()
    );
    roleIds.forEach((roleId, index) => {

        const seat = tokensStore.seats[index];

        if (seat && !tokensStore.setSeatRoleId(seat, roleId)) {

            console.warn(
                "Unable to set role ID of seat %o (index %o) to %o",
                seat,
                index,
                roleId,
            );

        }

    });

    router
        .push({ name: "grimoire", query: { place: "auto" } })
        .then((failure) => failure && console.error(failure));

    // TODO: use the `data-action` attribute of the submitted to work out the next step.
    console.log({ submitter });
    // if "draw characters" then show character selection popup
    // -> rolesStore.chosenIds = [...]
    // else add roles to tokens
    // -> shuffle roleIds, assign them to the tokens.

};
</script>
